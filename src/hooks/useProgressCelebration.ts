import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "last_celebrated_progress";

interface CelebrationState {
  shouldCelebrate: boolean;
  previousProgress: number;
  currentProgress: number;
}

export function useProgressCelebration(currentProgress: number, isLoading: boolean) {
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Don't check while loading or if we already checked this session
    if (isLoading || hasCheckedRef.current || currentProgress === 0) return;

    hasCheckedRef.current = true;

    // Get the last celebrated progress from localStorage
    const storedProgress = localStorage.getItem(STORAGE_KEY);
    const lastProgress = storedProgress ? parseInt(storedProgress, 10) : 0;

    // Check if progress increased by at least 1%
    if (currentProgress >= lastProgress + 1) {
      setCelebration({
        shouldCelebrate: true,
        previousProgress: lastProgress,
        currentProgress,
      });
      // Update stored progress
      localStorage.setItem(STORAGE_KEY, currentProgress.toString());
    } else if (currentProgress > lastProgress) {
      // Update stored progress even if < 1% gain (to track accurately)
      localStorage.setItem(STORAGE_KEY, currentProgress.toString());
    }
  }, [currentProgress, isLoading]);

  const dismissCelebration = () => {
    setCelebration(null);
  };

  return {
    celebration,
    dismissCelebration,
  };
}
