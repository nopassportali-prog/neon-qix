/* ============================================
   NEON QIX - Collision Manager
   ============================================ */

class CollisionManager {
    constructor(game) {
        this.game = game;
    }

    /**
     * Check if Qix collides with player's drawn line
     */
    checkQixPlayerCollision(qix, player) {
        if (!player.isDrawing || player.drawnPath.length < 2) {
            return false;
        }

        // Check Qix against all drawn path points
        for (let i = 0; i < player.drawnPath.length - 1; i++) {
            const p1 = player.drawnPath[i];
            const p2 = player.drawnPath[i + 1];
            
            if (this.pointToLineSegmentDistance(qix.x, qix.y, p1.x, p1.y, p2.x, p2.y) < qix.size + player.size) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate distance from point to line segment
     */
    pointToLineSegmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        
        if (lengthSq === 0) {
            // Line segment is a point
            return Math.hypot(px - x1, py - y1);
        }
        
        // Calculate parameter t (position on line)
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));
        
        // Find closest point on line segment
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        
        // Distance from point to closest point
        return Math.hypot(px - closestX, py - closestY);
    }

    /**
     * Check if Qix collides with player directly
     */
    checkDirectCollision(qix, player) {
        const dist = Math.hypot(qix.x - player.x, qix.y - player.y);
        return dist < qix.size + player.size;
    }

    /**
     * Check if any two entities collide (circular collision)
     */
    checkCircleCollision(entity1, entity2, radius1, radius2) {
        const dist = Math.hypot(entity1.x - entity2.x, entity1.y - entity2.y);
        return dist < radius1 + radius2;
    }
}
