import { useCallback } from "react";
import confetti from "canvas-confetti";

type CelebrationType = "correct" | "streak" | "finish";

export const useConfetti = () => {
  const celebrate = useCallback((type: CelebrationType) => {
    switch (type) {
      case "correct":
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#22c55e", "#4ade80", "#86efac"], // Greens
        });
        break;
      case "streak":
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#facc15", "#fde047", "#fef08a", "#fbbf24"], // Yellows/Golds
        });
        break;
      case "finish":
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };

        const random = (min: number, max: number) =>
          Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);
        break;
    }
  }, []);

  return { celebrate };
};
