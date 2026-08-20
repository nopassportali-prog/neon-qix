/* ============================================
   NEON QIX - Storage Manager (Highscores)
   ============================================ */

class StorageManager {
    constructor() {
        this.storageKey = 'neonqix_highscores';
        this.maxHighscores = 10;
        this.initializeStorage();
    }

    /**
     * Initialize storage with default values
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultHighscores = [
                { score: 25000, level: 15, area: 85.5 },
                { score: 18000, level: 12, area: 80.0 },
                { score: 15000, level: 10, area: 78.5 },
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(defaultHighscores));
        }
    }

    /**
     * Get all highscores
     */
    getHighscores() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Add new highscore if qualified
     */
    addHighscore(score, level, area) {
        const highscores = this.getHighscores();
        
        // Check if score qualifies
        if (highscores.length < this.maxHighscores || score > highscores[highscores.length - 1].score) {
            highscores.push({ score, level, area });
            highscores.sort((a, b) => b.score - a.score);
            highscores.splice(this.maxHighscores);
            localStorage.setItem(this.storageKey, JSON.stringify(highscores));
            return true;
        }
        return false;
    }

    /**
     * Check if score is in top 10
     */
    isHighscore(score) {
        const highscores = this.getHighscores();
        return highscores.length < this.maxHighscores || score > highscores[highscores.length - 1].score;
    }

    /**
     * Get best score
     */
    getBestScore() {
        const highscores = this.getHighscores();
        return highscores.length > 0 ? highscores[0].score : 0;
    }

    /**
     * Clear all highscores (for testing)
     */
    clearHighscores() {
        localStorage.removeItem(this.storageKey);
        this.initializeStorage();
    }
}
