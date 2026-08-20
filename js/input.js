/* ============================================
   NEON QIX - Input Manager (Updated for Step 6)
   ============================================ */

class InputManager {
    constructor(game) {
        this.game = game;
        this.currentDirection = { x: 0, y: 0 };
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchActive = false;
        this.swipeThreshold = 10;
        this.setupEventListeners();
    }

    /**
     * Setup all input event listeners
     */
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch input
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // Click for start/restart/how-to-play
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('touchend', (e) => this.handleScreenTap(e));
    }

    /**
     * Handle keyboard down
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.currentDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this.currentDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this.currentDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this.currentDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
            case '?':
            case 'h':
                // Toggle how-to-play
                if (this.game.showStartScreen && !this.game.isGameOver) {
                    this.game.uiRenderer.showHowToPlay = !this.game.uiRenderer.showHowToPlay;
                }
                e.preventDefault();
                break;
        }
    }

    /**
     * Handle keyboard up
     */
    handleKeyUp(e) {
        // Keep last direction (momentum)
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        if (!this.game.isRunning || this.game.showStartScreen) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchActive = true;
    }

    /**
     * Handle touch move (swipe detection)
     */
    handleTouchMove(e) {
        if (!this.touchActive || !this.game.isRunning || this.game.showStartScreen) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < this.swipeThreshold) return;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.currentDirection = { x: deltaX > 0 ? 1 : -1, y: 0 };
        } else {
            this.currentDirection = { x: 0, y: deltaY > 0 ? 1 : -1 };
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        this.touchActive = false;
    }

    /**
     * Handle screen tap (for start/restart/how-to-play)
     */
    handleScreenTap(e) {
        if (e.touches && e.touches.length > 0) return; // Ignore if still touching

        if (this.game.showStartScreen) {
            // Check if how-to-play is shown
            if (this.game.uiRenderer.showHowToPlay) {
                this.game.uiRenderer.showHowToPlay = false;
            } else {
                this.game.startGame();
            }
        } else if (this.game.isGameOver) {
            this.game.restartGame();
        }
    }

    /**
     * Handle click (for desktop)
     */
    handleClick(e) {
        if (this.game.showStartScreen) {
            if (this.game.uiRenderer.showHowToPlay) {
                this.game.uiRenderer.showHowToPlay = false;
            } else {
                this.game.startGame();
            }
        } else if (this.game.isGameOver) {
            this.game.restartGame();
        }
    }

    /**
     * Get current direction
     */
    getDirection() {
        return this.currentDirection;
    }

    /**
     * Set direction
     */
    setDirection(x, y) {
        this.currentDirection = { x, y };
    }
}
