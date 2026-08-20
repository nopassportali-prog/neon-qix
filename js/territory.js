/* ============================================
   NEON QIX - Territory Manager (Flood-Fill)
   ============================================ */

class TerritoryManager {
    constructor(game) {
        this.game = game;
        this.safeAreas = []; // Array of Path2D objects representing conquered areas
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.cellSize = 4; // Grid resolution for flood-fill
        this.grid = []; // 2D grid for flood-fill algorithm
        
        this.initializeGrid();
    }

    /**
     * Initialize grid for flood-fill
     */
    initializeGrid() {
        const pg = this.game.playground;
        this.gridWidth = Math.ceil(pg.width / this.cellSize);
        this.gridHeight = Math.ceil(pg.height / this.cellSize);
        
        // Initialize grid (0 = free, 1 = conquered)
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = 0;
            }
        }
    }

    /**
     * Convert world coordinates to grid coordinates
     */
    worldToGrid(worldX, worldY) {
        const pg = this.game.playground;
        const gridX = Math.floor((worldX - pg.x) / this.cellSize);
        const gridY = Math.floor((worldY - pg.y) / this.cellSize);
        return { x: gridX, y: gridY };
    }

    /**
     * Convert grid coordinates to world coordinates
     */
    gridToWorld(gridX, gridY) {
        const pg = this.game.playground;
        const worldX = pg.x + gridX * this.cellSize;
        const worldY = pg.y + gridY * this.cellSize;
        return { x: worldX, y: worldY };
    }

    /**
     * Process line closure and conquer territory
     */
    processLineClosure(drawnPath) {
        if (drawnPath.length < 3) return; // Need at least 3 points for a closed line

        // Mark drawn path on grid
        this.markPathOnGrid(drawnPath);

        // Find the area that was enclosed
        const floodResult = this.floodFillFromPath(drawnPath);
        
        if (floodResult.conqueredArea > 0) {
            // Award points and update state
            this.game.gameState.conqueredArea += floodResult.conqueredArea;
            this.game.gameState.areaPercentage = (this.game.gameState.conqueredArea / this.game.playground.totalPixels) * 100;
            this.game.gameState.score += Math.floor(floodResult.conqueredArea / 100);
        }
    }

    /**
     * Mark path points on grid
     */
    markPathOnGrid(path) {
        for (let point of path) {
            const gridPos = this.worldToGrid(point.x, point.y);
            if (gridPos.x >= 0 && gridPos.x < this.gridWidth && 
                gridPos.y >= 0 && gridPos.y < this.gridHeight) {
                // Mark as barrier (2 = line)
                this.grid[gridPos.y][gridPos.x] = 2;
            }
        }
    }

    /**
     * Flood-fill algorithm to detect enclosed area
     */
    floodFillFromPath(path) {
        if (path.length < 3) return { conqueredArea: 0, conqueredCells: [] };

        // Find a point inside the enclosed area
        const startPoint = this.findInteriorPoint(path);
        if (!startPoint) return { conqueredArea: 0, conqueredCells: [] };

        const startGrid = this.worldToGrid(startPoint.x, startPoint.y);
        const visited = new Set();
        const queue = [startGrid];
        let conqueredCells = [];

        // Flood fill
        while (queue.length > 0) {
            const cell = queue.shift();
            const key = `${cell.x},${cell.y}`;

            if (visited.has(key)) continue;
            if (cell.x < 0 || cell.x >= this.gridWidth) continue;
            if (cell.y < 0 || cell.y >= this.gridHeight) continue;
            if (this.grid[cell.y][cell.x] !== 0) continue; // Stop at barriers

            visited.add(key);
            conqueredCells.push(cell);
            this.grid[cell.y][cell.x] = 1; // Mark as conquered

            // Add neighbors
            queue.push({ x: cell.x + 1, y: cell.y });
            queue.push({ x: cell.x - 1, y: cell.y });
            queue.push({ x: cell.x, y: cell.y + 1 });
            queue.push({ x: cell.x, y: cell.y - 1 });
        }

        const conqueredArea = conqueredCells.length * (this.cellSize * this.cellSize);
        return { conqueredArea, conqueredCells };
    }

    /**
     * Find a point inside the enclosed area (uses centroid)
     */
    findInteriorPoint(path) {
        if (path.length === 0) return null;

        // Calculate centroid
        let sumX = 0, sumY = 0;
        for (let point of path) {
            sumX += point.x;
            sumY += point.y;
        }

        return {
            x: sumX / path.length,
            y: sumY / path.length
        };
    }

    /**
     * Render conquered areas
     */
    render(ctx) {
        const pg = this.game.playground;
        
        // Render conquered cells as filled areas
        ctx.fillStyle = 'rgba(0, 246, 255, 0.1)';
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === 1) {
                    const worldPos = this.gridToWorld(x, y);
                    ctx.fillRect(worldPos.x, worldPos.y, this.cellSize, this.cellSize);
                }
            }
        }
    }
}
