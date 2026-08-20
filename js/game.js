/* ============================================
   NEON QIX - Game Engine (Updated for Step 5)
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
        this.collisionCooldown = 0;

        // Game state
        this.gameState = {
            score: 0,
            level: 1,
            lives: 3,
            areaPercentage: 0,
            totalArea: 0,
            conqueredArea: 0,
        };

        this.levelRequiredArea = 65;

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
        this.enemyManager = null;
        this.territoryManager = null;
        this.collisionManager = null;
        this.levelManager = null;
        this.uiRenderer = new UIRenderer(this.ctx, this.gameState);

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Calculate playground based on screen size
     */
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const padding = 20;
        this.playground.x = padding;
        this.playground.y = padding + 60;
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

        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        const cappedDeltaTime = Math.min(deltaTime, 0.016);

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

        // Update enemies
        if (this.enemyManager) {
            this.enemyManager.update(cappedDeltaTime, this.player);
        }

        // Check collisions
        if (this.collisionCooldown <= 0) {
            this.checkCollisions();
        }

        // Check level completion
        if (this.levelManager && this.levelManager.isLevelComplete()) {
            this.levelManager.advanceToNextLevel();
        }
    }

    /**
     * Check all collisions
     */
    checkCollisions() {
        if (!this.player || !this.qix) return;

        // Check Qix collision
        if (this.collisionManager.checkQixPlayerCollision(this.qix, this.player)) {
            this.onPlayerHit();
            return;
        }

        if (!this.player.isDrawing && this.collisionManager.checkDirectCollision(this.qix, this.player)) {
            this.onPlayerHit();
            return;
        }

        // Check enemies collision
        if (this.enemyManager && this.enemyManager.checkCollisions(this.player, this.collisionManager)) {
            this.onPlayerHit();
            return;
        }
    }

    /**
     * Handle player getting hit
     */
    onPlayerHit() {
        this.gameState.lives--;
        this.collisionCooldown = 0.5;
        
        if (this.gameState.lives <= 0) {
            this.triggerGameOver();
        } else {
            this.player.reset();
            this.qix.respawn();
            if (this.enemyManager) {
                this.enemyManager.reset();
            }
        }
    }

    /**
     * Advance to next level
     */
    levelUp(nextLevel) {
        this.gameState.score += 1000;
        
        this.levelManager.loadLevel(nextLevel);
        
        this.gameState.conqueredArea = 0;
        this.gameState.areaPercentage = 0;
        
        this.territoryManager = new TerritoryManager(this);
        this.player.reset();
        this.qix.respawn();
        
        // Update enemy count for new level
        if (this.enemyManager) {
            this.enemyManager.updateEnemyCount();
            this.enemyManager.reset();
        }
    }

    /**
     * Render everything
     */
    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.showStartScreen) {
            this.uiRenderer.renderStartScreen();
        } else if (this.isGameOver) {
            this.uiRenderer.renderGameOver();
        } else {
            this.uiRenderer.renderPlaygroundBorder(this.playground);

            if (this.territoryManager) {
                this.territoryManager.render(this.ctx);
            }

            if (this.qix) {
                this.qix.render(this.ctx);
            }

            if (this.enemyManager) {
                this.enemyManager.render(this.ctx);
            }

            if (this.player) {
                this.player.render(this.ctx);
            }

            this.uiRenderer.renderHUD();
            
            if (this.levelManager) {
                this.uiRenderer.renderLevelProgress(this.levelManager);
            }
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
        if (!this.levelManager) {
            this.levelManager = new LevelManager(this);
        } else {
            this.levelManager.loadLevel(1);
        }
        if (!this.enemyManager) {
            this.enemyManager = new EnemyManager(this);
        } else {
            this.enemyManager.updateEnemyCount();
            this.enemyManager.reset();
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
