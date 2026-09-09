import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Swords, Trophy, Play, ShoppingBag, Crown } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { BLEACH_EVENT_STAGES, type Stage } from '../data/stages';
import { CHARACTERS } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { BleachRingShopModal } from '../components/BleachRingShopModal';

export const BleachStageMap: React.FC = () => {
  const navigate = useNavigate();
  const { clearedStages, bleachRings = 0, yPoints = 0, items } = useGame();
  const [isShopOpen, setIsShopOpen] = useState(false);

  // Z' Espada characters for featured banner
  const espadaChars = CHARACTERS.filter(c => c.rank === "Z'");

  const formatHpText = (hp: number): string => {
    if (hp >= 100000000) {
      const oku = (hp / 100000000).toFixed(hp % 100000000 === 0 ? 0 : 1);
      return `${oku}億`;
    }
    if (hp >= 10000) {
      const man = Math.round(hp / 10000);
      return `${man}万`;
    }
    return hp.toLocaleString();
  };

  const handleStartStage = (stage: Stage) => {
    navigate(`/game/${stage.id}`);
  };

  return (
    <div className="view-container" style={{ background: 'linear-gradient(180deg, #09090b 0%, #1e1b4b 60%, #020617 100%)', color: '#fff', minHeight: '100vh', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/home')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#d946ef', textShadow: '0 0 10px rgba(217, 70, 239, 0.6)' }}>
            ⚔️ 虚圏（ウェコムンド）特設マップ
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#00ffff' }}>【BLEACH】十刃（エスパーダ）全降臨！</span>
        </div>
        <button
          className="btn"
          onClick={() => navigate('/gacha')}
          style={{ background: 'linear-gradient(135deg, #d946ef, #a855f7)', color: '#fff', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, border: '2px solid #00ffff' }}
        >
          <Sparkles size={16} /> ガシャ
        </button>
      </div>

      {/* Currency & Exchange Banner */}
      <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '2px solid #a855f7', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>💍</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>所持ブリーチリング</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f0abfc' }}>{(bleachRings || 0).toLocaleString()} 個</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>💎</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>所持 神昇の秘石</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fde047' }}>{(items?.godAscensionStone || 0).toLocaleString()} 個</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🔶</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>所持 Yポイント</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>{(yPoints || 0).toLocaleString()} pt</div>
            </div>
          </div>
        </div>

        {/* Buttons: Ring Shop & God Ascension */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsShopOpen(true)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9333ea 0%, #d946ef 100%)',
              color: '#ffffff',
              border: '2px solid #f0abfc',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 0 15px rgba(217, 70, 239, 0.4)'
            }}
          >
            <ShoppingBag size={18} />
            <span>💍 BLEACHリング交換所</span>
          </button>
          <button
            onClick={() => navigate('/ascension')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #854d0e 0%, #ca8a04 100%)',
              color: '#fef08a',
              border: '2px solid #ffd700',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 0 15px rgba(250, 204, 21, 0.4)'
            }}
          >
            <Crown size={18} color="#ffd700" />
            <span>👑 神昇の祭壇（ZZ）</span>
          </button>
        </div>
      </div>

      {/* Featured Espada Z' Scroll */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f0abfc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} color="#00ffff" />
          <span>【Z'ランク】登場十刃（エスパーダ）＆崩玉藍染</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {espadaChars.map(c => (
            <div key={c.id} style={{ flexShrink: 0, textAlign: 'center', width: '70px' }}>
              <div style={{ width: '56px', height: '56px', margin: '0 auto', position: 'relative' }}>
                <CharacterAvatar character={c} size={56} showRankBadge />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#e2e8f0', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.name.split('・')[1] || c.name.split('（')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stages List */}
      <h3 style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Swords size={18} /> 特設討伐ステージ一覧
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '30px' }}>
        {BLEACH_EVENT_STAGES.map((st, idx) => {
          const isCleared = clearedStages.includes(st.id);

          return (
            <div
              key={st.id}
              style={{
                background: isCleared ? 'rgba(30, 27, 75, 0.7)' : 'rgba(15, 23, 42, 0.85)',
                border: idx === BLEACH_EVENT_STAGES.length - 1 ? '3px solid #d946ef' : '2px solid #3b82f6',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: idx === BLEACH_EVENT_STAGES.length - 1 ? '0 0 15px rgba(217, 70, 239, 0.5)' : '0 4px 12px rgba(0,0,0,0.4)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '2rem',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #c084fc',
                  flexShrink: 0
                }}>
                  {st.enemyEmoji || '⚔️'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', background: '#d946ef', color: '#fff', padding: '1px 6px', borderRadius: '6px', fontWeight: 900 }}>
                      {st.name}
                    </span>
                    {isCleared && (
                      <span style={{ fontSize: '0.65rem', background: '#22c55e', color: '#fff', padding: '1px 6px', borderRadius: '6px', fontWeight: 900 }}>
                        CLEAR!
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                    {st.enemyName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                    HP: <strong style={{ color: '#f43f5e' }}>{formatHpText(st.enemyHp)} ({st.enemyHp.toLocaleString()})</strong> | 攻撃力: <strong style={{ color: '#fb923c' }}>{st.enemyAtk.toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '1px' }}>
                    撃破報酬: <strong style={{ color: '#fde047' }}>+{st.rewardYPoints.toLocaleString()} pt</strong> + <strong style={{ color: '#f0abfc' }}>💍{st.id === 'bleach_st_8' ? 1000 : st.id === 'bleach_st_7' ? 250 : st.id === 'bleach_st_6' ? 50 : st.id === 'bleach_st_5' ? 10 : st.id === 'bleach_st_4' ? 7 : st.id === 'bleach_st_3' ? 5 : st.id === 'bleach_st_2' ? 3 : 1}個</strong>
                  </div>
                  {(st.id === 'bleach_st_6' || st.id === 'bleach_st_7' || st.id === 'bleach_st_8') && (
                    <div style={{
                      marginTop: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '1px solid #ffd700',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '0.68rem',
                      color: '#fef08a',
                      fontWeight: 800
                    }}>
                      <span>👑 初クリア特別報酬: 💎 神昇の秘石 x{st.id === 'bleach_st_8' ? '2' : '1'}</span>
                      {isCleared && <span style={{ color: '#86efac' }}>(獲得済)</span>}
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn"
                onClick={() => handleStartStage(st)}
                style={{
                  background: 'linear-gradient(135deg, #d946ef, #9333ea)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '2px solid #00ffff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Play size={16} fill="white" /> 出撃
              </button>
            </div>
          );
        })}
      </div>

      {/* BLEACH Ring Exchange Modal */}
      <BleachRingShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    </div>
  );
};
