import React, { useEffect, useState } from 'react';
import { Star, Trophy, Coins, Sparkles, RotateCcw, ArrowRight, Check, Award, Gift } from 'lucide-react';
import type { StageDropReward } from '../store/GameContext';

interface StageResultModalProps {
  stageName: string;
  enemyName: string;
  enemyEmoji: string;
  score: number;
  playerHp: number;
  maxPlayerHp: number;
  feverCount: number;
  rewardMoney: number;
  rewardYPoints: number;
  isEventStage?: boolean;
  drops?: StageDropReward;
  onRetry: () => void;
  onNext: () => void;
}

// カウントアップアニメーションコンポーネント
export const CountUpNumber: React.FC<{
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ end, duration = 1200, delay = 0, prefix = '', suffix = '', style }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(easeProgress * end));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };
      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, delay]);

  return (
    <span style={style}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
};

export const StageResultModal: React.FC<StageResultModalProps> = ({
  stageName,
  enemyName,
  enemyEmoji,
  score,
  playerHp,
  maxPlayerHp,
  feverCount,
  rewardMoney,
  rewardYPoints,
  isEventStage = false,
  drops,
  onRetry,
  onNext
}) => {
  const hpRatio = maxPlayerHp > 0 ? playerHp / maxPlayerHp : 0;

  // 星3つの獲得判定
  const star1Achieved = true; // クリア達成
  const star2Achieved = hpRatio >= 0.5; // HP 50%以上
  const star3Achieved = feverCount >= 1 || hpRatio >= 0.8 || score >= 20000; // フィーバー発動 or HP80%以上 or 高スコア

  const starCount = (star1Achieved ? 1 : 0) + (star2Achieved ? 1 : 0) + (star3Achieved ? 1 : 0);

  // 星表示アニメーション制御 (順番にポップアップ)
  const [showStar1, setShowStar1] = useState(false);
  const [showStar2, setShowStar2] = useState(false);
  const [showStar3, setShowStar3] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStar1(true), 300);
    const t2 = setTimeout(() => setShowStar2(true), 700);
    const t3 = setTimeout(() => setShowStar3(true), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // ランク計算
  const getRank = () => {
    if (score >= 50000 || starCount === 3) return { label: 'S', color: '#ffea00', bg: 'linear-gradient(135deg, #ff0055, #ffaa00)' };
    if (score >= 25000 || starCount === 2) return { label: 'A', color: '#00ffcc', bg: 'linear-gradient(135deg, #0088ff, #00ffcc)' };
    if (score >= 10000) return { label: 'B', color: '#ff8800', bg: 'linear-gradient(135deg, #aa00ff, #ff8800)' };
    return { label: 'C', color: '#aaa', bg: 'linear-gradient(135deg, #444, #888)' };
  };

  const rank = getRank();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at center, rgba(15, 15, 35, 0.95) 0%, rgba(5, 5, 20, 0.98) 100%)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px 16px',
      overflowY: 'auto'
    }}>
      {/* 画面上の閃光エフェクト */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(255,0,128,0.1) 40%, transparent 70%)',
        animation: 'pulse 3s infinite alternate',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '28px 24px',
        borderRadius: '24px',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 0 35px rgba(255, 215, 0, 0.25), inset 0 0 20px rgba(255, 215, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(20,20,45,0.95) 0%, rgba(10,10,25,0.98) 100%)'
      }}>
        {/* CLEAR タイトル */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#ffd700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '2px'
          }}>
            {stageName} • {enemyName} {enemyEmoji}
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(180deg, #ffffff 0%, #ffe600 60%, #ff8800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 10px rgba(255,170,0,0.6))',
            letterSpacing: '1px'
          }}>
            STAGE CLEAR!
          </h1>
        </div>

        {/* ⭐ 星3評価（3 Stars Rating） */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          margin: '4px 0'
        }}>
          {/* 星1 */}
          <div style={{
            position: 'relative',
            transform: showStar1 ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Star
              size={star1Achieved ? 48 : 42}
              fill={star1Achieved ? '#ffd700' : 'rgba(255,255,255,0.1)'}
              color={star1Achieved ? '#ffffff' : 'rgba(255,255,255,0.3)'}
              style={{
                filter: star1Achieved ? 'drop-shadow(0 0 12px #ffaa00)' : 'none'
              }}
            />
          </div>

          {/* 星2 (中央・特大) */}
          <div style={{
            position: 'relative',
            marginTop: '-12px',
            transform: showStar2 ? 'scale(1.2)' : 'scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Star
              size={star2Achieved ? 56 : 48}
              fill={star2Achieved ? '#ffd700' : 'rgba(255,255,255,0.1)'}
              color={star2Achieved ? '#ffffff' : 'rgba(255,255,255,0.3)'}
              style={{
                filter: star2Achieved ? 'drop-shadow(0 0 16px #ffaa00)' : 'none'
              }}
            />
          </div>

          {/* 星3 */}
          <div style={{
            position: 'relative',
            transform: showStar3 ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Star
              size={star3Achieved ? 48 : 42}
              fill={star3Achieved ? '#ffd700' : 'rgba(255,255,255,0.1)'}
              color={star3Achieved ? '#ffffff' : 'rgba(255,255,255,0.3)'}
              style={{
                filter: star3Achieved ? 'drop-shadow(0 0 12px #ffaa00)' : 'none'
              }}
            />
          </div>
        </div>

        {/* 星獲得条件リスト */}
        <div style={{
          width: '100%',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: star1Achieved ? '#ffe600' : '#888' }}>
            <Star size={14} fill={star1Achieved ? '#ffe600' : 'none'} color={star1Achieved ? '#ffe600' : '#666'} />
            <span style={{ flex: 1 }}>ステージクリア</span>
            {star1Achieved && <Check size={14} color="#00ffcc" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: star2Achieved ? '#ffe600' : '#888' }}>
            <Star size={14} fill={star2Achieved ? '#ffe600' : 'none'} color={star2Achieved ? '#ffe600' : '#666'} />
            <span style={{ flex: 1 }}>残りHP 50%以上でクリア</span>
            {star2Achieved ? <Check size={14} color="#00ffcc" /> : <span style={{ fontSize: '0.65rem', color: '#666' }}>({Math.floor(hpRatio * 100)}%)</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: star3Achieved ? '#ffe600' : '#888' }}>
            <Star size={14} fill={star3Achieved ? '#ffe600' : 'none'} color={star3Achieved ? '#ffe600' : '#666'} />
            <span style={{ flex: 1 }}>FEVER発動 or 高スコア達成</span>
            {star3Achieved && <Check size={14} color="#00ffcc" />}
          </div>
        </div>

        {/* スコア & ランクエリア */}
        <div style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={14} color="#ffd700" /> TOTAL SCORE
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'monospace, sans-serif',
              lineHeight: 1.1,
              marginTop: '2px'
            }}>
              <CountUpNumber end={score} duration={1500} delay={400} />
            </div>
          </div>

          {/* ランクバッジ */}
          <div style={{
            background: rank.bg,
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            border: '2px solid #ffffff'
          }}>
            <span style={{ fontSize: '0.6rem', color: '#ffffff', fontWeight: 900, textTransform: 'uppercase' }}>RANK</span>
            <span style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 900, lineHeight: 1 }}>{rank.label}</span>
          </div>
        </div>

        {/* 獲得報酬エリア（Yポイント/マネー カウントアップ） */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={16} /> 獲得報酬 (GET REWARDS)
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {/* 獲得マネー */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '14px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#ffea00', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} /> コイン / マネー
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'monospace, sans-serif'
              }}>
                + <CountUpNumber end={rewardMoney} duration={1200} delay={800} />
              </div>
            </div>

            {/* 獲得Yポイント or サマーコイン */}
            <div style={{
              background: isEventStage ? 'rgba(56, 189, 248, 0.12)' : 'rgba(236, 72, 153, 0.12)',
              border: isEventStage ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(236, 72, 153, 0.35)',
              borderRadius: '14px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{
                fontSize: '0.7rem',
                color: isEventStage ? '#38bdf8' : '#f472b6',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={14} /> {isEventStage ? 'サマーコイン' : 'Yポイント'}
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'monospace, sans-serif'
              }}>
                + <CountUpNumber end={rewardYPoints} duration={1200} delay={1000} />
              </div>
            </div>
          </div>
        </div>

        {/* 🎁 ステージドロップ演出 (STAGE DROPS) */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#ff3388', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Gift size={16} color="#ff3388" /> ステージドロップ (ITEMS DROPPED)
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* 秘伝書 (超低確率ドロップ) */}
            {drops && drops.skillBookCount > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 120, 0, 0.2) 100%)',
                border: '2px solid #ffd700',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
                borderRadius: '12px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    background: '#ffd700',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}>
                    📜
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>
                      ひっさつわざの秘伝書
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#ffea00', fontWeight: 700 }}>
                      ✨ 超激レア! 技LvがUPするぞ!
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#ffd700',
                  color: '#000000',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.8rem'
                }}>
                  + {drops.skillBookCount}
                </div>
              </div>
            )}

            {/* ドロップキャラクター */}
            {drops && drops.droppedCharacter && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%)',
                border: '2px solid #c084fc',
                boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)',
                borderRadius: '12px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    background: 'rgba(255,255,255,0.2)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}>
                    {drops.droppedCharacter.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        background: '#c084fc',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 900
                      }}>
                        {drops.droppedCharacter.rank}
                      </span>
                      {drops.droppedCharacter.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#e879f9', fontWeight: 700 }}>
                      {drops.droppedCharacter.isNew ? '🌟 新規GET! 仲間になった!' : '⚡ 限界突破レベルUP!'}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#e879f9',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.75rem'
                }}>
                  {drops.droppedCharacter.isNew ? 'NEW' : 'LB+1'}
                </div>
              </div>
            )}

            {/* 経験値玉 (大) */}
            {drops && drops.expLargeCount > 0 && (
              <div style={{
                background: 'rgba(147, 51, 234, 0.15)',
                border: '1px solid rgba(147, 51, 234, 0.4)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🔮</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                      経験値玉 (超 / 大)
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#c084fc' }}>
                      キャラLVが一気に上昇！
                    </div>
                  </div>
                </div>
                <span style={{ color: '#c084fc', fontWeight: 900, fontSize: '0.85rem' }}>
                  + {drops.expLargeCount}
                </span>
              </div>
            )}

            {/* 経験値玉 (小) */}
            {drops && drops.expSmallCount > 0 && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🟢</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                      経験値玉 (小)
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#4ade80' }}>
                      キャラ強化に使用可能
                    </div>
                  </div>
                </div>
                <span style={{ color: '#4ade80', fontWeight: 900, fontSize: '0.85rem' }}>
                  + {drops.expSmallCount}
                </span>
              </div>
            )}

            {/* ドロップなしの場合 */}
            {(!drops || (drops.skillBookCount === 0 && drops.expLargeCount === 0 && drops.expSmallCount === 0 && !drops.droppedCharacter)) && (
              <div style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#aaa',
                padding: '6px 0',
                fontStyle: 'italic'
              }}>
                アイテムドロップなし（何度もクリアして秘伝書やキャラをGETしよう！）
              </div>
            )}
          </div>
        </div>

        {/* ボタン群 */}
        <div style={{
          width: '100%',
          display: 'flex',
          gap: '10px',
          marginTop: '6px'
        }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={18} /> もう一度
          </button>

          <button
            onClick={onNext}
            style={{
              flex: 1.4,
              padding: '12px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff9900 0%, #ff5500 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(255, 85, 0, 0.4)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            次へ進む <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
