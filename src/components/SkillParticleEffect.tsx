import React, { useMemo } from 'react';
import type { Character } from '../data/characters';

interface SkillParticleEffectProps {
  character: Character;
  isLowPerfMode?: boolean;
}

interface Particle {
  id: number;
  symbol: string;
  tx: number;
  ty: number;
  scale: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

export const SkillParticleEffect: React.FC<SkillParticleEffectProps> = ({ character, isLowPerfMode = false }) => {
  const particles = useMemo<Particle[]>(() => {
    const symbols = ['✨', '🌟', '⚡', '💥', '✦', '🔥', '💖'];
    // 演出の派手さを保ちつつ負荷を大幅削減（通常時: 16個, 軽量モード時: 8個）
    const count = isLowPerfMode ? 8 : 16;
    const items: Particle[] = [];

    const baseColor = character.color || '#ffcc00';

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360 + (Math.random() * 20 - 10);
      const rad = (angle * Math.PI) / 180;
      const distance = 120 + Math.random() * 140;

      const tx = Math.cos(rad) * distance;
      const ty = Math.sin(rad) * distance;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const scale = 0.8 + Math.random() * 0.8;
      const delay = Math.random() * 0.2;
      const duration = 0.6 + Math.random() * 0.3;
      const size = 14 + Math.random() * 12;

      items.push({
        id: i,
        symbol,
        tx,
        ty,
        scale,
        delay,
        duration,
        color: baseColor,
        size,
      });
    }

    return items;
  }, [character, isLowPerfMode]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2002,
      }}
    >
      {/* 1. 集中線背景 (ブラー処理を除外して描画高速化) */}
      {!isLowPerfMode && (
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 25%, ${character.color}22 65%, transparent 80%), repeating-conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg 12deg, transparent 12deg 24deg)`,
            animation: 'speedLinesRotate 3s linear infinite',
            willChange: 'transform',
          }}
        />
      )}

      {/* 2. 衝撃波エナジーリング */}
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: `4px solid ${character.color}`,
          boxShadow: `0 0 20px ${character.color}`,
          animation: 'energyRingExpand 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
          willChange: 'transform, opacity',
        }}
      />
      {!isLowPerfMode && (
        <div
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '5px solid #ffffff',
            boxShadow: '0 0 25px #ffffff',
            animation: 'energyRingExpand 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) 0.2s forwards',
            willChange: 'transform, opacity',
          }}
        />
      )}

      {/* 3. 飛散する輝く粒子パーティクル (willChangeでGPUアクセラレーション) */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontSize: `${p.size}px`,
            color: '#ffffff',
            textShadow: isLowPerfMode ? `0 0 6px ${p.color}` : `0 0 8px ${p.color}, 0 0 15px #ffffff`,
            animation: `particleExplode ${p.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards`,
            willChange: 'transform, opacity',
            ['--tw-translate-x' as string]: `${p.tx}px`,
            ['--tw-translate-y' as string]: `${p.ty}px`,
            ['--tw-scale' as string]: p.scale,
            zIndex: 2003,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};
