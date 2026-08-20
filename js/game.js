/* ============================================
   NEON QIX - Game Engine & State Management
   ============================================ */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isPaused = false;
        this.isRunning = false;
        this.isGameOver = false;
        this.showStartScreen = true;
        this.animationId = null;

        // Game state
        this.gameState = {
            score: 0,
            level: 1,
            lives: 3,
            areaPercentage: 0,
            totalArea: 0,
            conqueredArea: 0,
        };

        // Playground configuration
        this.playground = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            totalPixels: 0,
        };

        this.uiRenderer = new UIRenderer(this.ctx, this.gameState);

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Calculate playground based on screen size
     */
    handleResize() {
        // Set canvas size to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Safe area (account for notches, status bars)
        const padding = 40;
        this.playground.x = padding;
        this.playground.y = padding + 60; // Extra space for HUD
        this.playground.width = this.canvas.width - padding * 2;
        this.playground.height = this.canvas.height - padding * 2 - 60;
        this.playground.totalPixels = this.playground.width * this.playground.height;
    }

    /**
     * Start the game
     */
    start() {
        this.isRunning = true;
        this.showStartScreen = true;
        this.gameLoop();
    }

    /**
     * Pause the game
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the game
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Main game loop
     */
    gameLoop = () => {
        if (!this.isPaused) {
            this.update();
            this.render();
        }

        this.animationId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game logic
     */
    update() {
        // Placeholder for now - will be filled in next steps
    }

    /**
     * Render everything
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.showStartScreen) {
            this.uiRenderer.renderStartScreen();
        } else if (this.isGameOver) {
            this.uiRenderer.renderGameOver();
        } else {
            // Render playground border
            this.uiRenderer.renderPlaygroundBorder(this.playground);

            // Render HUD
            this.uiRenderer.renderHUD();
        }
    }

    /**
     * Handle start screen tap
     */
    startGame() {
        this.showStartScreen = false;
        this.isGameOver = false;
        this.gameState.score = 0;
        this.gameState.level = 1;
        this.gameState.lives = 3;
        this.gameState.areaPercentage = 0;
    }

    /**
     * Handle game over
     */
    triggerGameOver() {
        this.isGameOver = true;
    }

    /**
     * Restart game
     */
    restartGame() {
        this.startGame();
    }
}
