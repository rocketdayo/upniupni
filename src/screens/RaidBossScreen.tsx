import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Swords, Flame, ShieldAlert, Users } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { RAID_BOSSES } from '../data/raidData';
import { CHARACTERS } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';

export const RaidBossScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    raidBossHp = {},
    raidClearedBosses = [],
    team,
  } = useGame();

  const [selectedBossId, setSelectedBossId] = useState<string>(RAID_BOSSES[0].id);

  const selectedBoss = RAID_BOSSES.find(b => b.id === selectedBossId) || RAID_BOSSES[0];
  const currentHp = raidBossHp[selectedBoss.id] ?? selectedBoss.maxHp;
  const isCleared = raidClearedBosses.includes(selectedBoss.id) || currentHp <= 0;

  // チームメンバー
  const teamChars = (team.length > 0 ? team : ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'])
    .map(id => CHARACTERS.find(c => c.id === id) || CHARACTERS[0]);

  // 特効倍率算出
  const calculateTotalTraitMultiplier = () => {
    let multiplier = 1.0;
    teamChars.forEach(char => {
      selectedBoss.traits.forEach(trait => {
        if (trait.tribeBoost && char.tribe === trait.tribeBoost.tribe) {
          multiplier += trait.tribeBoost.multiplier;
        }
        if (trait.specificCharBoost && trait.specificCharBoost.charIds.includes(char.id)) {
          multiplier += trait.specificCharBoost.multiplier;
        }
      });
    });
    return multiplier;
  };

  const traitMultiplier = calculateTotalTraitMultiplier();

  // パズルバトル出撃
  const handleStartPuzzleBattle = () => {
    navigate(`/stage/${selectedBoss.id}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090d16 0%, #171026 50%, #2e0819 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '2px solid #ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> ホーム
        </button>
        <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#ff4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={20} color="#ff4444" /> 超大型レイドボス強敵討伐戦
        </div>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{
        flex: 1,
        maxWidth: '540px',
        margin: '0 auto',
        width: '100%',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* ボス選択カルーセル */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
          {RAID_BOSSES.map(boss => {
            const isSelected = boss.id === selectedBossId;
            const bHp = raidBossHp[boss.id] ?? boss.maxHp;
            const bCleared = raidClearedBosses.includes(boss.id) || bHp <= 0;

            return (
              <div
                key={boss.id}
                onClick={() => setSelectedBossId(boss.id)}
                style={{
                  flex: '0 0 130px',
                  background: isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? `2px solid ${boss.borderHex}` : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 0 15px ${boss.borderHex}66` : 'none'
                }}
              >
                <div style={{ fontSize: '2rem' }}>{boss.avatarEmoji}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: isSelected ? '#ffffff' : '#94a3b8', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {boss.name.split('・')[1] || boss.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: bCleared ? '#4ade80' : '#f87171', fontWeight: 800, marginTop: '2px' }}>
                  {bCleared ? '🏆 討伐完了' : `${boss.formattedHp}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* 選択ボスのメインカード */}
        <div style={{
          background: selectedBoss.bgGradient,
          border: `2px solid ${selectedBoss.borderHex}`,
          borderRadius: '20px',
          padding: '20px',
          boxShadow: `0 8px 30px ${selectedBoss.borderHex}44`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          {isCleared && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(90deg, #eab308, #ca8a04)',
              color: '#000',
              fontWeight: 950,
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(234, 179, 8, 0.6)'
            }}>
              👑 討伐完了！
            </div>
          )}

          <div style={{ fontSize: '4.5rem', marginBottom: '8px' }}>
            {selectedBoss.avatarEmoji}
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 950, color: '#ffffff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {selectedBoss.name}
          </h2>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
            {selectedBoss.subtitle}
          </div>

          {/* HPバー */}
          <div style={{ width: '100%', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#e2e8f0', marginBottom: '4px', fontWeight: 900 }}>
              <span>討伐HP残量</span>
              <span>
                {currentHp <= 0 ? '0' : (currentHp >= 1000000000000 ? `${(currentHp / 1000000000000).toFixed(2)}兆` : currentHp.toLocaleString())} / {selectedBoss.formattedHp}
              </span>
            </div>
            <div style={{ height: '14px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                width: `${Math.max(0, Math.min(100, (currentHp / selectedBoss.maxHp) * 100))}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* 特効編成状況 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={18} /> 弱点特効ボーナス
            </div>
            <div style={{
              background: traitMultiplier > 1 ? 'linear-gradient(90deg, #ec4899, #f43f5e)' : 'rgba(255,255,255,0.1)',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 950,
              color: '#ffffff'
            }}>
              チーム特効: {traitMultiplier.toFixed(1)}倍 発動中！
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedBoss.traits.map((trait, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#e2e8f0'
              }}>
                <div style={{ fontWeight: 900, color: '#ffd700', marginBottom: '2px' }}>
                  {trait.tribeBoost?.label || trait.skillTypeBoost?.label || trait.specificCharBoost?.label || '⚔️ 特殊特効'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {trait.description}
                </div>
              </div>
            ))}
          </div>

          {/* 出撃チームメンバー */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} /> 出撃チーム (タップで編成画面へ)
            </div>
            <div
              onClick={() => navigate('/team')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.4)',
                padding: '8px 12px',
                borderRadius: '14px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {teamChars.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <CharacterAvatar character={c} size={42} />
                  <span style={{ fontSize: '0.62rem', color: '#e2e8f0', maxWidth: '44px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 討伐報酬 */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>撃破討伐報酬</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#fbbf24', marginTop: '2px' }}>
              🔶 {selectedBoss.rewardYPoints.toLocaleString()} Ypt ＋ {selectedBoss.rewardItemName}
            </div>
          </div>
          <div style={{ fontSize: '2rem' }}>{selectedBoss.rewardItemIcon}</div>
        </div>

        {/* 出撃ボタン */}
        <button
          onClick={handleStartPuzzleBattle}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            color: '#ffffff',
            fontSize: '1.2rem',
            fontWeight: 950,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)',
            transition: 'transform 0.1s active'
          }}
        >
          <Swords size={24} /> 本格パズルでレイドボスに出撃！
        </button>
      </div>
    </div>
  );
};
export default RaidBossScreen;
