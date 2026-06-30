import { useState, useEffect, useCallback } from 'react';

export interface SelectionInfo {
  text: string;
  position: { x: number; y: number };
}

export const useTextSelection = () => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const handleSelection = useCallback(() => {
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText && selectedText.length > 0 && selectedText.length < 200) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({
          text: selectedText,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          },
        });
      }
    } else {
      setSelection(null);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [handleSelection]);

  return { selection, clearSelection };
};
