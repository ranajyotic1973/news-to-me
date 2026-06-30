import React, { useEffect, useRef } from 'react';
import './MeaningPopup.css';

interface MeaningPopupProps {
  selectedText: string;
  meaning: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MeaningPopup: React.FC<MeaningPopupProps> = ({
  selectedText,
  meaning,
  position,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Close on escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="meaning-popup"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="meaning-popup-header">
        <span className="meaning-popup-word">{selectedText}</span>
        <button
          className="meaning-popup-close"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>
      <div className="meaning-popup-body">
        <p className="meaning-popup-text">{meaning}</p>
      </div>
    </div>
  );
};
