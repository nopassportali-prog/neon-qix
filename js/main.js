/* ============================================
   NEON QIX - Main Entry Point
   ============================================ */

let gameInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    const rotateWarning = document.getElementById('rotateWarning');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Handle device orientation
    const handleOrientationChange = () => {
        if (window.innerHeight < window.innerWidth) {
            // Landscape
            rotateWarning.classList.remove('hidden');
            if (gameInstance) gameInstance.pause();
        } else {
            // Portrait
            rotateWarning.classList.add('hidden');
            if (gameInstance) gameInstance.resume();
        }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Create game instance
    gameInstance = new Game(canvas);
    
    // Initial orientation check
    handleOrientationChange();
    
    // Start game loop
    gameInstance.start();
    
    console.log('NEON QIX initialized');
}

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.target === document.getElementById('gameCanvas')) {
        e.preventDefault();
    }
}, { passive: false });
