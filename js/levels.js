/* ============================================
   NEON QIX - Level Manager & Progression
   ============================================ */

const LEVEL_CONFIG = [
    { level: 1, requiredArea: 65, qixSpeed: 80, qixEvasion: 1.0, maxDirectionChangeInterval: 3.0 },
    { level: 2, requiredArea: 67, qixSpeed: 90, qixEvasion: 1.2, maxDirectionChangeInterval: 2.8 },
    { level: 3, requiredArea: 69, qixSpeed: 100, qixEvasion: 1.3, maxDirectionChangeInterval: 2.5 },
    { level: 4, requiredArea: 71, qixSpeed: 110, qixEvasion: 1.4, maxDirectionChangeInterval: 2.2 },
    { level: 5, requiredArea: 73, qixSpeed: 120, qixEvasion: 1.5, maxDirectionChangeInterval: 2.0 },
    { level: 6, requiredArea: 75, qixSpeed: 130, qixEvasion: 1.6, maxDirectionChangeInterval: 1.8 },
    { level: 7, requiredArea: 76, qixSpeed: 140, qixEvasion: 1.7, maxDirectionChangeInterval: 1.6 },
    { level: 8, requiredArea: 77, qixSpeed: 150, qixEvasion: 1.8, maxDirectionChangeInterval: 1.5 },
    { level: 9, requiredArea: 78, qixSpeed: 160, qixEvasion: 1.9, maxDirectionChangeInterval: 1.4 },
    { level: 10, requiredArea: 80, qixSpeed: 170, qixEvasion: 2.0, maxDirectionChangeInterval: 1.3 },
];

class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevelConfig = null;
        this.loadLevel(1);
    }

    /**
     * Load specific level configuration
     */
    loadLevel(levelNumber) {
        let config = LEVEL_CONFIG.find(l => l.level === levelNumber);
        
        if (!config) {
            // For levels beyond predefined config, scale difficulty exponentially
            const baseLevelConfig = LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
            const levelOffset = levelNumber - baseLevelConfig.level;
            
            config = {
                level: levelNumber,
                requiredArea: Math.min(baseLevelConfig.requiredArea + levelOffset * 0.5, 90),
                qixSpeed: baseLevelConfig.qixSpeed + levelOffset * 15,
                qixEvasion: baseLevelConfig.qixEvasion + levelOffset * 0.1,
                maxDirectionChangeInterval: Math.max(baseLevelConfig.maxDirectionChangeInterval - levelOffset * 0.1, 0.8),
            };
        }
        
        this.currentLevelConfig = config;
        this.applyLevelSettings();
    }

    /**
     * Apply current level settings to game entities
     */
    applyLevelSettings() {
        const config = this.currentLevelConfig;
        
        // Update game state
        this.game.gameState.level = config.level;
        this.game.levelRequiredArea = config.requiredArea;
        
        // Update Qix difficulty
        if (this.game.qix) {
            this.game.qix.baseSpeed = config.qixSpeed;
            this.game.qix.speed = config.qixSpeed;
            this.game.qix.evasionStrength = config.qixEvasion;
            this.game.qix.maxChangeInterval = config.maxDirectionChangeInterval;
        }
    }

    /**
     * Check if current level is completed
     */
    isLevelComplete() {
        if (!this.currentLevelConfig) return false;
        return this.game.gameState.areaPercentage >= this.currentLevelConfig.requiredArea;
    }

    /**
     * Advance to next level
     */
    advanceToNextLevel() {
        const nextLevel = this.game.gameState.level + 1;
        this.game.levelUp(nextLevel);
    }

    /**
     * Get required area percentage for current level
     */
    getRequiredArea() {
        return this.currentLevelConfig ? this.currentLevelConfig.requiredArea : 0;
    }

    /**
     * Get progress to level completion (0-1)
     */
    getProgress() {
        const required = this.getRequiredArea();
        if (required === 0) return 0;
        return Math.min(this.game.gameState.areaPercentage / required, 1.0);
    }
}
