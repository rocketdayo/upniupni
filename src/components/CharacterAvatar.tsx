import React, { useState } from 'react';
import { getPublicUrl, createPuniSvgDataUrl } from '../data/characters';
import type { Character } from '../data/characters';

interface CharacterAvatarProps {
  character: Character;
  size?: number;
  showRankBadge?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 56,
  showRankBadge = false,
  style,
  className,
  onClick
}) => {
  const rawPath = character.imageUrl || '';
  const cleanPath = rawPath.replace(/^(\.\/|\/)+/, '');

  const sources = [
    getPublicUrl(rawPath),
    `./${cleanPath}`,
    `/${cleanPath}`,
    character.rankImage ? getPublicUrl(character.rankImage) : '',
    createPuniSvgDataUrl(character.emoji, character.color)
  ].filter(Boolean);

  const [srcIndex, setSrcIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(prev => prev + 1);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: character.color || '#333',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.8)',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
    >
      {!imageFailed ? (
        <img
          src={sources[srcIndex]}
          alt={character.name}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '50%',
            padding: '2px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
          }}
        />
      ) : (
        <span
          style={{
            fontSize: `${size * 0.55}px`,
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {character.emoji || '👾'}
        </span>
      )}

      {/* Rank Badge */}
      {showRankBadge && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            background: '#ffcc00',
            color: '#000',
            fontWeight: 'bold',
            fontSize: `${Math.max(9, size * 0.22)}px`,
            padding: '1px 5px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            lineHeight: 1
          }}
        >
          {character.rank}
        </span>
      )}
    </div>
  );
};
