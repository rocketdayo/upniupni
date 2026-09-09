import React from 'react';
import { Award, Sparkles, Check, Zap } from 'lucide-react';
import { getTitleInfo } from '../data/titles';
import type { TitleInfo } from '../data/titles';

interface TitleUnlockedModalProps {
  titleName: string;
  onAcknowledge: (titleName: string) => void;
  onEquipAndAcknowledge: (titleName: string) => void;
}

const RARITY_THEMES: Record<TitleInfo['rarity'], { border: string; bg: string; text: string; shadow: string }> = {
  LEGEND: {
    border: '#ff0055',
    bg: 'linear-gradient(135deg, rgba(225, 29, 72, 0.95) 0%, rgba(121, 40, 202, 0.95) 100%)',
    text: '#ffe4e6',
    shadow: '0 0 35px rgba(225, 29, 72, 0.8)',
  },
  UR: {
    border: '#38bdf8',
    bg: 'linear-gradient(135deg, rgba(2, 132, 199, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
    text: '#e0f2fe',
    shadow: '0 0 35px rgba(56, 189, 248, 0.8)',
  },
  SSR: {
    border: '#ec4899',
    bg: 'linear-gradient(135deg, rgba(219, 39, 119, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
    text: '#fce7f3',
    shadow: '0 0 35px rgba(236, 72, 153, 0.8)',
  },
  SR: {
    border: '#a855f7',
    bg: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
    text: '#f3e8ff',
    shadow: '0 0 30px rgba(168, 85, 247, 0.7)',
  },
  Rare: {
    border: '#3b82f6',
    bg: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
    text: '#dbeafe',
    shadow: '0 0 25px rgba(59, 130, 246, 0.6)',
  },
  Normal: {
    border: '#00ffcc',
    bg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
    text: '#ffffff',
    shadow: '0 0 25px rgba(0, 255, 204, 0.5)',
  },
};

export const TitleUnlockedModal: React.FC<TitleUnlockedModalProps> = ({
  titleName,
  onAcknowledge,
  onEquipAndAcknowledge,
}) => {
  const info = getTitleInfo(titleName);
  const theme = RARITY_THEMES[info?.rarity || 'Normal'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: theme.bg,
          border: `3px solid ${theme.border}`,
          borderRadius: '28px',
          padding: '28px 20px',
          textAlign: 'center',
          boxShadow: theme.shadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景の光沢エフェクト */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
            animation: 'spin 12s linear infinite',
          }}
        />

        {/* GET! 特大ヘッダー */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#ffd700',
              textShadow: '0 0 15px #ffaa00, 0 4px 0 #995500, 0 0 30px #ffffff',
              transform: 'scale(1.1)',
            }}
          >
            ✨ GET!! ✨
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: '#ffffff',
              fontWeight: 900,
              background: 'rgba(0,0,0,0.4)',
              padding: '2px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,215,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            <Sparkles size={16} color="#ffd700" />
            <span>新しい称号を獲得しました！</span>
          </div>
        </div>

        {/* 称号エンブレム */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffe259 0%, #ffa751 100%)',
            border: '4px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(255,215,0,0.9), inset 0 0 15px rgba(255,255,255,0.8)',
            animation: 'pulse 1.5s ease-in-out infinite alternate',
          }}
        >
          <Award size={52} color="#000000" />
        </div>

        {/* レアリティ＆称号名 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
          <span
            style={{
              backgroundColor: info?.color || '#ffd700',
              color: '#000000',
              fontSize: '0.75rem',
              fontWeight: 900,
              padding: '2px 12px',
              borderRadius: '8px',
              letterSpacing: '1px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            【{info?.rarity || 'Normal'}】
          </span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 10px rgba(255,215,0,0.6)',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {info?.name || titleName}
          </div>
        </div>

        {/* アビリティ効果カード */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1.5px solid rgba(0, 255, 204, 0.6)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ffcc', fontWeight: 900, fontSize: '0.85rem' }}>
            <Zap size={16} color="#00ffcc" />
            <span>解放アビリティ効果</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 900, lineHeight: 1.3 }}>
            {info?.effect.specialDescription || '称号効果が発動可能になりました！'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '2px' }}>
            "{info?.description}"
          </div>
        </div>

        {/* ボタン一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '4px' }}>
          <button
            onClick={() => onEquipAndAcknowledge(titleName)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '16px',
              border: '2px solid #ffffff',
              background: 'linear-gradient(135deg, #00c853 0%, #009688 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0, 200, 83, 0.6)',
            }}
          >
            <Check size={20} />
            <span>この称号を今すぐ装着する</span>
          </button>

          <button
            onClick={() => onAcknowledge(titleName)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            確認して閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
