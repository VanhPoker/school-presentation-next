import { useCallback, useState } from "react";
import useSound from "use-sound";

type SoundType = "correct" | "wrong" | "streak" | "finish" | "tick";

const SOUND_PATHS: Record<SoundType, string> = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  streak: "/sounds/streak.mp3",
  finish: "/sounds/finish.mp3",
  tick: "/sounds/tick.mp3",
};

export const useSoundEffects = () => {
  const [muted, setMuted] = useState(false);

  // Initialize sounds
  const [playCorrect] = useSound(SOUND_PATHS.correct, { volume: 0.5 });
  const [playWrong] = useSound(SOUND_PATHS.wrong, { volume: 0.4 });
  const [playStreak] = useSound(SOUND_PATHS.streak, { volume: 0.4 });
  const [playFinish] = useSound(SOUND_PATHS.finish, { volume: 0.5 });
  const [playTick] = useSound(SOUND_PATHS.tick, { volume: 0.2 });

  const play = useCallback(
    (type: SoundType, volumeOverride?: number) => {
      if (muted) return;

      switch (type) {
        case "correct":
          playCorrect();
          break;
        case "wrong":
          playWrong();
          break;
        case "streak":
          playStreak();
          break;
        case "finish":
          playFinish();
          break;
        case "tick":
          playTick();
          break;
      }
    },
    [muted, playCorrect, playWrong, playStreak, playFinish, playTick],
  );

  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  return { play, muted, toggleMute };
};
