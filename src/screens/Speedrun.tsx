import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { SPEEDRUN_COURSES, getSpeedrunRank } from '../data/speedrunData';
import { CHARACTERS } from '../data/characters';
import { subscribeToSpeedrunLeaderboard, saveSpeedrunRecordToFirebase } from '../firebase';
import type { SpeedrunLeaderboardEntry } from '../firebase';
import { ArrowLeft, Play, Timer, Trophy, Sparkles, Globe, RefreshCw } from 'lucide-react';

export const Speedrun: React.FC = () => {
  const navigate = useNavigate();
  const { speedrunRecords = {}, selectedTitle, team = [] } = useGame();
  const equippedTitle = selectedTitle || '新米妖怪レーサー';
  const [selectedCourseId, setSelectedCourseId] = useState<string>(SPEEDRUN_COURSES[0].id);
  const [activeTab, setActiveTab] = useState<'challenge' | 'ranking'>('challenge');
  const [leaderboard, setLeaderboard] = useState<SpeedrunLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const currentCourse = SPEEDRUN_COURSES.find(c => c.id === selectedCourseId) || SPEEDRUN_COURSES[0];
  const userRecord = speedrunRecords[currentCourse.id];

  useEffect(() => {
    setLoadingLeaderboard(true);
    const unsubscribe = subscribeToSpeedrunLeaderboard(selectedCourseId, (records) => {
      setLeaderboard(records);
      setLoadingLeaderboard(false);
    });
    return () => unsubscribe();
  }, [selectedCourseId]);

  const handleSyncBestTime = async () => {
    if (!userRecord) {
      setSyncStatus('まだこのコースのクリア記録がありません！');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }
    setSyncStatus('全国オンライン記録に送信中...');
    try {
      await saveSpeedrunRecordToFirebase(
        selectedCourseId,
        userRecord.timeMs,
        equippedTitle || '新米妖怪レーサー',
        team || []
      );
      setSyncStatus('全国ランキングに記録を反映しました！✨');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('送信に失敗しました');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050b14 0%, #0c1e38 50%, #050b14 100%)',
      color: '#ffffff',
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
      {/* ── ヘッダー ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 11, 20, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
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
          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 900, letterSpacing: '1px' }}>
            SPEEDRUN TIME ATTACK
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#ffffff', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
            ⏱️ 最速討伐スピードラン
          </div>
        </div>

        <div style={{ width: '40px' }} />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* ── タブ切替 ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab('challenge')}
            style={{
              padding: '10px 4px',
              borderRadius: '14px',
              border: activeTab === 'challenge' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'challenge'
                ? 'linear-gradient(135deg, #075985, #0284c7)'
                : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'challenge' ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none'
            }}
          >
            <Timer size={16} /> コース挑戦
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            style={{
              padding: '10px 4px',
              borderRadius: '14px',
              border: activeTab === 'ranking' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'ranking'
                ? 'linear-gradient(135deg, #b45309, #d97706)'
                : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'ranking' ? '0 4px 12px rgba(250, 204, 21, 0.3)' : 'none'
            }}
          >
            <Globe size={16} /> 全国最速ランキング
          </button>
        </div>

        {/* ── コース選択タブ ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {SPEEDRUN_COURSES.map(course => {
            const isSelected = course.id === selectedCourseId;
            const rec = speedrunRecords[course.id];

            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(2, 132, 199, 0.3) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.35)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{course.enemyEmoji}</span>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 950,
                  color: isSelected ? '#38bdf8' : '#ffffff',
                  whiteSpace: 'nowrap'
                }}>
                  {course.difficulty}
                </span>
                {rec ? (
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#fde047',
                    fontWeight: 900,
                    fontFamily: 'monospace'
                  }}>
                    {(rec.timeMs / 1000).toFixed(2)}s ({getSpeedrunRank(rec.timeMs / 1000, course.targetTimes).rank})
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800 }}>
                    未挑戦
                  </span>
                )}
              </button>
            );
          })}
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

        {/* ──────── 1. コース挑戦タブ ──────── */}
        {activeTab === 'challenge' && (
          <>
            {/* 選択中コース詳細カード */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 47, 73, 0.95) 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  background: currentCourse.difficultyColor || 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 950,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  {currentCourse.difficulty}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  クリア報酬: 💰 +{(currentCourse.rewardYPoints * 20).toLocaleString()} / 🔶 +{currentCourse.rewardYPoints.toLocaleString()} Ypt
                </span>
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#ffffff', marginBottom: '6px' }}>
                  {currentCourse.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '14px' }}>
                  {currentCourse.desc}
                </div>

                {/* ボス情報 */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '3rem' }}>{currentCourse.enemyEmoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>TARGET BOSS</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 950, color: '#fff' }}>{currentCourse.enemyName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      HP: {currentCourse.enemyHp.toLocaleString()} / ATK: {currentCourse.enemyAtk.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 自己ベスト記録 */}
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1.5px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>
                      BEST RECORD (自己最速記録)
                    </span>
                    {userRecord && (
                      <button
                        onClick={handleSyncBestTime}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <RefreshCw size={11} /> 送信
                      </button>
                    )}
                  </div>
                  {userRecord ? (() => {
                    const rankObj = getSpeedrunRank(userRecord.timeMs / 1000, currentCourse.targetTimes);
                    return (
                      <div>
                        <div style={{
                          fontSize: '2.4rem',
                          fontWeight: 950,
                          color: '#38bdf8',
                          fontFamily: 'monospace, sans-serif',
                          textShadow: '0 0 15px rgba(56, 189, 248, 0.6)'
                        }}>
                          {(userRecord.timeMs / 1000).toFixed(3)}s
                        </div>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '3px 14px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 950,
                          color: '#fff',
                          background: rankObj.color,
                          boxShadow: '0 0 12px rgba(255, 255, 255, 0.2)'
                        }}>
                          {rankObj.label}
                        </div>
                      </div>
                    );
                  })() : (
                    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 800, padding: '8px 0' }}>
                      まだ記録がありません。最速討伐を目指そう！
                    </div>
                  )}
                </div>

                {/* 目標タイムテーブル */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
                    🏆 ランク評価基準タイム
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <div style={{ background: 'rgba(236, 72, 153, 0.15)', borderRadius: '10px', padding: '6px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 950 }}>RANK S+</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff', fontFamily: 'monospace' }}>
                        {currentCourse.targetTimes.sPlus}s以内
                      </div>
                    </div>
                    <div style={{ background: 'rgba(234, 179, 8, 0.15)', borderRadius: '10px', padding: '6px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: 950 }}>RANK S</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff', fontFamily: 'monospace' }}>
                        {currentCourse.targetTimes.s}s以内
                      </div>
                    </div>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', borderRadius: '10px', padding: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 950 }}>RANK A</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff', fontFamily: 'monospace' }}>
                        {currentCourse.targetTimes.a}s以内
                      </div>
                    </div>
                    <div style={{ background: 'rgba(148, 163, 184, 0.15)', borderRadius: '10px', padding: '6px', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 950 }}>RANK B</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff', fontFamily: 'monospace' }}>
                        {currentCourse.targetTimes.b}s以内
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 出撃ボタン */}
              <button
                onClick={() => navigate(`/game/${currentCourse.id}`, { state: { restart: Date.now() } })}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 950,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.45)',
                  transition: 'transform 0.1s'
                }}
              >
                <Play size={22} fill="#ffffff" /> {currentCourse.title} へ出撃！
              </button>
            </div>

            {/* 攻略のヒント */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Sparkles size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff' }}>
                  最速討伐のための戦略指南
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  💡 <b>開幕技ゲージ持ち妖怪を編成:</b> 開幕から技ゲージが溜まっているパッシブや、でかぷに生成持ちの妖怪を先頭に置くことで、開始1秒での必殺技連打が可能！
                </div>
                <div>
                  ⚡ <b>UZ+++で一撃粉砕:</b> 50倍〜1000倍の超絶火力を誇るUZ+++キャラクターの必殺技を叩き込めば、ボスのHPを一瞬で消し飛ばせます。
                </div>
                <div>
                  ⏱️ <b>コンボの無駄を省く:</b> タイムアタックでは余計な繋ぎをせず、最小限の手数で一気に仕留めるスピード感がRANK S+獲得の鍵です！
                </div>
              </div>
            </div>
          </>
        )}

        {/* ──────── 2. 全国最速ランキングタブ ──────── */}
        {activeTab === 'ranking' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} color="#ffd700" />
                <span style={{ fontSize: '1.05rem', fontWeight: 950, color: '#ffffff' }}>
                  【{currentCourse.title}】全国ランキング
                </span>
              </div>

              <button
                onClick={handleSyncBestTime}
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
                <RefreshCw size={12} /> 自己記録を送信
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '14px' }}>
              全国のリアルプレイヤーによる最速クリア記録です（ボット無しの実在タイム）。
            </div>

            {loadingLeaderboard ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#38bdf8', fontWeight: 800 }}>
                オンライン最速ランキングを読み込み中...
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                このコースのオンライン記録はまだありません。<br />クリアして「自己記録を送信」を押して最初の最速記録者になろう！
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const rankColor = rank === 1 ? '#ffd700' : rank === 2 ? '#e2e8f0' : rank === 3 ? '#f97316' : '#94a3b8';
                  const rankBg = rank === 1 ? 'rgba(255, 215, 0, 0.15)' : rank === 2 ? 'rgba(226, 232, 240, 0.12)' : rank === 3 ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255, 255, 255, 0.03)';
                  const seconds = (entry.timeMs / 1000).toFixed(3);

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
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            borderRadius: '8px',
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            fontWeight: 800
                          }}>
                            {entry.title || '俊足妖怪'}
                          </span>
                          <span style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            fontWeight: 950
                          }}>
                            {getSpeedrunRank(entry.timeMs / 1000, currentCourse.targetTimes).rank}
                          </span>
                        </div>

                        {/* チーム編成アイコン */}
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
                          </div>
                        )}
                      </div>

                      {/* 討伐タイム */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 950,
                          color: '#38bdf8',
                          fontFamily: 'monospace, sans-serif',
                          textShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
                        }}>
                          {seconds}s
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>クリアタイム</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
