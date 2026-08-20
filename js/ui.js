/* ============================================
   NEON QIX - UI Renderer (Updated for Step 4)
   ============================================ */

class UIRenderer {
    constructor(ctx, gameState) {
        this.ctx = ctx;
        this.gameState = gameState;
        this.padding = 15;
        this.fontSize = 14;
    }

    /**
     * Render HUD (Score, Level, Lives, Area)
     */
    renderHUD() {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${this.fontSize}px 'Courier New'`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Top-left: Score
        ctx.fillStyle = '#00F6FF';
        ctx.fillText(`SCORE: ${this.gameState.score}`, this.padding, this.padding);

        // Top-center: Level
        ctx.fillText(`LEVEL: ${this.gameState.level}`, this.padding, this.padding + 25);

        // Top-right: Lives
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FF18D8';
        ctx.fillText(`LIVES: ${this.gameState.lives}`, ctx.canvas.width - this.padding, this.padding);

        // Area percentage
        ctx.fillStyle = '#9D5CFF';
        ctx.fillText(`AREA: ${this.gameState.areaPercentage.toFixed(1)}%`, ctx.canvas.width - this.padding, this.padding + 25);
    }

    /**
     * Render level progress bar
     */
    renderLevelProgress(levelManager) {
        const ctx = this.ctx;
        const requiredArea = levelManager.getRequiredArea();
        const progress = levelManager.getProgress();
        
        // Progress bar at bottom of screen
        const barX = this.padding;
        const barY = ctx.canvas.height - 25;
        const barWidth = ctx.canvas.width - this.padding * 2;
        const barHeight = 4;
        
        // Background bar
        ctx.fillStyle = 'rgba(0, 246, 255, 0.1)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress bar
        ctx.fillStyle = '#00F6FF';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Progress text
        ctx.font = `10px 'Courier New'`;
        ctx.fillStyle = '#00F6FF';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.gameState.areaPercentage.toFixed(0)}% / ${requiredArea.toFixed(0)}%`, ctx.canvas.width / 2, barY - 5);
    }

    /**
     * Render Start Screen
     */
    renderStartScreen() {
        const ctx = this.ctx;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Title
        ctx.font = 'bold 48px Courier New';
        ctx.fillStyle = '#00F6FF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 246, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText('NEON QIX', centerX, centerY - 80);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#9D5CFF';
        ctx.fillText('TERRITORY CAPTURE', centerX, centerY - 20);

        // Instructions
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('TAP TO START', centerX, centerY + 60);

        // Pulsing effect
        const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('TAP TO START', centerX, centerY + 60);
        ctx.globalAlpha = 1.0;
    }

    /**
     * Render Game Over Screen
     */
    renderGameOver() {
        const ctx = this.ctx;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Game Over text
        ctx.font = 'bold 44px Courier New';
        ctx.fillStyle = '#FF18D8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 24, 216, 0.6)';
        ctx.shadowBlur = 20;
        ctx.fillText('GAME OVER', centerX, centerY - 80);
        ctx.shadowBlur = 0;

        // Stats
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#00F6FF';
        ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, centerX, centerY - 20);
        ctx.fillText(`LEVEL REACHED: ${this.gameState.level}`, centerX, centerY + 10);
        ctx.fillStyle = '#9D5CFF';
        ctx.fillText(`AREA: ${this.gameState.areaPercentage.toFixed(1)}%`, centerX, centerY + 40);

        // Restart instruction
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('TAP TO RESTART', centerX, centerY + 80);
    }

    /**
     * Render playground border
     */
    renderPlaygroundBorder(playground) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#00F6FF';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = 'rgba(0, 246, 255, 0.4)';
        ctx.shadowBlur = 8;

        ctx.strokeRect(
            playground.x,
            playground.y,
            playground.width,
            playground.height
        );

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}
