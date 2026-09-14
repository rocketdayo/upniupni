import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { TOWER_ARTIFACTS, TOWER_MILESTONES, getTowerFloorStage } from '../data/towerData';
import { CHARACTERS } from '../data/characters';
import { subscribeToTowerLeaderboard, saveTowerRecordToFirebase } from '../firebase';
import type { TowerLeaderboardEntry } from '../firebase';
import { ArrowLeft, Play, RotateCcw, Trophy, Sparkles, Check, Globe, RefreshCw, Gift } from 'lucide-react';

export const Tower: React.FC = () => {
  const navigate = useNavigate();
  const {
    towerHighestFloor = 1,
    towerCurrentFloor = 1,
    towerClaimedRewards = [],
    towerArtifacts = [],
    selectedTitle,
    team = [],
    claimTowerReward,
    claimAllTowerRewards,
    setTowerCurrentFloor,
  } = useGame();
  const equippedTitle = selectedTitle || '新米妖怪レーサー';

  const [activeTab, setActiveTab] = useState<'challenge' | 'ranking' | 'rewards'>('challenge');
  const [leaderboard, setLeaderboard] = useState<TowerLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const nextFloorStage = getTowerFloorStage(towerCurrentFloor);

  useEffect(() => {
    setLoadingLeaderboard(true);
    const unsubscribe = subscribeToTowerLeaderboard((entries) => {
      setLeaderboard(entries);
      setLoadingLeaderboard(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSyncRecord = async () => {
    setSyncStatus('オンライン同期中...');
    try {
      await saveTowerRecordToFirebase(
        towerHighestFloor,
        equippedTitle || '新米妖怪レーサー',
        team || [],
        towerArtifacts.length
      );
      setSyncStatus('全国オンライン記録に反映しました！✨');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('同期に失敗しました');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleClaimAll = () => {
    const res = claimAllTowerRewards();
    setClaimMessage(res.message);
    setTimeout(() => setClaimMessage(null), 4000);
  };

  const unclaimedCount = TOWER_MILESTONES.filter(
    m => m.floor <= towerHighestFloor && !towerClaimedRewards.includes(m.floor)
  ).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090614 0%, #150d2a 50%, #090614 100%)',
      color: '#ffffff',
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
      {/* ── ヘッダー ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 6, 20, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '8px 12px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> ホーム
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 900, letterSpacing: '1px' }}>
            ENDLESS BOSS RUSH
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#ffffff', textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
            🗼 無限の試練の塔
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '6px 10px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#fde047', fontWeight: 800 }}>最高記録</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff', fontFamily: 'monospace' }}>
            {towerHighestFloor}F
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* ── ナビゲーションタブ ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('challenge')}
            style={{
              padding: '10px 4px',
              borderRadius: '14px',
              border: activeTab === 'challenge' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'challenge'
                ? 'linear-gradient(135deg, #78350f, #b45309)'
                : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'challenge' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            🗼 塔へ出撃
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            style={{
              padding: '10px 4px',
              borderRadius: '14px',
              border: activeTab === 'ranking' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'ranking'
                ? 'linear-gradient(135deg, #075985, #0284c7)'
                : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'ranking' ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Globe size={14} /> 全国ランキング
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            style={{
              padding: '10px 4px',
              borderRadius: '14px',
              border: activeTab === 'rewards' ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'rewards'
                ? 'linear-gradient(135deg, #831843, #db2777)'
                : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: activeTab === 'rewards' ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Gift size={14} /> 報酬 (1000F)
            {unclaimedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -5,
                right: -5,
                background: '#ef4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.65rem',
                fontWeight: 950,
                border: '1.5px solid #fff'
              }}>
                {unclaimedCount}
              </span>
            )}
          </button>
        </div>

        {/* ── 通知メッセージ ── */}
        {syncStatus && (
          <div style={{
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid #38bdf8',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '14px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#38bdf8'
          }}>
            {syncStatus}
          </div>
        )}

        {claimMessage && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.2)',
            border: '1px solid #eab308',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '14px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#fef08a'
          }}>
            {claimMessage}
          </div>
        )}

        {/* ──────── 1. 出撃タブ ──────── */}
        {activeTab === 'challenge' && (
          <>
            {/* メイン出撃カード */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 20, 60, 0.9) 0%, rgba(50, 25, 80, 0.9) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                fontSize: '7rem',
                opacity: 0.15,
                pointerEvents: 'none'
              }}>
                🗼
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 950,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
                }}>
                  CURRENT CHALLENGE
                </span>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  最高踏破: <b style={{ color: '#fde047' }}>{towerHighestFloor} 階層</b>
                </span>
              </div>

              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 900 }}>挑戦中の階層</div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 950,
                  color: '#ffffff',
                  textShadow: '0 0 20px #f59e0b',
                  fontFamily: 'monospace, sans-serif'
                }}>
                  第 {towerCurrentFloor} 階層
                </div>

                {/* ボスプレビュー */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '12px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '2.8rem' }}>{nextFloorStage.enemyEmoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 800 }}>BOSS</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#fff' }}>{nextFloorStage.enemyName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      HP: {nextFloorStage.enemyHp.toLocaleString()} / ATK: {nextFloorStage.enemyAtk.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 出撃ボタン */}
              <button
                onClick={() => navigate(`/game/tower_floor_${towerCurrentFloor}`)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 950,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
                  transition: 'transform 0.1s'
                }}
              >
                <Play size={22} fill="#ffffff" /> 第 {towerCurrentFloor} 階層へ出撃！
              </button>

              {towerCurrentFloor > 1 && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('第1階層から再挑戦しますか？（所持秘宝はリセットされ、1Fから再登頂できます）')) {
                        setTowerCurrentFloor(1);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} /> 1階から再挑戦する
                  </button>
                </div>
              )}
            </div>

            {/* 獲得中の試練の秘宝一覧 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="#fbbf24" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff' }}>
                    獲得中の試練の秘宝 ({towerArtifacts.length}個)
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>5階層突破毎に獲得</span>
              </div>

              {towerArtifacts.length === 0 ? (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem'
                }}>
                  まだ秘宝を獲得していません。<br />5F, 10F, 15F などの節目ボスを討伐すると強力な秘宝を選んで獲得できます！
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {towerArtifacts.map(artId => {
                    const art = TOWER_ARTIFACTS.find(a => a.id === artId);
                    if (!art) return null;
                    return (
                      <div
                        key={art.id}
                        style={{
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ fontSize: '1.6rem' }}>{art.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047' }}>{art.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{art.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ──────── 2. 全国オンラインランキングタブ ──────── */}
        {activeTab === 'ranking' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} color="#38bdf8" />
                <span style={{ fontSize: '1.1rem', fontWeight: 950, color: '#ffffff' }}>
                  全国オンライン踏破ランキング
                </span>
              </div>

              <button
                onClick={handleSyncRecord}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(56, 189, 248, 0.4)'
                }}
              >
                <RefreshCw size={12} /> 自分の記録を送信
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '14px' }}>
              リアルタイムで全国のプレイヤーの到達階層が集計されています（ボットなしの実在プレイヤー限定）。
            </div>

            {loadingLeaderboard ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#38bdf8', fontWeight: 800 }}>
                オンラインリーダーボードを読み込み中...
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                現在オンライン記録はまだありません。<br />「自分の記録を送信」を押して最初の登頂者になろう！
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const rankColor = rank === 1 ? '#ffd700' : rank === 2 ? '#e2e8f0' : rank === 3 ? '#f97316' : '#94a3b8';
                  const rankBg = rank === 1 ? 'rgba(255, 215, 0, 0.15)' : rank === 2 ? 'rgba(226, 232, 240, 0.12)' : rank === 3 ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255, 255, 255, 0.03)';

                  return (
                    <div
                      key={entry.userId || idx}
                      style={{
                        background: rankBg,
                        border: `1px solid ${rank <= 3 ? rankColor : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '16px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      {/* 順位 */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: rank <= 3 ? rankColor : '#334155',
                        color: rank <= 3 ? '#000000' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 950,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {rank}
                      </div>

                      {/* プレイヤー情報 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 950, fontSize: '0.95rem', color: '#ffffff' }}>
                            {entry.playerName}
                          </span>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '8px',
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            fontWeight: 800
                          }}>
                            {entry.title || '一般妖怪'}
                          </span>
                        </div>

                        {/* 出撃チームのキャラアイコン */}
                        {entry.team && entry.team.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            {entry.team.slice(0, 5).map((charId: string, cIdx: number) => {
                              const char = CHARACTERS.find(c => c.id === charId);
                              return (
                                <span
                                  key={cIdx}
                                  title={char?.name}
                                  style={{
                                    fontSize: '1rem',
                                    background: 'rgba(0,0,0,0.4)',
                                    borderRadius: '6px',
                                    padding: '2px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                  }}
                                >
                                  {char?.emoji || '👾'}
                                </span>
                              );
                            })}
                            {entry.artifactsCount !== undefined && entry.artifactsCount > 0 && (
                              <span style={{ fontSize: '0.65rem', color: '#fde047', marginLeft: '4px' }}>
                                秘宝{entry.artifactsCount}個
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 到達階層 */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 950,
                          color: '#fde047',
                          fontFamily: 'monospace, sans-serif',
                          textShadow: '0 0 10px rgba(253, 224, 71, 0.4)'
                        }}>
                          {entry.floor}F
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>踏破</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────── 3. 報酬タブ（1000F対応＆一括受取） ──────── */}
        {activeTab === 'rewards' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff' }}>
                  階層到達マイルストーン報酬 (全{TOWER_MILESTONES.length}段階 / 最大1000F)
                </span>
              </div>

              {unclaimedCount > 0 && (
                <button
                  onClick={handleClaimAll}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 950,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  一括受取 ({unclaimedCount}件)
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.5 }}>
              💎 <b>神昇の秘石</b> は50階層突破で1個、100階層突破で2個獲得できます！<br />
              100F〜500Fは10階層ごと、500F〜1000Fは50階層ごとに豪華報酬を獲得可能！
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TOWER_MILESTONES.map(m => {
                const isCleared = towerHighestFloor >= m.floor;
                const isClaimed = towerClaimedRewards.includes(m.floor);
                const isSpecialMilestone = m.floor === 50 || m.floor === 100 || m.floor === 500 || m.floor === 1000;

                return (
                  <div
                    key={m.floor}
                    style={{
                      background: isClaimed
                        ? 'rgba(255, 255, 255, 0.02)'
                        : isSpecialMilestone
                        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(217, 70, 239, 0.15) 100%)'
                        : isCleared
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
                        : 'rgba(0, 0, 0, 0.25)',
                      border: isClaimed
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : isSpecialMilestone
                        ? '2px solid #ffd700'
                        : isCleared
                        ? '1.5px solid #f59e0b'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      opacity: isClaimed ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isSpecialMilestone ? 'linear-gradient(135deg, #ffd700, #ea580c)' : isCleared ? '#f59e0b' : '#334155',
                        color: isSpecialMilestone ? '#000000' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 950,
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        flexShrink: 0
                      }}>
                        <span>{m.floor}</span>
                        <span style={{ fontSize: '0.6rem', marginTop: '-2px' }}>F</span>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isSpecialMilestone ? '#fde047' : isCleared ? '#fde047' : '#ffffff' }}>
                          第 {m.floor} 階層 突破報酬 {isSpecialMilestone && '👑 記念特別階層！'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                          {m.rewardDesc}
                        </div>
                      </div>
                    </div>

                    {/* 報酬受取ボタン */}
                    <div>
                      {isClaimed ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          fontWeight: 800
                        }}>
                          <Check size={14} /> 受取済
                        </span>
                      ) : isCleared ? (
                        <button
                          onClick={() => {
                            const res = claimTowerReward(m.floor);
                            setClaimMessage(res.message);
                            setTimeout(() => setClaimMessage(null), 3000);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#ffffff',
                            padding: '8px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 950,
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
                          }}
                        >
                          受け取る
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>
                          未到達
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
