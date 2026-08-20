/* ============================================
   NEON QIX - Game Engine (Updated for Step 3)
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
        this.lastFrameTime = Date.now();
        this.collisionCooldown = 0; // Prevent multiple collisions in one frame

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

        // Managers
        this.inputManager = null;
        this.player = null;
        this.qix = null;
        this.territoryManager = null;
        this.collisionManager = null;
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
        const padding = 20;
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
        if (this.showStartScreen || this.isGameOver) return;

        // Calculate delta time
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = now;

        // Cap delta time to prevent huge jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.016); // Max 60 FPS

        // Update cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= cappedDeltaTime;
        }

        // Update player
        if (this.player) {
            this.player.update(cappedDeltaTime, this.inputManager, this.territoryManager.safeAreas);
        }

        // Update Qix
        if (this.qix) {
            this.qix.update(cappedDeltaTime, this.player);
        }

        // Check collisions
        if (this.collisionCooldown <= 0) {
            this.checkCollisions();
        }
    }

    /**
     * Check all collisions
     */
    checkCollisions() {
        if (!this.player || !this.qix) return;

        // Check if Qix hits player's drawn line
        if (this.collisionManager.checkQixPlayerCollision(this.qix, this.player)) {
            this.onPlayerHit();
            return;
        }

        // Check if Qix hits player directly (while on safe area)
        if (!this.player.isDrawing && this.collisionManager.checkDirectCollision(this.qix, this.player)) {
            this.onPlayerHit();
            return;
        }
    }

    /**
     * Handle player getting hit
     */
    onPlayerHit() {
        this.gameState.lives--;
        this.collisionCooldown = 0.5; // Collision cooldown
        
        if (this.gameState.lives <= 0) {
            this.triggerGameOver();
        } else {
            // Reset player and line
            this.player.reset();
            this.qix.respawn();
        }
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

            // Render territory
            if (this.territoryManager) {
                this.territoryManager.render(this.ctx);
            }

            // Render Qix
            if (this.qix) {
                this.qix.render(this.ctx);
            }

            // Render player
            if (this.player) {
                this.player.render(this.ctx);
            }

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
        this.gameState.conqueredArea = 0;

        // Initialize managers
        if (!this.inputManager) {
            this.inputManager = new InputManager(this);
        }
        if (!this.territoryManager) {
            this.territoryManager = new TerritoryManager(this);
        }
        if (!this.collisionManager) {
            this.collisionManager = new CollisionManager(this);
        }
        if (!this.player) {
            const startX = this.playground.x + this.playground.width / 2;
            const startY = this.playground.y + this.playground.height / 2;
            this.player = new Player(this, startX, startY);
        } else {
            this.player.reset();
        }
        if (!this.qix) {
            this.qix = new Qix(this);
        } else {
            this.qix.respawn();
        }

        this.lastFrameTime = Date.now();
        this.collisionCooldown = 0;
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
