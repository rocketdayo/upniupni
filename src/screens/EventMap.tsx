import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Sparkles, ShieldAlert, Gift, Play } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { EVENT_SNOW_STAGES, type Stage } from '../data/stages';
import { CHARACTERS } from '../data/characters';

export const EventMap: React.FC = () => {
  const navigate = useNavigate();
  const { clearedStages, characters, unlockEventStages, team = [], savedTeams = [], activeTeamIndex = 0, setActiveTeamIndex } = useGame();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  // イベント特効キャラ
  const boostChars = CHARACTERS.filter(c => c.eventBoost);
  const ownedBoostChars = boostChars.filter(c => characters[c.id]);

  // 解放判定
  // 1-1: 常時解放
  // 1-2, 1-3: 1-1 クリアで解放
  // 1-4, 1-5: 1-2 か 1-3 クリアで解放
  // 2-1: 1-5 (サマーエンマ大王) クリアで解放
  // 2-2: 2-1 クリアで解放
  // 2-3: 2-2 クリアで解放
  // 2-4: 2-3 クリアで解放 (10億HP神創サマーエンマ大王)
  // 3-1: 2-4 クリアで解放 (裏の裏の裏エリア開放)
  // 3-2: 3-1 クリアで解放
  // 3-3: 3-2 クリアで解放
  // 3-4: 3-3 クリアで解放 (1兆HP次元頂点神エンマ)
  const isStageUnlocked = (stageId: string): boolean => {
    if (stageId === 'event_snow_1_1') return true;
    if (stageId === 'event_snow_1_2' || stageId === 'event_snow_1_3') {
      return clearedStages.includes('event_snow_1_1');
    }
    if (stageId === 'event_snow_1_4' || stageId === 'event_snow_1_5') {
      return clearedStages.includes('event_snow_1_2') || clearedStages.includes('event_snow_1_3');
    }
    if (stageId === 'event_snow_2_1') {
      return clearedStages.includes('event_snow_1_5');
    }
    if (stageId === 'event_snow_2_2') {
      return clearedStages.includes('event_snow_2_1');
    }
    if (stageId === 'event_snow_2_3') {
      return clearedStages.includes('event_snow_2_2');
    }
    if (stageId === 'event_snow_2_4') {
      return clearedStages.includes('event_snow_2_3');
    }
    if (stageId === 'event_snow_3_1') {
      return clearedStages.includes('event_snow_2_4');
    }
    if (stageId === 'event_snow_3_2') {
      return clearedStages.includes('event_snow_3_1');
    }
    if (stageId === 'event_snow_3_3') {
      return clearedStages.includes('event_snow_3_2');
    }
    if (stageId === 'event_snow_3_4') {
      return clearedStages.includes('event_snow_3_3');
    }
    if (stageId === 'event_snow_4_1') {
      return clearedStages.includes('event_snow_3_4');
    }
    if (stageId === 'event_snow_4_2') {
      return clearedStages.includes('event_snow_4_1');
    }
    if (stageId === 'event_snow_4_3') {
      return clearedStages.includes('event_snow_4_2');
    }
    if (stageId === 'event_snow_4_4') {
      return clearedStages.includes('event_snow_4_3');
    }
    return false;
  };

  const isStageCleared = (stageId: string): boolean => {
    return clearedStages.includes(stageId);
  };

  const isDeepUnlocked = clearedStages.includes('event_snow_1_5');
  const isDeepestUnlocked = clearedStages.includes('event_snow_2_4');
  const isUltraDeepUnlocked = clearedStages.includes('event_snow_3_4');

  // 宝箱受取条件 (全ステージクリア)
  const isAllCleared = EVENT_SNOW_STAGES.every(s => clearedStages.includes(s.id));

  // ステージアイコンビジュアル定義（夏の常夏ビーチテーマ）
  const stageVisuals: Record<string, { label: string; icon: string; name: string; color: string; subText: string }> = {
    'event_snow_1_1': {
      label: '1-1',
      icon: '🏖️🐻',
      name: '灼熱サマーベアー',
      color: '#ffedd5',
      subText: '砂浜の脅威'
    },
    'event_snow_1_2': {
      label: '1-2',
      icon: '🏄‍♂️🦈',
      name: 'トロピカルサーファー',
      color: '#bae6fd',
      subText: '荒波の王者'
    },
    'event_snow_1_3': {
      label: '1-3',
      icon: '☀️🗿',
      name: 'サンシャインゴーレム',
      color: '#fef08a',
      subText: '日輪の巨神'
    },
    'event_snow_1_4': {
      label: '1-4',
      icon: '🦑🌊',
      name: '深海の大王クラーケン',
      color: '#99f6e4',
      subText: '海底の主'
    },
    'event_snow_1_5': {
      label: '1-5',
      icon: '👑🏖️🔥',
      name: 'サマーエンマ大王',
      color: '#fca5a5',
      subText: '常夏の魔王'
    },
    'event_snow_2_1': {
      label: '2-1',
      icon: '🌋🐉',
      name: '灼熱の魔海竜ヴォルカ',
      color: '#ef4444',
      subText: 'HP 1,000万'
    },
    'event_snow_2_2': {
      label: '2-2',
      icon: '🔥💀',
      name: '常夏の冥界覇王ハデス',
      color: '#a855f7',
      subText: 'HP 5,000万'
    },
    'event_snow_2_3': {
      label: '2-3',
      icon: '⚡👑',
      name: '超覚醒・常夏皇帝ゼウス',
      color: '#f59e0b',
      subText: 'HP 2億'
    },
    'event_snow_2_4': {
      label: '2-4',
      icon: '☀️👑🔥',
      name: '神創・サマーエンマ大王',
      color: '#880022',
      subText: 'HP 10億 (1B)'
    },
    'event_snow_3_1': {
      label: '3-1',
      icon: '🔥🐉💥',
      name: '灼熱魔獣 ヴォイド',
      color: '#f87171',
      subText: 'HP 100億'
    },
    'event_snow_3_2': {
      label: '3-2',
      icon: '💀👑⚡',
      name: '暗黒神 ヴェルゼ',
      color: '#c084fc',
      subText: 'HP 500億'
    },
    'event_snow_3_3': {
      label: '3-3',
      icon: '☀️👑🌌',
      name: '創世オルティス',
      color: '#fbbf24',
      subText: 'HP 2,000億'
    },
    'event_snow_3_4': {
      label: '3-4',
      icon: '👑☀️🌌🔥',
      name: '無限創世エンマ神',
      color: '#ffd700',
      subText: 'HP 1兆 (1Trillion)'
    },
    'event_snow_4_1': {
      label: '4-1',
      icon: '🔱🐙🌊',
      name: '極限深海王 オケアノス',
      color: '#38bdf8',
      subText: 'HP 500兆'
    },
    'event_snow_4_2': {
      label: '4-2',
      icon: '⏳👑🔥',
      name: '時空支配神 クロノス',
      color: '#fb923c',
      subText: 'HP 2,000兆'
    },
    'event_snow_4_3': {
      label: '4-3',
      icon: '💀💥🔥',
      name: '真・絶対破壊神 デストロイ',
      color: '#f87171',
      subText: 'HP 1京'
    },
    'event_snow_4_4': {
      label: '4-4',
      icon: '👑☀️⚡🌌',
      name: '常夏創世ゼウスエンマ',
      color: '#22d3ee',
      subText: 'HP 5京 (50P)'
    },
  };

  return (
    <div className="view-container" style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1e1b4b 0%, #311b92 25%, #0284c7 65%, #0369a1 100%)',
      color: '#ffffff',
      fontFamily: '"Hiragino Kaku Gothic ProN", "Meiryo", sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '220px',
      boxSizing: 'border-box'
    }}>
      {/* 背景の太陽光＆夏のエナジーエフェクト */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(251, 191, 36, 0.35), transparent 65%), radial-gradient(circle at 50% 75%, rgba(244, 63, 94, 0.2), transparent 70%)',
        zIndex: 1
      }} />

      {/* トップナビバー */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/event')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '10px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
            戻る
          </button>
          <button
            onClick={() => {
              unlockEventStages();
              alert('常夏ビーチの進捗（全ステージ）を復元・解放しました！');
            }}
            style={{
              background: 'rgba(56, 189, 248, 0.25)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🏝️ 進捗復元
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(90deg, #ea580c, #c2410c)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #f97316',
          boxShadow: '0 0 14px rgba(249, 115, 22, 0.6)'
        }}>
          <ShieldAlert size={18} color="#fef08a" />
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
            超激ムズ裏マップ
          </span>
        </div>
      </div>

      {/* ヘッダータイトル看板（常夏ビーチ裏） */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #b45309 100%)',
          border: '3px solid #fde047',
          borderRadius: '16px',
          padding: '8px 24px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🌴</span>
          <h1 style={{
            margin: 0,
            fontSize: '1.35rem',
            fontWeight: 900,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(253, 224, 71, 0.9)',
            letterSpacing: '1px'
          }}>
            常夏ビーチ(裏) マップ一覧
          </h1>
          <span style={{ fontSize: '1.4rem' }}>🌺</span>
        </div>
      </div>

      {/* ===== 常夏ビーチ 最裏 (裏の裏の裏の裏) エリア (3-4 無限創世エンマ神1兆撃破で最深奥が顕現！) ===== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '440px',
        margin: '20px auto 10px',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {isUltraDeepUnlocked ? (
          <div style={{
            width: '100%',
            background: 'linear-gradient(180deg, rgba(5, 5, 15, 0.95) 0%, rgba(13, 148, 136, 0.95) 100%)',
            border: '4px solid #00ffff',
            borderRadius: '24px',
            padding: '20px 16px',
            boxShadow: '0 0 45px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(13, 148, 136, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* 「常夏ビーチ (最裏)」電脳ネオン看板 */}
            <div style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #0d9488 50%, #0f172a 100%)',
              border: '3px solid #ffffff',
              borderRadius: '20px',
              padding: '6px 20px',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🌀</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', textShadow: '0 0 10px #000' }}>
                常夏ビーチ (最裏)
              </span>
              <span style={{ fontSize: '1.2rem' }}>🌀</span>
            </div>

            {/* 常夏創世ゼウスエンマ 4-4 (5京HP) */}
            <div style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {/* 回転する超越魔方陣 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px dashed #00ffff',
                boxShadow: '0 0 40px #00ffff, inset 0 0 30px #0d9488',
                animation: 'spin 6s linear infinite'
              }} />

              <div style={{
                position: 'absolute',
                top: '-14px',
                background: 'linear-gradient(90deg, #00ffff, #0d9488)',
                color: '#000',
                fontSize: '0.7rem',
                padding: '3px 12px',
                borderRadius: '12px',
                fontWeight: 900,
                border: '2px solid #fff',
                boxShadow: '0 0 15px #00ffff',
                zIndex: 2
              }}>
                👑 体力5京 (50P) 最深頂点神 👑
              </div>

              {/* 5京HP 常夏創世ゼウスエンマ */}
              <div
                onClick={() => {
                  const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_4_4');
                  if (s) setSelectedStage(s);
                }}
                style={{
                  width: '125px',
                  height: '125px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #00ffff 0%, #0d9488 60%, #05050f 100%)',
                  border: '5px solid #ffffff',
                  boxShadow: '0 0 50px rgba(0, 255, 255, 1), inset 0 0 25px #0d9488',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '3.6rem', filter: 'drop-shadow(0 0 16px #00ffff)' }}>👑☀️⚡🌌</span>
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  background: 'linear-gradient(90deg, #05050f, #0d9488)',
                  border: '2px solid #00ffff',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.9)'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#00ffff' }}>
                    4-4: 常夏創世ゼウスエンマ (5京HP)
                  </span>
                </div>
              </div>
            </div>

            {/* 最裏 ステージノード配置 (4-2 & 4-3, 4-1) */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              {/* 4-2 (左) & 4-3 (右) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <StageNode
                  stageId="event_snow_4_2"
                  visual={stageVisuals['event_snow_4_2']}
                  unlocked={isStageUnlocked('event_snow_4_2')}
                  cleared={isStageCleared('event_snow_4_2')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_4_2');
                    if (s) setSelectedStage(s);
                  }}
                />
                <StageNode
                  stageId="event_snow_4_3"
                  visual={stageVisuals['event_snow_4_3']}
                  unlocked={isStageUnlocked('event_snow_4_3')}
                  cleared={isStageCleared('event_snow_4_3')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_4_3');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>

              {/* 4-1 (中央) */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StageNode
                  stageId="event_snow_4_1"
                  visual={stageVisuals['event_snow_4_1']}
                  unlocked={isStageUnlocked('event_snow_4_1')}
                  cleared={isStageCleared('event_snow_4_1')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_4_1');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>
            </div>

            {/* 下方(3-4)へ繋がる輝く光脈 */}
            <div style={{
              marginTop: '12px',
              color: '#00ffff',
              fontSize: '0.75rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>↓ 「裏の裏の裏」3-4 無限創世エンマ神と接続中 ↓</span>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px dashed #00ffff',
            borderRadius: '18px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>🌀 超次元封印領域 🌀</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#00ffff' }}>
              「常夏ビーチ (最裏)」未解放
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ff77aa', marginTop: '6px', lineHeight: 1.5 }}>
              下の <strong style={{ color: '#ffd700' }}>3-4 無限創世エンマ神 (1兆HP)</strong> を倒すと<br />
              次元の壁が完全に崩壊し、最深奥『最裏』が現れる！<br />
              <span style={{ color: '#00ffff', fontWeight: 900 }}>⚡ 最深奥には【体力 5京 (50P)】の極限頂点神 降臨 ⚡</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== 常夏ビーチ (裏の裏の裏) エリア (2-4 神創サマーエンマ10億撃破で最奥次元が顕現！) ===== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '440px',
        margin: '20px auto 10px',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {isDeepestUnlocked ? (
          <div style={{
            width: '100%',
            background: 'linear-gradient(180deg, rgba(20, 0, 40, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
            border: '4px solid #ffd700',
            borderRadius: '24px',
            padding: '20px 16px',
            boxShadow: '0 0 45px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 0, 128, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* 「常夏ビーチ(裏の裏の裏)」レインボーゴールド看板 */}
            <div style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ff007f 50%, #7e22ce 100%)',
              border: '3px solid #ffffff',
              borderRadius: '20px',
              padding: '6px 20px',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🌌</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', textShadow: '0 0 10px #000' }}>
                常夏ビーチ (裏の裏の裏)
              </span>
              <span style={{ fontSize: '1.2rem' }}>🌌</span>
            </div>

            {/* 無限創世エンマ神 3-4 (1兆HP) */}
            <div style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {/* 回転する極輝銀河魔方陣 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px dashed #ffd700',
                boxShadow: '0 0 40px #ffd700, inset 0 0 30px #ff007f',
                animation: 'spin 8s linear infinite'
              }} />

              <div style={{
                position: 'absolute',
                top: '-14px',
                background: 'linear-gradient(90deg, #ffd700, #ff007f)',
                color: '#000',
                fontSize: '0.7rem',
                padding: '3px 12px',
                borderRadius: '12px',
                fontWeight: 900,
                border: '2px solid #fff',
                boxShadow: '0 0 15px #ffd700',
                zIndex: 2
              }}>
                👑 体力1兆 (1Trillion) 次元頂点神 👑
              </div>

              {/* 1兆HP 無限創世エンマ神 */}
              <div
                onClick={() => {
                  const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_3_4');
                  if (s) setSelectedStage(s);
                }}
                style={{
                  width: '125px',
                  height: '125px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #ffd700 0%, #ff007f 60%, #1e1b4b 100%)',
                  border: '5px solid #ffffff',
                  boxShadow: '0 0 50px rgba(255, 215, 0, 1), inset 0 0 25px #ff007f',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '3.6rem', filter: 'drop-shadow(0 0 16px #ffd700)' }}>👑☀️🌌🔥</span>
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  background: 'linear-gradient(90deg, #1e1b4b, #ff007f)',
                  border: '2px solid #ffd700',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.9)'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffd700' }}>
                    3-4: 無限創世エンマ神 (1兆HP)
                  </span>
                </div>
              </div>
            </div>

            {/* 裏の裏の裏 ステージノード配置 (3-2 & 3-3, 3-1) */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              {/* 3-2 (左) & 3-3 (右) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <StageNode
                  stageId="event_snow_3_2"
                  visual={stageVisuals['event_snow_3_2']}
                  unlocked={isStageUnlocked('event_snow_3_2')}
                  cleared={isStageCleared('event_snow_3_2')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_3_2');
                    if (s) setSelectedStage(s);
                  }}
                />
                <StageNode
                  stageId="event_snow_3_3"
                  visual={stageVisuals['event_snow_3_3']}
                  unlocked={isStageUnlocked('event_snow_3_3')}
                  cleared={isStageCleared('event_snow_3_3')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_3_3');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>

              {/* 3-1 (中央) */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StageNode
                  stageId="event_snow_3_1"
                  visual={stageVisuals['event_snow_3_1']}
                  unlocked={isStageUnlocked('event_snow_3_1')}
                  cleared={isStageCleared('event_snow_3_1')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_3_1');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>
            </div>

            {/* 下方(2-4)へ繋がる輝く光脈 */}
            <div style={{
              marginTop: '12px',
              color: '#ffd700',
              fontSize: '0.75rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>↓ 「裏の裏」2-4 神創サマーエンマと接続中 ↓</span>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px dashed #ffd700',
            borderRadius: '18px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>🌌 次元封印領域 🌌</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffd700' }}>
              「常夏ビーチ (裏の裏の裏)」未解放
            </div>
            <div style={{ fontSize: '0.75rem', color: '#ff77aa', marginTop: '6px', lineHeight: 1.5 }}>
              下の <strong style={{ color: '#fef08a' }}>2-4 神創サマーエンマ大王 (10億HP)</strong> を倒すと<br />
              次元が裂けて最高峰『裏の裏の裏』が現れる！<br />
              <span style={{ color: '#ffd700', fontWeight: 900 }}>⚡ 最奥には【体力 1兆 (1Trillion)】の次元頂点神 降臨 ⚡</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== 常夏ビーチ (裏の裏) エリア (サマーエンマ大王撃破で延伸現出！) ===== */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '440px',
        margin: '20px auto 10px',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {isDeepUnlocked ? (
          <div style={{
            width: '100%',
            background: 'linear-gradient(180deg, rgba(88,28,135,0.85) 0%, rgba(30,27,75,0.95) 100%)',
            border: '3px solid #f59e0b',
            borderRadius: '24px',
            padding: '20px 16px',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* 「常夏ビーチ(裏の裏)」ゴールド看板 */}
            <div style={{
              background: 'linear-gradient(135deg, #880022 0%, #4c0519 100%)',
              border: '2px solid #fde047',
              borderRadius: '20px',
              padding: '6px 20px',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fef08a', textShadow: '0 0 8px #f59e0b' }}>
                常夏ビーチ (裏の裏)
              </span>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
            </div>

            {/* 神創・サマーエンマ大王 創世最奥神殿 (10億HP) */}
            <div style={{
              position: 'relative',
              width: '160px',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {/* 回転する魔方陣 */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px dashed #ef4444',
                boxShadow: '0 0 30px #f43f5e, inset 0 0 25px #a855f7',
                animation: 'spin 12s linear infinite'
              }} />

              <div style={{
                position: 'absolute',
                top: '-12px',
                background: 'linear-gradient(90deg, #dc2626, #7f1d1d)',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '2px 10px',
                borderRadius: '10px',
                fontWeight: 900,
                border: '1px solid #fca5a5',
                boxShadow: '0 0 10px #f43f5e',
                zIndex: 2
              }}>
                👑 体力10億 (1B) 極ボス 👑
              </div>

              {/* 10億HP 神創サマーエンマ大王 */}
              <div
                onClick={() => {
                  const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_2_4');
                  if (s) setSelectedStage(s);
                }}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #880022 0%, #4c0519 70%, #000 100%)',
                  border: '4px solid #fde047',
                  boxShadow: '0 0 40px rgba(254, 224, 71, 0.9), inset 0 0 20px #ef4444',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '3.2rem', filter: 'drop-shadow(0 0 12px #fde047)' }}>☀️👑🔥</span>
                <div style={{
                  position: 'absolute',
                  bottom: '-14px',
                  background: 'linear-gradient(90deg, #4c0519, #880022)',
                  border: '2px solid #fde047',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.9)'
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#fef08a' }}>
                    2-4: 神創サマーエンマ (10億HP)
                  </span>
                </div>
              </div>
            </div>

            {/* 裏の裏 ステージノード配置 (2-2 & 2-3, 2-1) */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              {/* 2-2 (左) & 2-3 (右) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <StageNode
                  stageId="event_snow_2_2"
                  visual={stageVisuals['event_snow_2_2']}
                  unlocked={isStageUnlocked('event_snow_2_2')}
                  cleared={isStageCleared('event_snow_2_2')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_2_2');
                    if (s) setSelectedStage(s);
                  }}
                />
                <StageNode
                  stageId="event_snow_2_3"
                  visual={stageVisuals['event_snow_2_3']}
                  unlocked={isStageUnlocked('event_snow_2_3')}
                  cleared={isStageCleared('event_snow_2_3')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_2_3');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>

              {/* 2-1 (中央) */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StageNode
                  stageId="event_snow_2_1"
                  visual={stageVisuals['event_snow_2_1']}
                  unlocked={isStageUnlocked('event_snow_2_1')}
                  cleared={isStageCleared('event_snow_2_1')}
                  onClick={() => {
                    const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_2_1');
                    if (s) setSelectedStage(s);
                  }}
                />
              </div>
            </div>

            {/* 下方(1-5)へ繋がる輝く光脈 */}
            <div style={{
              marginTop: '12px',
              color: '#fde047',
              fontSize: '0.75rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>↓ 「常夏ビーチ(裏)」1-5 サマーエンマ大王と接続中 ↓</span>
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px dashed #a855f7',
            borderRadius: '18px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>🔒 封印の領域 🔒</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#e9d5ff' }}>
              「常夏ビーチ (裏の裏)」未解放
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '6px', lineHeight: 1.5 }}>
              下の <strong style={{ color: '#fef08a' }}>1-5 サマーエンマ大王</strong> を倒すと<br />
              上の方向にマップが延伸し『裏の裏』が現れる！<br />
              <span style={{ color: '#f43f5e', fontWeight: 900 }}>⚡ 最奥には【体力 10億 (1B)】の神創ボス降臨 ⚡</span>
            </div>
          </div>
        )}
      </div>

      {/* 左右の上部機能ボタン (イベントクエスト & 宝箱) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px',
        marginTop: '-10px',
        pointerEvents: 'none'
      }}>
        {/* 左: イベントクエスト */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/missions')}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              border: '3px solid #86efac',
              boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📜</span>
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff'
            }}>!</div>
          </button>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, marginTop: '2px', textShadow: '0 1px 2px #000' }}>クエスト</span>
        </div>

        {/* 右: 宝箱 (裏コンプリート報酬) */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (isAllCleared) {
                alert('🎉 常夏ビーチ(裏)完全制覇！\n特別超豪華報酬:\n🌟 Yポイント +10,000 pt\n💵 50,000マネー\n📖 ひっさつの秘伝書 ×5 を獲得！');
              } else {
                alert('🎁 常夏裏マップの全5ステージをクリアすると限定超豪華宝箱が開きます！');
              }
            }}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: isAllCleared
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #475569, #334155)',
              border: `3px solid ${isAllCleared ? '#fef08a' : '#94a3b8'}`,
              boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Gift size={26} color={isAllCleared ? '#fff' : '#cbd5e1'} />
          </button>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, marginTop: '2px', textShadow: '0 1px 2px #000' }}>
            {isAllCleared ? '受取可能!' : '超豪華宝箱'}
          </span>
        </div>
      </div>

      {/* 中央最奥の祭壇 (水着ふぶき姫 トロピカル祭壇 & オーラ演出) */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* トロピカルサンシャインリング */}
        <div style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* 回転・明滅するトロピカルリング */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px dashed #fbbf24',
            boxShadow: '0 0 25px #f59e0b, inset 0 0 20px #ec4899',
            opacity: 0.9,
            animation: 'spin 20s linear infinite'
          }} />

          {/* 夏の結界タグ */}
          <div style={{
            position: 'absolute',
            top: '-15px',
            background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
            color: '#fff',
            fontSize: '0.65rem',
            padding: '2px 10px',
            borderRadius: '10px',
            fontWeight: 900,
            border: '1px solid #fbcfe8',
            boxShadow: '0 0 10px #f43f5e'
          }}>
            🌺 常夏結界 🌺
          </div>

          {/* 水着ふぶき姫 でかぷに本体 (最奥の特大演出) */}
          <div
            onClick={() => {
              const stage = EVENT_SNOW_STAGES.find(s => s.id === 'event_snow_1_5');
              if (stage) setSelectedStage(stage);
            }}
            style={{
              width: '115px',
              height: '115px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f472b6 0%, #db2777 60%, #831843 100%)',
              border: '4px solid #fef08a',
              boxShadow: '0 0 35px rgba(236, 72, 153, 0.9), 0 0 70px rgba(245, 158, 11, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* サマーエンマ大王 アイコン */}
            <span style={{ fontSize: '3.4rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' }}>👑🏖️🔥</span>

            {/* ボス名プレート */}
            <div style={{
              position: 'absolute',
              bottom: '-14px',
              background: 'linear-gradient(90deg, #7f1d1d, #991b1b)',
              border: '2px solid #fde047',
              borderRadius: '12px',
              padding: '3px 12px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fef08a' }}>
                サマーエンマ大王 (常夏Ver)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ステージマップ配置 (ピラミッド状配置: 画像を模したノード配置) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '440px',
        margin: '25px auto 0',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* 上段: 1-4 (左) & 1-5 (右) */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {/* 1-4 */}
          <StageNode
            stageId="event_snow_1_4"
            visual={stageVisuals['event_snow_1_4']}
            unlocked={isStageUnlocked('event_snow_1_4')}
            cleared={isStageCleared('event_snow_1_4')}
            onClick={() => {
              const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_1_4');
              if (s) setSelectedStage(s);
            }}
          />

          {/* 1-5 */}
          <StageNode
            stageId="event_snow_1_5"
            visual={stageVisuals['event_snow_1_5']}
            unlocked={isStageUnlocked('event_snow_1_5')}
            cleared={isStageCleared('event_snow_1_5')}
            onClick={() => {
              const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_1_5');
              if (s) setSelectedStage(s);
            }}
          />
        </div>

        {/* 中段: 1-2 (左) & 1-3 (右) */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 20px' }}>
          {/* 1-2 */}
          <StageNode
            stageId="event_snow_1_2"
            visual={stageVisuals['event_snow_1_2']}
            unlocked={isStageUnlocked('event_snow_1_2')}
            cleared={isStageCleared('event_snow_1_2')}
            onClick={() => {
              const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_1_2');
              if (s) setSelectedStage(s);
            }}
          />

          {/* 1-3 */}
          <StageNode
            stageId="event_snow_1_3"
            visual={stageVisuals['event_snow_1_3']}
            unlocked={isStageUnlocked('event_snow_1_3')}
            cleared={isStageCleared('event_snow_1_3')}
            onClick={() => {
              const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_1_3');
              if (s) setSelectedStage(s);
            }}
          />
        </div>

        {/* 最下段: 1-1 (中央) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <StageNode
            stageId="event_snow_1_1"
            visual={stageVisuals['event_snow_1_1']}
            unlocked={isStageUnlocked('event_snow_1_1')}
            cleared={isStageCleared('event_snow_1_1')}
            onClick={() => {
              const s = EVENT_SNOW_STAGES.find(st => st.id === 'event_snow_1_1');
              if (s) setSelectedStage(s);
            }}
          />
        </div>
      </div>

      {/* ウィスパーのアドバイスダイアログ（画像左下のウィスパー） */}
      <div style={{
        maxWidth: '420px',
        margin: '30px auto 10px',
        padding: '0 16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '2px solid #38bdf8',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
        }}>
          {/* ウィスパーアイコン */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            flexShrink: 0,
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}>
            👻
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 900 }}>ウィスパーのアドバイス</div>
            <div style={{ fontSize: '0.8rem', color: '#f1f5f9', marginTop: '2px', lineHeight: 1.4, fontWeight: 600 }}>
              「ここは常夏ビーチでウィス！ステージクリアで『サマーコイン (🏝️)』が手に入るでウィス！最初のステージでも5枚もらえるから、コインを貯めて『超高級ガシャ』や『超ウルトラガシャ』に挑戦するでウィス！」
            </div>
          </div>
        </div>
      </div>

      {/* 特効キャラ所持状態サマリー */}
      <div style={{
        maxWidth: '420px',
        margin: '10px auto',
        padding: '0 16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))',
          border: '1px solid #f43f5e',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#fbbf24" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fca5a5' }}>
              特効キャラ所持: {ownedBoostChars.length} / {boostChars.length}体
            </span>
          </div>
          <button
            onClick={() => navigate('/gacha')}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ガシャへGO
          </button>
        </div>
      </div>

      {/* ステージ詳細ダイアログモーダル */}
      {selectedStage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: '#1e1b4b',
            border: '3px solid #818cf8',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            {/* モーダルヘッダー */}
            <div style={{
              background: 'linear-gradient(135deg, #312e81, #1e1b4b)',
              padding: '16px',
              textAlign: 'center',
              borderBottom: '2px solid #4338ca',
              position: 'relative'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#a5b4fc' }}>
                {selectedStage.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{selectedStage.areaName}</span>
              <button
                onClick={() => setSelectedStage(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 敵情報 */}
              <div style={{
                background: '#0f172a',
                borderRadius: '14px',
                padding: '14px',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: selectedStage.enemyColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  flexShrink: 0,
                  boxShadow: `0 0 15px ${selectedStage.enemyColor}`
                }}>
                  {selectedStage.enemyEmoji}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc' }}>
                    {selectedStage.enemyName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '4px', fontWeight: 800 }}>
                    ❤️ HP: {selectedStage.enemyHp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '2px', fontWeight: 800 }}>
                    ⚔️ 攻撃力: {selectedStage.enemyAtk.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 報酬 */}
              <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '0.85rem',
                fontWeight: 800
              }}>
                <span style={{ color: '#00cc66' }}>💵 {selectedStage.rewardMoney.toLocaleString()}</span>
                <span style={{ color: '#38bdf8' }}>🏝️ サマーコイン {selectedStage.rewardYPoints.toLocaleString()}</span>
              </div>

              {/* デッキ選択UI */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '14px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 0, 128, 0.25)'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#ff77aa', fontWeight: 900, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚔️ 出撃デッキの選択</span>
                  <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>現在: {savedTeams[activeTeamIndex]?.name || `デッキ${activeTeamIndex + 1}`} ({team.length}体)</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
                  {savedTeams.map((sTeam, idx) => {
                    const isActive = idx === activeTeamIndex;
                    return (
                      <button
                        key={sTeam.id || idx}
                        onClick={() => setActiveTeamIndex(idx)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '10px',
                          background: isActive
                            ? 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)'
                            : 'rgba(255,255,255,0.08)',
                          border: isActive ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: isActive ? 900 : 700,
                          cursor: 'pointer',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          boxShadow: isActive ? '0 0 10px rgba(255,0,128,0.5)' : 'none'
                        }}
                      >
                        {sTeam.name || `デッキ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ロックチェック */}
              {!isStageUnlocked(selectedStage.id) ? (
                <div style={{
                  background: '#450a0a',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  fontWeight: 700
                }}>
                  🔒 前のステージをクリアすると解放されます！
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/game/${selectedStage.id}`)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={22} fill="#ffffff" />
                  バトルへ出撃！
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 個別ステージノード（赤丸台座＋キャラクターぷに）
interface StageNodeProps {
  stageId: string;
  visual: { label: string; icon: string; name: string; color: string; subText: string };
  unlocked: boolean;
  cleared: boolean;
  onClick: () => void;
}

const StageNode: React.FC<StageNodeProps> = ({ visual, unlocked, cleared, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        opacity: unlocked ? 1 : 0.6,
        transition: 'transform 0.15s'
      }}
      onMouseEnter={(e) => { if (unlocked) e.currentTarget.style.transform = 'scale(1.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* クリア星評価 (★★★) */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '2px',
        height: '16px'
      }}>
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={14}
            fill={cleared ? '#fbbf24' : '#475569'}
            color={cleared ? '#f59e0b' : '#334155'}
          />
        ))}
      </div>

      {/* 赤い豪華丸台座 (画像そっくりなレッドベース＋ゴールドリム) */}
      <div style={{
        position: 'relative',
        width: '76px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 台座（赤いベルベットベース） */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '72px',
          height: '28px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #dc2626 0%, #991b1b 70%, #450a0a 100%)',
          border: '3px solid #fbbf24',
          boxShadow: '0 6px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
        }} />

        {/* ぷにキャラアイコン */}
        <div style={{
          position: 'relative',
          top: '-8px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${visual.color} 70%, #0f172a 100%)`,
          border: '3px solid #ffffff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 -4px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          {unlocked ? visual.icon : '🔒'}
        </div>
      </div>

      {/* ステージ番号標識（例: 1-1, 1-2, 1-3...） */}
      <div style={{
        marginTop: '-2px',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        border: '1.5px solid #64748b',
        borderRadius: '10px',
        padding: '1px 10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.5px' }}>
          {visual.label}
        </span>
      </div>
    </div>
  );
};
