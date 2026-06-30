import React, { useState, useEffect } from 'react';
import './SelectionPopup.css';

interface SelectionPopupProps {
  selectedText: string;
  position: { x: number; y: number };
  onMeaningClick: (text: string) => void;
  isLoading?: boolean;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({
  selectedText,
  position,
  onMeaningClick,
  isLoading = false,
}) => {
  return (
    <div
      className="selection-popup"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        className="meaning-button"
        onClick={() => onMeaningClick(selectedText)}
        disabled={isLoading}
        title="Get the meaning of this text"
      >
        {isLoading ? '⏳ Getting...' : '❓ Meaning?'}
      </button>
    </div>
  );
};
