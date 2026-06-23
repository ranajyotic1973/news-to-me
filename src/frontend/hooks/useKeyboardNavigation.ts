import { useEffect } from 'react';

export interface KeyboardNavigationOptions {
  onPrevious: () => void;
  onNext: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onPrevious,
  onNext,
  enabled = true,
}: KeyboardNavigationOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onPrevious, onNext]);
}
