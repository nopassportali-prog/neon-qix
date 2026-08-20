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
            // Landscape - show warning
            rotateWarning.classList.remove('hidden');
            if (gameInstance) gameInstance.pause();
        } else {
            // Portrait - hide warning
            rotateWarning.classList.add('hidden');
            if (gameInstance) gameInstance.resume();
        }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Create and start game
    gameInstance = new Game(canvas);
    gameInstance.start();
    
    // Initial orientation check
    handleOrientationChange();
    
    console.log('✨ NEON QIX initialized');
}

// Prevent default touch behaviors on canvas
document.addEventListener('touchmove', (e) => {
    if (e.target === document.getElementById('gameCanvas')) {
        e.preventDefault();
    }
}, { passive: false });
