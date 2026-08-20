/* ============================================
   NEON QIX - Qix Enemy (Main Antagonist)
   ============================================ */

class Qix {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.size = 8;
        this.baseSpeed = 80; // pixels per second
        this.speed = this.baseSpeed;
        
        // Movement properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        
        // Behavior properties
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 1.5; // seconds between direction changes
        this.minChangeInterval = 0.8;
        this.maxChangeInterval = 3.0;
        
        // Evasion properties
        this.playerDetectionRange = 150;
        this.evasionStrength = 1.2;
        this.evasionTimer = 0;
        this.isEvading = false;
        
        // Visual properties
        this.colors = ['#FF18D8', '#9D5CFF'];
        this.currentColorIndex = 0;
        this.colorChangeTimer = 0;
        this.colorChangeInterval = 0.5;
        
        // Initialize
        this.respawn();
    }

    /**
     * Spawn Qix at a random location in free territory
     */
    respawn() {
        const pg = this.game.playground;
        this.x = pg.x + Math.random() * pg.width * 0.6 + pg.width * 0.2;
        this.y = pg.y + Math.random() * pg.height * 0.6 + pg.height * 0.2;
        
        this.angle = Math.random() * Math.PI * 2;
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        this.changeDirectionTimer = this.getRandomChangeInterval();
        this.isEvading = false;
    }

    /**
     * Get random direction change interval
     */
    getRandomChangeInterval() {
        return this.minChangeInterval + Math.random() * (this.maxChangeInterval - this.minChangeInterval);
    }

    /**
     * Update Qix movement and behavior
     */
    update(deltaTime, player) {
        const pg = this.game.playground;
        
        // Check for player proximity (evasion behavior)
        if (player) {
            const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
            this.isEvading = distToPlayer < this.playerDetectionRange;
            
            if (this.isEvading) {
                this.evasionTimer = 0.3; // Stay in evasion mode briefly
                this.evadeFromPlayer(player);
            }
        }
        
        // Reduce evasion timer
        if (this.evasionTimer > 0) {
            this.evasionTimer -= deltaTime;
        } else {
            this.isEvading = false;
        }
        
        // Update direction change timer
        this.changeDirectionTimer -= deltaTime;
        if (this.changeDirectionTimer <= 0) {
            this.changeDirection();
            this.changeDirectionTimer = this.getRandomChangeInterval();
        }
        
        // Update color timer (pulsing effect)
        this.colorChangeTimer -= deltaTime;
        if (this.colorChangeTimer <= 0) {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
            this.colorChangeTimer = this.colorChangeInterval;
        }
        
        // Apply movement
        let newX = this.x + this.velocityX * deltaTime;
        let newY = this.y + this.velocityY * deltaTime;
        
        // Boundary collision - bounce
        const margin = 10;
        if (newX < pg.x + margin || newX > pg.x + pg.width - margin) {
            this.velocityX *= -1;
            this.angle = Math.atan2(this.velocityY, this.velocityX);
            newX = Math.max(pg.x + margin, Math.min(pg.x + pg.width - margin, newX));
        }
        if (newY < pg.y + margin || newY > pg.y + pg.height - margin) {
            this.velocityY *= -1;
            this.angle = Math.atan2(this.velocityY, this.velocityX);
            newY = Math.max(pg.y + margin, Math.min(pg.y + pg.height - margin, newY));
        }
        
        this.x = newX;
        this.y = newY;
    }

    /**
     * Change direction with slight curve (not fully random)
     */
    changeDirection() {
        // Add random angular change for organic movement
        const maxAngleChange = Math.PI / 3; // 60 degrees max
        const angleChange = (Math.random() - 0.5) * maxAngleChange * 2;
        
        this.angle += angleChange;
        
        // Apply new velocity
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
    }

    /**
     * Evasion behavior - move away from player
     */
    evadeFromPlayer(player) {
        // Calculate angle away from player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const evasionAngle = Math.atan2(dy, dx);
        
        // Blend evasion with current direction
        const blendFactor = 0.4;
        this.angle = this.angle * (1 - blendFactor) + evasionAngle * blendFactor;
        
        // Increase speed slightly during evasion
        this.speed = this.baseSpeed * this.evasionStrength;
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
    }

    /**
     * Render Qix
     */
    render(ctx) {
        const color = this.colors[this.currentColorIndex];
        
        // Qix glow
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Qix outer ring
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Qix body (geometric, multi-pointed star shape)
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        
        // Draw star-like shape
        this.drawQixShape(ctx);
        
        ctx.shadowBlur = 0;
    }

    /**
     * Draw geometric Qix shape (multi-pointed star)
     */
    drawQixShape(ctx) {
        const points = 6;
        ctx.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? this.size : this.size * 0.6;
            const angle = (i / (points * 2)) * Math.PI * 2 + this.angle;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Get bounding box for collision detection
     */
    getBounds() {
        return {
            x: this.x - this.size,
            y: this.y - this.size,
            width: this.size * 2,
            height: this.size * 2,
        };
    }
}
