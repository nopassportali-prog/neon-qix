/* ============================================
   NEON QIX - Additional Enemies
   ============================================ */

class Enemy {
    constructor(game, type = 'seeker') {
        this.game = game;
        this.type = type; // 'seeker', 'random', 'bouncer'
        this.x = 0;
        this.y = 0;
        this.size = 6;
        this.speed = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.angle = Math.random() * Math.PI * 2;
        
        // Behavior timers
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 2.0;
        
        // Type-specific properties
        if (type === 'seeker') {
            this.speed = 70;
            this.color = '#FF6B00';
            this.detectionRange = 120;
            this.aggression = 0.6;
        } else if (type === 'random') {
            this.speed = 50;
            this.color = '#00FF88';
            this.changeDirectionInterval = 1.5;
        } else if (type === 'bouncer') {
            this.speed = 90;
            this.color = '#FFD700';
            this.bounceForce = 1.2;
        }
        
        this.respawn();
    }

    /**
     * Respawn at random location
     */
    respawn() {
        const pg = this.game.playground;
        this.x = pg.x + Math.random() * pg.width * 0.6 + pg.width * 0.2;
        this.y = pg.y + Math.random() * pg.height * 0.6 + pg.height * 0.2;
        
        this.angle = Math.random() * Math.PI * 2;
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        this.changeDirectionTimer = this.changeDirectionInterval;
    }

    /**
     * Update enemy based on type
     */
    update(deltaTime, player) {
        if (this.type === 'seeker') {
            this.updateSeeker(deltaTime, player);
        } else if (this.type === 'random') {
            this.updateRandom(deltaTime);
        } else if (this.type === 'bouncer') {
            this.updateBouncer(deltaTime);
        }
    }

    /**
     * Seeker enemy - actively chases player
     */
    updateSeeker(deltaTime, player) {
        const pg = this.game.playground;
        
        // Check distance to player
        if (player) {
            const dist = Math.hypot(this.x - player.x, this.y - player.y);
            
            if (dist < this.detectionRange) {
                // Chase player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const chaseAngle = Math.atan2(dy, dx);
                
                // Blend with current direction
                this.angle = this.angle * (1 - this.aggression) + chaseAngle * this.aggression;
                
                this.velocityX = Math.cos(this.angle) * this.speed;
                this.velocityY = Math.sin(this.angle) * this.speed;
                this.changeDirectionTimer = this.changeDirectionInterval;
            }
        }
        
        // Occasional random turn
        this.changeDirectionTimer -= deltaTime;
        if (this.changeDirectionTimer <= 0) {
            const angleChange = (Math.random() - 0.5) * Math.PI / 4;
            this.angle += angleChange;
            this.velocityX = Math.cos(this.angle) * this.speed;
            this.velocityY = Math.sin(this.angle) * this.speed;
            this.changeDirectionTimer = this.changeDirectionInterval;
        }
        
        // Move
        let newX = this.x + this.velocityX * deltaTime;
        let newY = this.y + this.velocityY * deltaTime;
        
        // Bounce off walls
        const margin = 8;
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
     * Random enemy - moves unpredictably
     */
    updateRandom(deltaTime) {
        const pg = this.game.playground;
        
        this.changeDirectionTimer -= deltaTime;
        if (this.changeDirectionTimer <= 0) {
            this.angle = Math.random() * Math.PI * 2;
            this.velocityX = Math.cos(this.angle) * this.speed;
            this.velocityY = Math.sin(this.angle) * this.speed;
            this.changeDirectionTimer = this.changeDirectionInterval;
        }
        
        let newX = this.x + this.velocityX * deltaTime;
        let newY = this.y + this.velocityY * deltaTime;
        
        // Bounce
        const margin = 8;
        if (newX < pg.x + margin || newX > pg.x + pg.width - margin) {
            this.velocityX *= -1;
            newX = Math.max(pg.x + margin, Math.min(pg.x + pg.width - margin, newX));
        }
        if (newY < pg.y + margin || newY > pg.y + pg.height - margin) {
            this.velocityY *= -1;
            newY = Math.max(pg.y + margin, Math.min(pg.y + pg.height - margin, newY));
        }
        
        this.x = newX;
        this.y = newY;
    }

    /**
     * Bouncer enemy - bounces rapidly, hard to predict
     */
    updateBouncer(deltaTime) {
        const pg = this.game.playground;
        
        let newX = this.x + this.velocityX * deltaTime;
        let newY = this.y + this.velocityY * deltaTime;
        
        // Aggressive bouncing
        const margin = 6;
        if (newX < pg.x + margin || newX > pg.x + pg.width - margin) {
            this.velocityX *= -this.bounceForce;
            newX = Math.max(pg.x + margin, Math.min(pg.x + pg.width - margin, newX));
        }
        if (newY < pg.y + margin || newY > pg.y + pg.height - margin) {
            this.velocityY *= -this.bounceForce;
            newY = Math.max(pg.y + margin, Math.min(pg.y + pg.height - margin, newY));
        }
        
        // Random direction change
        if (Math.random() < 0.02) {
            this.angle = Math.random() * Math.PI * 2;
            this.velocityX = Math.cos(this.angle) * this.speed;
            this.velocityY = Math.sin(this.angle) * this.speed;
        }
        
        this.x = newX;
        this.y = newY;
    }

    /**
     * Render enemy
     */
    render(ctx) {
        // Glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    /**
     * Get bounding box
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

class EnemyManager {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.updateEnemyCount();
    }

    /**
     * Update enemy count based on level
     */
    updateEnemyCount() {
        const level = this.game.gameState.level;
        const targetCount = Math.min(Math.floor((level - 1) / 2) + 1, 5);
        
        // Add or remove enemies to reach target count
        while (this.enemies.length < targetCount) {
            const types = ['seeker', 'random', 'bouncer'];
            const type = types[this.enemies.length % types.length];
            this.enemies.push(new Enemy(this.game, type));
        }
        
        while (this.enemies.length > targetCount) {
            this.enemies.pop();
        }
    }

    /**
     * Update all enemies
     */
    update(deltaTime, player) {
        for (let enemy of this.enemies) {
            enemy.update(deltaTime, player);
        }
    }

    /**
     * Render all enemies
     */
    render(ctx) {
        for (let enemy of this.enemies) {
            enemy.render(ctx);
        }
    }

    /**
     * Check collision with all enemies
     */
    checkCollisions(player, collisionManager) {
        for (let enemy of this.enemies) {
            if (collisionManager.checkQixPlayerCollision(enemy, player)) {
                return true;
            }
            if (!player.isDrawing && collisionManager.checkDirectCollision(enemy, player)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reset all enemies
     */
    reset() {
        for (let enemy of this.enemies) {
            enemy.respawn();
        }
    }
}
