import React, { useState, useEffect, useRef } from 'react';
import type { Character } from '../data/characters';
import { CharacterAvatar } from './CharacterAvatar';
import { Sparkles, Crown, Zap } from 'lucide-react';

interface AscensionCutsceneProps {
  baseCharacter: Character;
  resultCharacter: Character;
  isNewUnlock: boolean;
  message: string;
  onComplete: () => void;
}

type AnimationPhase = 'intro' | 'approach' | 'flash' | 'white_orb' | 'reveal';

// Simple synthesized Web Audio sound generator for epic feel
const playAscensionSound = (type: 'whoosh' | 'clash' | 'charge' | 'burst') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'whoosh') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.4);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } else if (type === 'clash') {
      // Metallic clash / explosion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'charge') {
      // Humming / pulsing white orb
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.4);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.45);
    } else if (type === 'burst') {
      // Fanfare chord
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major high chord
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + 1.7);
      });
    }
  } catch {
    // Ignore audio context errors gracefully
  }
};

export const AscensionCutscene: React.FC<AscensionCutsceneProps> = ({
  baseCharacter,
  resultCharacter,
  isNewUnlock,
  message,
  onComplete
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('intro');
  const timerRef = useRef<number[]>([]);

  useEffect(() => {
    // Timeline of animation:
    // 0s: intro (Left: Char, Right: Stone)
    // 0.8s: approach (Merge into center)
    // 1.9s: flash (Screen becomes brilliant bright white)
    // 2.4s: white_orb (Forms glowing white ball pulsing in center)
    // 4.0s: reveal (White ball explodes, new character appears)

    timerRef.current.push(
      setTimeout(() => {
        setPhase('approach');
        playAscensionSound('whoosh');
      }, 800)
    );

    timerRef.current.push(
      setTimeout(() => {
        setPhase('flash');
        playAscensionSound('clash');
      }, 1900)
    );

    timerRef.current.push(
      setTimeout(() => {
        setPhase('white_orb');
        playAscensionSound('charge');
      }, 2400)
    );

    timerRef.current.push(
      setTimeout(() => {
        setPhase('reveal');
        playAscensionSound('burst');
      }, 4000)
    );

    const timers = timerRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleSkip = () => {
    timerRef.current.forEach(clearTimeout);
    setPhase('reveal');
    playAscensionSound('burst');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Skip Button */}
      {phase !== 'reveal' && (
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100001,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          スキップ ≫
        </button>
      )}

      {/* ── Background Aura Effects ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            phase === 'white_orb'
              ? 'radial-gradient(circle at center, #1e1b4b 0%, #030712 80%)'
              : phase === 'reveal'
              ? 'radial-gradient(circle at center, #3b0764 0%, #09090b 85%)'
              : 'radial-gradient(circle at center, #172554 0%, #020617 80%)',
          transition: 'background 0.5s ease'
        }}
      />

      {/* ── SCREEN WHITE FLASH (明るくなる演出) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#ffffff',
          zIndex: 100000,
          opacity: phase === 'flash' ? 1 : 0,
          pointerEvents: 'none',
          transition: phase === 'flash' ? 'opacity 0.15s ease-in' : 'opacity 0.6s ease-out'
        }}
      />

      {/* ── STAGE 1 & 2: LEFT CHAR & RIGHT STONE MERGING (くっつく演出) ── */}
      {(phase === 'intro' || phase === 'approach') && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            height: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 10
          }}
        >
          {/* Header Title */}
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              width: '100%'
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                color: '#fef08a',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textShadow: '0 0 10px rgba(254, 240, 138, 0.8)'
              }}
            >
              【 神昇融合 儀式開始 】
            </div>
            <div style={{ fontSize: '0.72rem', color: '#93c5fd', marginTop: '4px' }}>
              魂の結晶と神昇の秘石が惹かれ合う…！
            </div>
          </div>

          {/* Left: Base Character */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform:
                phase === 'approach'
                  ? 'translateX(130px) scale(1.1)'
                  : 'translateX(0px) scale(1)',
              transition: 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1)',
              filter: 'drop-shadow(0 0 20px #38bdf8)'
            }}
          >
            <div
              style={{
                position: 'relative',
                padding: '6px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)'
              }}
            >
              <CharacterAvatar character={baseCharacter} size={80} showRankBadge={true} />
            </div>
            <div
              style={{
                marginTop: '10px',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.85rem',
                textShadow: '0 0 8px rgba(0,0,0,0.8)'
              }}
            >
              {baseCharacter.name}
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#bae6fd',
                background: 'rgba(2, 132, 199, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                marginTop: '2px'
              }}
            >
              進化元
            </span>
          </div>

          {/* Center Magic/Sparkle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: phase === 'approach' ? 1 : 0.4,
              transition: 'opacity 0.5s ease'
            }}
          >
            <Zap
              size={36}
              color="#ffd700"
              style={{
                animation: 'spin 3s linear infinite',
                filter: 'drop-shadow(0 0 12px #ffd700)'
              }}
            />
            <div
              style={{
                fontSize: '0.7rem',
                color: '#ffd700',
                fontWeight: 950,
                letterSpacing: '0.1em',
                marginTop: '4px'
              }}
            >
              融合
            </div>
          </div>

          {/* Right: God Stone (秘石) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform:
                phase === 'approach'
                  ? 'translateX(-130px) scale(1.1)'
                  : 'translateX(0px) scale(1)',
              transition: 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1)',
              filter: 'drop-shadow(0 0 20px #ffd700)'
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, #ffffff 0%, #ffd700 45%, #ea580c 85%, #7c2d12 100%)',
                boxShadow:
                  '0 0 25px #ffd700, inset 0 0 15px rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Sparkles size={38} color="#ffffff" />
            </div>
            <div
              style={{
                marginTop: '10px',
                color: '#ffd700',
                fontWeight: 900,
                fontSize: '0.85rem',
                textShadow: '0 0 8px rgba(0,0,0,0.8)'
              }}
            >
              神昇の秘石
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                color: '#fef08a',
                background: 'rgba(234, 88, 12, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                marginTop: '2px'
              }}
            >
              覚醒媒体
            </span>
          </div>
        </div>
      )}

      {/* ── STAGE 3: GLOWING WHITE ORB (丸い白いたま演出) ── */}
      {phase === 'white_orb' && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}
        >
          {/* Pulsing Light Rings */}
          <div
            style={{
              position: 'absolute',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
              animation: 'pulse 1.2s ease-in-out infinite'
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 0 30px #ffffff, inset 0 0 30px #ffffff',
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />

          {/* THE WHITE BALL (丸い白いたま) */}
          <div
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 35%, #ffffff 0%, #f8fafc 40%, #e2e8f0 80%, #cbd5e1 100%)',
              boxShadow:
                '0 0 50px #ffffff, 0 0 100px #e0e7ff, 0 0 150px #c084fc, inset 0 0 25px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'orbPulse 0.8s ease-in-out infinite alternate',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#ffffff',
                filter: 'blur(4px)',
                opacity: 0.9
              }}
            />
          </div>

          <div
            style={{
              marginTop: '40px',
              textAlign: 'center',
              maxWidth: '360px',
              padding: '0 16px'
            }}
          >
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 950,
                color: '#ffffff',
                textShadow: '0 0 15px #ffffff, 0 0 30px #c084fc',
                letterSpacing: '0.15em'
              }}
            >
              魂の融合・エネルギー凝縮中…
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: '#fca5a5',
                marginTop: '6px',
                fontWeight: 800
              }}
            >
              『{baseCharacter.name}』は激しい融合で力を出し尽くし、疲れ切ってお別れに…
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#e0e7ff',
                marginTop: '4px'
              }}
            >
              託された魂と意志が純白の光球となり、神域の覚醒へ！
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 4: CHARACTER REVEAL (画面に出たキャラが表示される演出) ── */}
      {phase === 'reveal' && (
        <div
          style={{
            position: 'relative',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '380px',
            width: '90%',
            animation: 'revealPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Rotating God Rays behind Character */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, rgba(255,215,0,0.4), transparent 30deg, rgba(192,132,252,0.4) 60deg, transparent 90deg, rgba(255,215,0,0.4) 120deg, transparent 150deg, rgba(56,189,248,0.4) 180deg, transparent 210deg, rgba(255,215,0,0.4) 240deg, transparent 270deg, rgba(234,88,12,0.4) 300deg, transparent 330deg)',
              animation: 'spin 12s linear infinite',
              pointerEvents: 'none',
              zIndex: -1
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>👑✨</div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 950,
                color: '#ffd700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
              }}
            >
              {isNewUnlock ? '新ZZキャラクター神昇覚醒！' : '神昇覚醒・限界突破！'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '2px', fontWeight: 800 }}>
              最高峰ランク ZZ 降臨
            </div>
          </div>

          {/* Character Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '2px solid #ffd700',
              borderRadius: '20px',
              padding: '20px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 35px rgba(255, 215, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* Character Icon with pulsating golden aura */}
            <div
              style={{
                position: 'relative',
                padding: '6px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700, #ec4899, #8b5cf6)',
                boxShadow: '0 0 25px rgba(255, 215, 0, 0.7)'
              }}
            >
              <CharacterAvatar character={resultCharacter} size={100} showRankBadge={true} />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(90deg, #ffd700, #f59e0b)',
                  color: '#000',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 950,
                  marginBottom: '6px'
                }}
              >
                <Crown size={14} /> RANK ZZ
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 950,
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}
              >
                {resultCharacter.name}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#fef08a',
                  marginTop: '4px',
                  fontWeight: 800
                }}
              >
                必殺技: {resultCharacter.skill?.name || '神域奥義'}
              </div>
            </div>

            {/* Farewell Notice Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(127, 29, 29, 0.25) 100%)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>🕊️</div>
              <div style={{ fontSize: '0.72rem', color: '#fecaca', lineHeight: '1.4' }}>
                <span style={{ fontWeight: 950, color: '#fca5a5' }}>【お別れ】</span>
                『{baseCharacter.name}』は激しい融合で全力を捧げて疲れ切り、お別れとなりました。魂と力は最高峰ZZへと昇華・継承されました。
              </div>
            </div>

            {/* Message Box */}
            <div
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#e2e8f0',
                lineHeight: '1.5',
                width: '100%',
                whiteSpace: 'pre-line'
              }}
            >
              {message}
            </div>

            {/* OK Button */}
            <button
              onClick={onComplete}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 950,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)',
                marginTop: '4px'
              }}
            >
              OK（閉じる）
            </button>
          </div>
        </div>
      )}

      {/* Global Style Animations for keyframes */}
      <style>{`
        @keyframes orbPulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 40px #ffffff, 0 0 80px #e0e7ff, 0 0 120px #c084fc;
          }
          100% {
            transform: scale(1.2);
            box-shadow: 0 0 70px #ffffff, 0 0 130px #ffffff, 0 0 200px #c084fc;
          }
        }
        @keyframes revealPop {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          70% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
