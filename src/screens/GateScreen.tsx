import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronRight } from 'lucide-react';
import { useGame } from '../store/GameContext';

import { GATE_ROOM_TYPES, GATE_LEVEL_REWARDS, GATE_FRIENDS, getGateRoomTotalWaves } from '../data/gateData';
import type { GateRoom } from '../data/gateData';

import { formatJapaneseNumber } from '../utils/format';

export const GateScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    gateLevel = 1,
    gateNormalLevel = 1,
    gateBossLevel = 1,
    gateRewardLevel = 1,
    gateBossOpen = false,
    gateRewardOpen = false,
    gateActiveRoom,
    gateCurrentWave = 1,
    gatePlayerHp,
    gateKampo = 2,
    gateClaimedRewards = [],
    gateFriendGiftsClaimed = [],
    openGateRoom,
    consumeKampoItem,
    claimGateReward,
    claimFriendKampo,
    resetGateRoom,
    characters,
    team
  } = useGame();

  const [activeTab, setActiveTab] = useState<'rooms' | 'rewards' | 'friends'>('rooms');
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  // チーム最大HP計算（概算）
  const teamMaxHp = team.reduce((acc, charId) => {
    const char = characters[charId];
    return acc + 300 + (char?.level || 1) * 35;
  }, 0);

  const currentPlayerHp = gatePlayerHp ?? teamMaxHp;
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentPlayerHp / teamMaxHp) * 100)));

  // 現在入室中の間
  const currentActiveRoomDef = GATE_ROOM_TYPES.find(r => r.id === gateActiveRoom);

  const getRoomLevel = (roomType?: string) => {
    if (roomType === 'boss') return gateBossLevel;
    if (roomType === 'reward') return gateRewardLevel;
    return gateNormalLevel || gateLevel;
  };

  const handleStartRoom = (room: GateRoom) => {
    const rType = room.roomType || 'normal';
    if (rType === 'boss' && !gateBossOpen && gateActiveRoom !== room.id) {
      setModalMessage('👿 邪神の間は出現していません。\n通常の間をクリアして出現させましょう！（出現率 35%）');
      return;
    }
    if (rType === 'reward' && !gateRewardOpen && gateActiveRoom !== room.id) {
      setModalMessage('🎁 ご褒美の間は出現していません。\n通常の間をクリアして出現させましょう！（出現率 10%）');
      return;
    }

    if (!gateActiveRoom || gateActiveRoom !== room.id) {
      openGateRoom(room.id);
    }
    const wave = gateActiveRoom === room.id ? gateCurrentWave : 1;
    const roomLv = getRoomLevel(rType);
    const stageId = `gate_${room.id}_lv_${roomLv}_wave_${wave}`;
    navigate(`/stage/${stageId}`);
  };

  const handleUseKampo = () => {
    const res = consumeKampoItem();
    setModalMessage(res.message);
  };

  const handleClaimReward = (key?: string) => {
    if (!key) return;
    const res = claimGateReward(key);
    setModalMessage(res.message);
  };

  const handleClaimFriend = (fId: string) => {
    const res = claimFriendKampo(fId);
    setModalMessage(res.message);
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(180deg, #0b0f19 0%, #1e1b4b 50%, #090d16 100%)',
      color: '#ffffff',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      maxWidth: '640px',
      margin: '0 auto'
    }}>
      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 800
          }}
        >
          <ArrowLeft size={16} />
          <span>ホーム</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 900, letterSpacing: '2px' }}>
            GATE OF CAPRICE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#f5d0fe', textShadow: '0 0 12px rgba(192, 132, 252, 0.6)' }}>
            きまぐれゲート
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #7e22ce, #3b0764)',
          border: '1px solid #c084fc',
          borderRadius: '12px',
          padding: '4px 10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#d8b4fe' }}>通常の間</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#fde047' }}>Lv.{gateNormalLevel || gateLevel}</div>
        </div>
      </div>

      {/* ── 各間の現在のレベルステータス ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        borderRadius: '14px',
        padding: '8px 10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#a5b4fc', fontWeight: 800 }}>🌀 通常の間</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#818cf8' }}>Lv.{gateNormalLevel || gateLevel}</div>
          <div style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: 700 }}>常時開放</div>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 800 }}>👿 邪神の間</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#f87171' }}>Lv.{gateBossLevel}</div>
          <div style={{
            fontSize: '0.62rem',
            color: gateBossOpen ? '#fde047' : '#94a3b8',
            fontWeight: 800,
            background: gateBossOpen ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
            borderRadius: '4px',
            padding: '1px 2px'
          }}>
            {gateBossOpen ? '🔥 出現中！' : '35%で出現'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#fde68a', fontWeight: 800 }}>🎁 ご褒美の間</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#facc15' }}>Lv.{gateRewardLevel}</div>
          <div style={{
            fontSize: '0.62rem',
            color: gateRewardOpen ? '#fde047' : '#94a3b8',
            fontWeight: 800,
            background: gateRewardOpen ? 'rgba(234, 179, 8, 0.4)' : 'transparent',
            borderRadius: '4px',
            padding: '1px 2px'
          }}>
            {gateRewardOpen ? '✨ 出現中！' : '10%で出現'}
          </div>
        </div>
      </div>

      {/* ── 🧪 サバイバルステータス ＆ 漢方バー ── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '2px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} color={hpPercent < 30 ? '#ef4444' : '#22c55e'} fill={hpPercent < 30 ? '#ef4444' : '#22c55e'} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>サバイバル残りチームHP</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: hpPercent < 30 ? '#f87171' : '#4ade80' }}>
                {currentPlayerHp.toLocaleString()} / {teamMaxHp.toLocaleString()} ({hpPercent}%)
              </div>
            </div>
          </div>

          {/* 漢方アイテム使用 */}
          <button
            onClick={handleUseKampo}
            disabled={gateKampo <= 0 || hpPercent >= 100}
            style={{
              background: gateKampo > 0 && hpPercent < 100 ? 'linear-gradient(135deg, #10b981, #047857)' : 'rgba(255,255,255,0.1)',
              border: '2px solid ' + (gateKampo > 0 && hpPercent < 100 ? '#34d399' : 'rgba(255,255,255,0.2)'),
              borderRadius: '12px',
              padding: '6px 12px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: gateKampo > 0 && hpPercent < 100 ? 'pointer' : 'not-allowed',
              opacity: gateKampo > 0 && hpPercent < 100 ? 1 : 0.6,
              boxShadow: gateKampo > 0 ? '0 2px 8px rgba(16,185,129,0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🧪</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>漢方全回復</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 950 }}>所持: {gateKampo}個</div>
            </div>
          </button>
        </div>

        {/* HPバー */}
        <div style={{ height: '10px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
          <div style={{
            height: '100%',
            width: `${hpPercent}%`,
            background: hpPercent < 30 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'linear-gradient(90deg, #16a34a, #22c55e)',
            borderRadius: '5px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* ── ナビゲーションタブ ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('rooms')}
          style={{
            padding: '10px 6px',
            background: activeTab === 'rooms' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'rgba(255,255,255,0.06)',
            border: '2px solid ' + (activeTab === 'rooms' ? '#c084fc' : 'transparent'),
            borderRadius: '12px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🌀 間の選択
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          style={{
            padding: '10px 6px',
            background: activeTab === 'rewards' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(255,255,255,0.06)',
            border: '2px solid ' + (activeTab === 'rewards' ? '#fcd34d' : 'transparent'),
            borderRadius: '12px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          👑 制覇報酬
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            padding: '10px 6px',
            background: activeTab === 'friends' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.06)',
            border: '2px solid ' + (activeTab === 'friends' ? '#38bdf8' : 'transparent'),
            borderRadius: '12px',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🤝 漢方救援
        </button>
      </div>

      {/* ── TAB 1: 間の選択 ── */}
      {activeTab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 進行中の間がある場合のバナー */}
          {currentActiveRoomDef && (
            <div style={{
              background: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
              border: '2px solid #a855f7',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{currentActiveRoomDef.emoji}</span>
                  <div>
                    <span style={{ background: '#ec4899', color: '#fff', fontSize: '0.65rem', fontWeight: 950, padding: '2px 6px', borderRadius: '6px' }}>進行中</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#fff' }}>
                      {currentActiveRoomDef.name} (Lv.{getRoomLevel(currentActiveRoomDef.roomType)})
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc' }}>連戦進行度</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#fde047' }}>
                    Wave {gateCurrentWave} / {getGateRoomTotalWaves(currentActiveRoomDef.roomType || 'normal', getRoomLevel(currentActiveRoomDef.roomType || 'normal'))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={() => handleStartRoom(currentActiveRoomDef)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #e11d48, #be123c)',
                    border: '2px solid #fda4af',
                    borderRadius: '12px',
                    padding: '10px',
                    color: '#ffffff',
                    fontWeight: 950,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)'
                  }}
                >
                  ⚔️ Wave {gateCurrentWave} に突入する！
                </button>
                <button
                  onClick={resetGateRoom}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  撤退
                </button>
              </div>
            </div>
          )}

          {/* 間一覧カード */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GATE_ROOM_TYPES.map(room => {
              const isActive = gateActiveRoom === room.id;
              const rType = room.roomType || 'normal';
              const rLevel = getRoomLevel(rType);
              const isOpen = rType === 'normal' || (rType === 'boss' && gateBossOpen) || (rType === 'reward' && gateRewardOpen);

              return (
                <div
                  key={room.id}
                  style={{
                    background: room.bgGradient,
                    border: '2px solid ' + (isActive ? '#fde047' : isOpen ? (rType === 'boss' ? '#ef4444' : rType === 'reward' ? '#f59e0b' : 'rgba(255, 255, 255, 0.25)') : 'rgba(255, 255, 255, 0.08)'),
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.5)' : 'none',
                    opacity: isOpen ? 1 : 0.65,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '2px solid ' + (isOpen ? room.color : '#475569'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem'
                      }}>
                        {room.emoji}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 950, color: '#ffffff' }}>{room.name}</span>
                          <span style={{
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid #e2e8f0',
                            color: '#fde047',
                            fontSize: '0.75rem',
                            fontWeight: 950,
                            padding: '1px 7px',
                            borderRadius: '6px'
                          }}>
                            Lv.{rLevel}
                          </span>
                          {rType === 'reward' && (
                            <span style={{ background: isOpen ? '#f59e0b' : '#64748b', color: isOpen ? '#000' : '#fff', fontSize: '0.65rem', fontWeight: 950, padding: '1px 6px', borderRadius: '6px' }}>
                              {isOpen ? '✨ 出現中！' : '10%出現'}
                            </span>
                          )}
                          {rType === 'boss' && (
                            <span style={{ background: isOpen ? '#dc2626' : '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 950, padding: '1px 6px', borderRadius: '6px' }}>
                              {isOpen ? '🔥 出現中！' : '35%出現'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                          {room.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 敵と報酬情報 */}
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.35)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>連戦数: </span>
                      <span style={{ fontWeight: 800, color: '#fff' }}>
                        全 {getGateRoomTotalWaves(rType, rLevel)} Wave {rType === 'boss' ? '(一発決戦)' : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>制覇Ypt: </span>
                      <span style={{ fontWeight: 900, color: '#fde047' }}>+{formatJapaneseNumber(Math.floor(room.rewardYp * (1 + (rLevel - 1) * 0.25)))} pt</span>
                    </div>
                  </div>

                  {/* 出撃ボタン */}
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleStartRoom(room)}
                      disabled={!isOpen}
                      style={{
                        background: isOpen ? (rType === 'boss' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : rType === 'reward' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #6366f1, #4f46e5)') : 'rgba(255,255,255,0.08)',
                        border: '2px solid ' + (isOpen ? (rType === 'boss' ? '#fca5a5' : rType === 'reward' ? '#fde047' : '#a5b4fc') : 'rgba(255,255,255,0.1)'),
                        borderRadius: '12px',
                        padding: '8px 18px',
                        color: isOpen ? '#ffffff' : '#64748b',
                        fontWeight: 950,
                        fontSize: '0.9rem',
                        cursor: isOpen ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.4)' : 'none'
                      }}
                    >
                      <span>{isActive ? `Wave ${gateCurrentWave} へ` : isOpen ? 'の間へ突入' : '未出現（通常間クリアで出現）'}</span>
                      {isOpen && <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: 制覇報酬 ── */}
      {activeTab === 'rewards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', padding: '0 4px' }}>
            各間のレベルをクリアしていくと、到達レベルに応じた豪華報酬が解放されます！
          </div>
          {GATE_LEVEL_REWARDS.map(r => {
            const rType = r.roomType || 'normal';
            const userLevel = rType === 'boss' ? gateBossLevel : (rType === 'reward' ? gateRewardLevel : (gateNormalLevel || gateLevel));
            const isUnlocked = userLevel > r.level;
            const isClaimed = gateClaimedRewards.some(c => String(c) === r.key || String(c) === String(r.level));

            return (
              <div
                key={r.key}
                style={{
                  background: isClaimed ? 'rgba(30, 41, 59, 0.5)' : isUnlocked ? 'linear-gradient(135deg, #1e1b4b, #312e81)' : 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid ' + (isClaimed ? '#334155' : isUnlocked ? '#a855f7' : '#1e293b'),
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '2px solid ' + (isUnlocked ? '#c084fc' : '#475569'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem'
                  }}>
                    {r.specialReward?.icon || '🎁'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: rType === 'boss' ? '#fca5a5' : '#a78bfa', fontWeight: 900 }}>
                        {rType === 'boss' ? '👿 邪神' : '🌀 通常'} Lv.{r.level} 制覇
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 950, color: '#ffffff' }}>{r.name}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fde047', marginTop: '2px' }}>
                      {formatJapaneseNumber(r.rewardYPoints)} Ypt {r.specialReward ? `+ ${r.specialReward.name}` : ''}
                    </div>
                    {r.specialReward && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {r.specialReward.description}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <div style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      padding: '6px 12px',
                      borderRadius: '10px'
                    }}>
                      受取済
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(r.key)}
                      disabled={!isUnlocked}
                      style={{
                        background: isUnlocked ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)',
                        border: '2px solid ' + (isUnlocked ? '#fde047' : 'rgba(255,255,255,0.1)'),
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: isUnlocked ? '#000000' : '#64748b',
                        fontWeight: 950,
                        fontSize: '0.85rem',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        boxShadow: isUnlocked ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                      }}
                    >
                      受取
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 3: 漢方救援（フレンド） ── */}
      {activeTab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', padding: '0 4px' }}>
            フレンドに挨拶して、毎日サバイバルHP全回復薬「漢方」をプレゼントしてもらいましょう！
          </div>
          {GATE_FRIENDS.map(f => {
            const isClaimed = gateFriendGiftsClaimed.includes(f.id);

            return (
              <div
                key={f.id}
                style={{
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  border: '2px solid ' + (isClaimed ? '#334155' : '#38bdf8'),
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem'
                  }}>
                    {f.avatar}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 950, color: '#ffffff' }}>{f.name}</span>
                      <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '1px 6px', borderRadius: '6px' }}>{f.rank}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>
                      「{f.message}」
                    </div>
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <div style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      padding: '6px 12px',
                      borderRadius: '10px'
                    }}>
                      受取済
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimFriend(f.id)}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: '2px solid #7dd3fc',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        color: '#ffffff',
                        fontWeight: 950,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
                      }}
                    >
                      🧪 漢方受取
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ポップアップモーダル ── */}
      {modalMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '2px solid #c084fc',
            borderRadius: '20px',
            padding: '24px 20px',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', marginBottom: '16px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {modalMessage}
            </div>
            <button
              onClick={() => setModalMessage(null)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: '2px solid #c084fc',
                borderRadius: '12px',
                padding: '10px 24px',
                color: '#ffffff',
                fontWeight: 950,
                fontSize: '0.9rem',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
