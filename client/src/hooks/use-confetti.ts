import { useCallback } from "react";

export function useConfetti() {
  const triggerConfetti = useCallback(() => {
    // Simple confetti implementation - in production would use react-confetti
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces: any[] = [];
    const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
    
    for (let i = 0; i < 100; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: Math.random() * 3 + 1,
        },
      });
    }
    
    function animate() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pieces.forEach((piece, index) => {
        piece.x += piece.velocity.x;
        piece.y += piece.velocity.y;
        piece.rotation += 2;
        
        if (piece.y > canvas.height) {
          pieces.splice(index, 1);
        }
        
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
      });
      
      if (pieces.length > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    }
    
    animate();
  }, []);

  return { triggerConfetti };
}
