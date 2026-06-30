import React from 'react';
import { MONSTER_SPRITES, COLOR_MAP } from './sprites';

export function PixelSprite({ spriteId, size = 128, animationClass = "" }) {
  const matrix = MONSTER_SPRITES[spriteId];

  if (!matrix) {
    return <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: '#333' }} />;
  }

  const pixelSize = size / 16; // 👈 16x16 grid cell calculation

  return (
    <div 
      className={animationClass}
      style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        width: `${size}px`, 
        height: `${size}px`,
        imageRendering: 'pixelated',
        transition: 'all 0.15s ease'
      }}
    >
      {matrix.flat().map((pixelSymbol, index) => (
        <div 
          key={index}
          style={{ 
            width: `${pixelSize}px`, 
            height: `${pixelSize}px`, 
            backgroundColor: COLOR_MAP[pixelSymbol] || 'transparent'
          }} 
        />
      ))}
    </div>
  );
}