/* ============================================
   NEON QIX - Player Class
   ============================================ */

class Player {
    constructor(game, startX, startY) {
        this.game = game;
        this.x = startX;
        this.y = startY;
        this.size = 6; // Small neon point
        this.speed = 120; // pixels per second
        this.direction = { x: 1, y: 0 }; // Start moving right
        this.nextDirection = { x: 1, y: 0 }; // Queued direction change
        this.color = '#FFFFFF';
        this.glowColor = 'rgba(255, 255, 255, 0.5)';

        // Line drawing state
        this.isDrawing = false;
        this.drawnPath = []; // Array of {x, y} points
        this.pathStartX = startX;
        this.pathStartY = startY;
        this.lineWidth = 1.5;
        this.lineColor = '#00F6FF';

        // Safety state
        this.onSafeBorder = true;
        this.safeArea = new Path2D();
    }

    /**
     * Update player position and state
     */
    update(deltaTime, inputManager, safeAreas) {
        // Get input direction
        const inputDir = inputManager.getDirection();
        if (inputDir.x !== 0 || inputDir.y !== 0) {
            this.nextDirection = inputDir;
        }

        // Try to change direction (prevents impossible moves like 180 reversals)
        if (this.canChangeDirection(this.nextDirection)) {
            this.direction = this.nextDirection;
        }

        // Calculate movement
        const moveDistance = this.speed * deltaTime;
        let newX = this.x + this.direction.x * moveDistance;
        let newY = this.y + this.direction.y * moveDistance;

        // Keep player in playground bounds
        const pg = this.game.playground;
        const margin = 5;
        if (newX < pg.x + margin) newX = pg.x + margin;
        if (newX > pg.x + pg.width - margin) newX = pg.x + pg.width - margin;
        if (newY < pg.y + margin) newY = pg.y + margin;
        if (newY > pg.y + pg.height - margin) newY = pg.y + pg.height - margin;

        // Check if on safe area
        const isOnSafe = this.isOnSafeArea(newX, newY, safeAreas);

        if (this.onSafeBorder && !isOnSafe) {
            // Starting to draw a line
            this.isDrawing = true;
            this.drawnPath = [{ x: this.x, y: this.y }];
            this.pathStartX = this.x;
            this.pathStartY = this.y;
        } else if (!this.onSafeBorder && isOnSafe) {
            // Line completed - territory will be processed
            this.isDrawing = false;
            // Trigger territory capture logic
            this.game.territoryManager.processLineClosure(this.drawnPath);
            this.drawnPath = [];
        }

        // Update position
        this.x = newX;
        this.y = newY;
        this.onSafeBorder = isOnSafe;

        // Record path if drawing
        if (this.isDrawing) {
            this.drawnPath.push({ x: this.x, y: this.y });
        }
    }

    /**
     * Check if position is on safe area
     */
    isOnSafeArea(x, y, safeAreas) {
        if (!safeAreas || safeAreas.length === 0) return true; // No safe areas yet = all safe

        for (let area of safeAreas) {
            if (area.contains(x, y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if direction change is valid (no 180 reversal)
     */
    canChangeDirection(newDir) {
        // Prevent 180-degree reversals
        if (this.direction.x === -newDir.x && this.direction.y === -newDir.y) {
            return false;
        }
        return true;
    }

    /**
     * Render player
     */
    render(ctx) {
        // Player glow
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
        ctx.fill();

        // Player body
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw current path line
        if (this.isDrawing && this.drawnPath.length > 1) {
            ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = 'rgba(0, 246, 255, 0.4)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(this.drawnPath[0].x, this.drawnPath[0].y);
            for (let i = 1; i < this.drawnPath.length; i++) {
                ctx.lineTo(this.drawnPath[i].x, this.drawnPath[i].y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    /**
     * Reset to center of playground
     */
    reset() {
        const pg = this.game.playground;
        this.x = pg.x + pg.width / 2;
        this.y = pg.y + pg.height / 2;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.isDrawing = false;
        this.drawnPath = [];
        this.onSafeBorder = true;
    }
}
