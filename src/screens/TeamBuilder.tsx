import React, { useState, useMemo } from 'react';
import { useGame, MIN_TEAM_SIZE_UNLOCK_COSTS } from '../store/GameContext';
import { CHARACTERS, getCharacterMaxLevel, getSkillDetails, getTribeMultiplier, TRIBES } from '../data/characters';
import type { Rank } from '../data/characters';
import { ArrowLeft, ArrowUpCircle, ChevronLeft, ChevronRight, Check, Star, Zap, Unlock, Award, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { ALL_TITLES } from '../data/titles';

const rankCostMultipliers: Record<Rank, number> = {
  'Z': 10000, 'SSS': 1000, 'SS': 500, 'S': 300, 'A': 200, 'B': 150, 'C': 100, 'D': 80, 'E': 50
};
const RANK_COLORS: Record<Rank, string> = {
  Z: '#00ffff', SSS: '#ffd700', SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
};
const CHARS_PER_PAGE = 12;

const StarRating = ({ count, max = 5 }: { count: number; max?: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[...Array(max)].map((_, i) => (
      <Star key={i} size={12} fill={i < count ? '#ffcc00' : 'none'} color={i < count ? '#ffcc00' : '#888'} />
    ))}
  </div>
);

const TeamBuilder = () => {
  const {
    characters,
    team,
    money,
    yPoints,
    items,
    minRequiredTeamSize = 5,
    selectedTitle = '新米妖怪レーサー',
    unlockedTitles = ['新米妖怪レーサー'],
    savedTeams = [
      { id: 'team_1', name: 'デッキ1', team: [] },
      { id: 'team_2', name: 'デッキ2', team: [] },
      { id: 'team_3', name: 'デッキ3', team: [] },
    ],
    activeTeamIndex = 0,
    setTeam,
    setActiveTeamIndex,
    updateSavedTeamName,
    getTeamSlotAddCost,
    addTeamSlot,
    unlockMinRequiredTeamSize,
    upgradeCharacter,
    consumeExpItem,
    consumeSkillBook,
    consumeGodSkillBook,
    consumeSuperLimitBreakBook,
    setSelectedTitle
  } = useGame();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTargetIdx, setRenameTargetIdx] = useState<number>(0);
  const [renameInput, setRenameInput] = useState<string>('');
  const [notice, setNotice] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [selectedRank, setSelectedRank] = useState<Rank | 'ALL'>('ALL');
  const [selectedTribe, setSelectedTribe] = useState<string | 'ALL'>('ALL');

  const ownedChars = CHARACTERS.filter(c => {
    if (!characters[c.id]) return false;
    if (selectedRank !== 'ALL' && c.rank !== selectedRank) return false;
    if (selectedTribe !== 'ALL' && c.tribe !== selectedTribe) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(ownedChars.length / CHARS_PER_PAGE));
  const currentChars = ownedChars.slice(currentPage * CHARS_PER_PAGE, (currentPage + 1) * CHARS_PER_PAGE);

  // 集計: チーム内の各種族キャラ数
  const tribeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    team.forEach(id => {
      const c = CHARACTERS.find(x => x.id === id);
      if (c) {
        counts[c.tribe] = (counts[c.tribe] || 0) + 1;
      }
    });
    return counts;
  }, [team]);

  const getUpgradeCost = (rank: Rank, level: number) => level * rankCostMultipliers[rank];
  const getMaxLevel = (rank: Rank, limitBreak: number) => getCharacterMaxLevel(rank, limitBreak);

  const showToast = (msg: string, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3500);
  };

  const toggleTeamMember = (charId: string) => {
    if (team.includes(charId)) {
      setTeam(team.filter(id => id !== charId));
    } else if (team.length < 5) {
      setTeam([...team, charId]);
    } else {
      showToast('チーム編成は最大5体までです！', true);
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    const currentCharAtSlot = team[slotIdx];
    if (selectedCharId) {
      if (currentCharAtSlot === selectedCharId) {
        return;
      }
      let newTeam = [...team];
      const existingIdx = newTeam.indexOf(selectedCharId);
      if (existingIdx !== -1) {
        if (slotIdx < newTeam.length) {
          const temp = newTeam[slotIdx];
          newTeam[slotIdx] = selectedCharId;
          newTeam[existingIdx] = temp;
        } else {
          newTeam.splice(existingIdx, 1);
          newTeam[slotIdx] = selectedCharId;
        }
      } else {
        if (slotIdx < newTeam.length) {
          newTeam[slotIdx] = selectedCharId;
        } else {
          newTeam.push(selectedCharId);
        }
      }
      setTeam(newTeam.filter(Boolean));
    } else if (currentCharAtSlot) {
      setSelectedCharId(currentCharAtSlot);
    }
  };

  const handleExecuteUnlock = () => {
    const res = unlockMinRequiredTeamSize();
    showToast(res.message, !res.success);
    setShowUnlockModal(false);
  };

  const removeFromSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTeam = [...team];
    newTeam.splice(slotIdx, 1);
    setTeam(newTeam);
  };

  const handleDragStart = (e: React.DragEvent, charId: string, fromSlotIdx?: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ charId, fromSlotIdx }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    try {
      const { charId, fromSlotIdx } = JSON.parse(dataStr);
      if (!charId) return;

      let newTeam = [...team];
      const existingIdx = newTeam.indexOf(charId);

      if (typeof fromSlotIdx === 'number' && fromSlotIdx >= 0) {
        // Dragged from slot to slot
        const temp = newTeam[targetSlotIdx];
        newTeam[targetSlotIdx] = charId;
        if (temp) {
          newTeam[fromSlotIdx] = temp;
        } else {
          newTeam.splice(fromSlotIdx, 1);
        }
      } else if (existingIdx !== -1) {
        // Dragged from grid but char was already in team elsewhere
        const temp = newTeam[targetSlotIdx];
        newTeam[targetSlotIdx] = charId;
        newTeam[existingIdx] = temp;
      } else {
        // Dragged from grid to slot
        if (targetSlotIdx < newTeam.length) {
          newTeam[targetSlotIdx] = charId;
        } else {
          newTeam.push(charId);
        }
      }
      setTeam(newTeam.filter(Boolean));
      setSelectedCharId(charId);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCharDef = selectedCharId ? CHARACTERS.find(c => c.id === selectedCharId) : null;
  const selectedCharData = selectedCharId ? characters[selectedCharId] : null;

  return (
    <div className="view-container" style={{ paddingBottom: '0' }}>
      {/* Toast Notice */}
      {notice && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: notice.isError ? '#dc2626' : '#16a34a', color: 'white',
          padding: '10px 18px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          zIndex: 1000, fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center'
        }}>
          {notice.msg}
        </div>
      )}

      {/* Unlock Confirmation Modal */}
      {showUnlockModal && minRequiredTeamSize > 1 && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '340px', width: '100%', padding: '20px', textAlign: 'center',
            borderRadius: '16px', border: '2px solid #ffcc00', background: 'linear-gradient(135deg, #2a1147 0%, #15002b 100%)'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🔓</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>少人数出撃の制限解除</h3>
            <p style={{ fontSize: '0.88rem', color: '#eee', lineHeight: '1.5', marginBottom: '15px' }}>
              出撃に必要なチーム制限を<br />
              <b style={{ color: '#ff2255' }}>{minRequiredTeamSize}体必須</b> から <b style={{ color: '#00ff88' }}>{minRequiredTeamSize - 1}体からOK</b> に緩和しますか？<br/>
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>（現在所持: {yPoints.toLocaleString()} Ypt）</span>
            </p>
            <div style={{
              backgroundColor: 'rgba(255,204,0,0.15)', padding: '10px', borderRadius: '10px',
              border: '1px solid rgba(255,204,0,0.4)', color: '#ffd700', fontWeight: 'bold',
              fontSize: '1rem', marginBottom: '18px'
            }}>
              必要: {(MIN_TEAM_SIZE_UNLOCK_COSTS[minRequiredTeamSize - 1] || 10000).toLocaleString()} Ypt
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setShowUnlockModal(false)}
              >
                キャンセル
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', backgroundColor: '#ffcc00', color: '#000', fontWeight: 'bold', borderColor: '#ffcc00' }}
                onClick={handleExecuteUnlock}
                disabled={yPoints < (MIN_TEAM_SIZE_UNLOCK_COSTS[minRequiredTeamSize - 1] || 10000)}
              >
                制限を解除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/home')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>チーム編成・育成</h2>
          {/* 称号バッジ & 変更ボタン */}
          <button
            onClick={() => setShowTitleModal(true)}
            style={{
              marginTop: '3px',
              background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(245,158,11,0.1) 100%)',
              border: '1px solid rgba(234,179,8,0.5)',
              borderRadius: '12px',
              padding: '2px 8px',
              color: '#fde047',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Award size={13} color="#fde047" />
            <span>称号: 【{selectedTitle}】</span>
            <span style={{ fontSize: '0.65rem', background: '#333', padding: '0 4px', borderRadius: '4px', color: '#fff' }}>変更</span>
          </button>
        </div>
        {/* Items & YPoints display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <div style={{ background: 'rgba(255,204,0,0.2)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', color: '#ffcc00', fontWeight: 'bold', border: '1px solid rgba(255,204,0,0.4)' }}>
            💎 {yPoints.toLocaleString()} Ypt
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.68rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '140px' }}>
            <span>🔮×{items?.expSmall ?? 0}</span>
            <span>✨×{items?.expLarge ?? 0}</span>
            <span>📖×{items?.skillBook ?? 0}</span>
            <span>⚡×{items?.godSkillBook ?? 0}</span>
            <span>🌟×{items?.superLimitBreakBook ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Rename Team Slot Modal */}
      {showRenameModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '320px', width: '100%', padding: '20px', borderRadius: '16px',
            border: '2px solid #ff007f', background: 'linear-gradient(135deg, #1f0b38 0%, #0d001a 100%)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#ff77aa', fontSize: '1.05rem', textAlign: 'center' }}>
              チーム名の変更
            </h3>
            <input
              type="text"
              maxLength={10}
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="例: スコアタ用"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1px solid #ff007f', background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '1rem', marginBottom: '15px', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setShowRenameModal(false)}
              >
                キャンセル
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px', background: 'linear-gradient(90deg, #ff007f, #ff0055)', fontWeight: 'bold' }}
                onClick={() => {
                  updateSavedTeamName(renameTargetIdx, renameInput);
                  setShowRenameModal(false);
                  showToast('チーム名を更新しました！');
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restriction Unlock Banner */}
      <div className="glass-panel" style={{
        padding: '8px 12px', marginBottom: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px',
        backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,204,0,0.3)'
      }}>
        <div style={{ fontSize: '0.8rem', color: '#eee' }}>
          <div>出撃条件: <b style={{ color: team.length >= minRequiredTeamSize ? '#00ff88' : '#ff2255' }}>{minRequiredTeamSize}体以上</b> 編成が必要</div>
          <div style={{ fontSize: '0.72rem', color: '#aaa' }}>（現在: {team.length}体編成中）</div>
        </div>
        {minRequiredTeamSize > 1 ? (
          <button
            className="btn"
            style={{
              padding: '6px 10px', fontSize: '0.75rem', fontWeight: 'bold',
              backgroundColor: '#ffcc00', color: '#000', borderRadius: '15px',
              border: 'none', display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: '0 2px 8px rgba(255,204,0,0.4)', cursor: 'pointer'
            }}
            onClick={() => setShowUnlockModal(true)}
          >
            <Unlock size={13} /> {minRequiredTeamSize - 1}体制限に緩和 ({(MIN_TEAM_SIZE_UNLOCK_COSTS[minRequiredTeamSize - 1] / 10000)}万pt)
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>
            ✨ 1体（ソロ）出撃許可済み！
          </div>
        )}
      </div>

      {/* Saved Team Slots Navigation */}
      <div className="glass-panel" style={{
        padding: '8px 10px', marginBottom: '10px',
        borderRadius: '14px', backgroundColor: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,0,128,0.3)', display: 'flex', flexDirection: 'column', gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ff77aa', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚔️ 編成スロット ({savedTeams.length}個)</span>
          </div>
          <button
            onClick={() => {
              const res = addTeamSlot();
              showToast(res.message, !res.success);
            }}
            style={{
              background: 'linear-gradient(135deg, #00c853 0%, #009688 100%)',
              color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '12px',
              fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,200,83,0.4)', display: 'flex', alignItems: 'center', gap: '3px'
            }}
          >
            ➕ スロット追加 ({getTeamSlotAddCost ? getTeamSlotAddCost().toLocaleString() : '2,000'} Ypt)
          </button>
        </div>

        <div style={{
          display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}>
          {savedTeams.map((sTeam, idx) => {
            const isActive = idx === activeTeamIndex;
            return (
              <div
                key={sTeam.id || idx}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: '12px',
                  background: isActive
                    ? 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)'
                    : 'rgba(255,255,255,0.08)',
                  border: isActive ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: '0.78rem', fontWeight: isActive ? 900 : 700,
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: isActive ? '0 0 12px rgba(255,0,128,0.6)' : 'none'
                }}
                onClick={() => setActiveTeamIndex(idx)}
              >
                <span>{sTeam.name || `デッキ${idx + 1}`}</span>
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTargetIdx(idx);
                      setRenameInput(sTeam.name || `デッキ${idx + 1}`);
                      setShowRenameModal(true);
                    }}
                    style={{
                      background: 'rgba(0,0,0,0.3)', border: 'none', color: '#ffd700',
                      borderRadius: '50%', width: '18px', height: '18px',
                      fontSize: '0.65rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', padding: 0
                    }}
                    title="名前の変更"
                  >
                    ✏️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Slots */}
      <div className="glass-panel" style={{ padding: '10px 12px', display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
        {[0, 1, 2, 3, 4].map(idx => {
          const charId = team[idx];
          const c = charId ? CHARACTERS.find(char => char.id === charId) : null;
          const isSelectedTarget = selectedCharId && selectedCharId !== charId;

          return (
            <div
              key={`team-${idx}`}
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={() => handleSlotClick(idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <div style={{ fontSize: '0.65rem', color: idx === 0 ? '#ff2255' : '#888', fontWeight: 900, marginBottom: '2px' }}>
                {idx === 0 ? '★1体目' : `${idx + 1}体目`}
              </div>

              {c ? (
                // Character Avatar
                <div
                  className="char-icon"
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id, idx)}
                  style={{
                    position: 'relative',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <CharacterAvatar
                    character={c}
                    size={52}
                    style={{
                      border: selectedCharId === c.id ? '3px solid white' : `2px solid ${RANK_COLORS[c.rank]}`,
                      boxShadow: selectedCharId === c.id ? '0 0 10px white' : 'none'
                    }}
                  />
                  {/* 種族バッジ（装備中も種族と倍率がひと目で分かる） */}
                  {(() => {
                    const tribeObj = TRIBES.find(t => t.name === c.tribe);
                    const sameCount = tribeCounts[c.tribe] || 1;
                    const mult = getTribeMultiplier(sameCount);
                    return (
                      <div style={{
                        position: 'absolute',
                        bottom: -4,
                        left: -4,
                        backgroundColor: tribeObj?.color || '#333',
                        color: '#fff',
                        fontSize: '0.55rem',
                        padding: '1px 3px',
                        borderRadius: '4px',
                        fontWeight: 900,
                        border: '1px solid #fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        zIndex: 6,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        <span>{tribeObj?.emoji}</span>
                        <span style={{ color: '#ffff00' }}>×{mult}</span>
                      </div>
                    );
                  })()}
                  {c.eventBoost && (
                    <div style={{ position: 'absolute', top: -4, left: -4, background: '#ff2255', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 900, border: '1px solid white' }}>特</div>
                  )}
                  {/* Remove Button */}
                  <div
                    onClick={(e) => removeFromSlot(idx, e)}
                    style={{
                      position: 'absolute', top: -5, right: -5, background: '#ff2222', color: 'white',
                      borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, border: '1.5px solid white',
                      zIndex: 10
                    }}
                    title="このスロットから外す"
                  >
                    ✕
                  </div>
                  {/* 下部種族ラベル */}
                  <span style={{
                    fontSize: '0.58rem',
                    color: '#fff',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '0px 3px',
                    borderRadius: '3px',
                    marginTop: '2px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}>
                    {c.tribe}
                  </span>
                </div>
              ) : (
                // Unlocked Empty Slot
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  backgroundColor: isSelectedTarget ? 'rgba(255,204,0,0.2)' : 'rgba(255,255,255,0.08)',
                  border: isSelectedTarget ? '2px dashed #ffcc00' : '2px dashed rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: isSelectedTarget ? '#ffcc00' : '#777',
                  fontWeight: isSelectedTarget ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}>
                  {isSelectedTarget ? 'セット' : '空'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 種族シナジーボーナスバナー */}
      <div className="glass-panel" style={{
        padding: '8px 12px', marginBottom: '10px', borderRadius: '12px',
        backgroundColor: 'rgba(20, 15, 35, 0.85)', border: '1px solid rgba(255, 204, 0, 0.4)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffcc00', marginBottom: '4px' }}>
          🧬 種族効果 (同種族1体:1倍 / 2体:2倍 / 3体:3倍 / 4体:4倍 / 5体:5倍)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.keys(tribeCounts).length === 0 ? (
            <span style={{ fontSize: '0.72rem', color: '#aaa' }}>チームにキャラをセットすると種族ボーナスが発動します</span>
          ) : (
            Object.entries(tribeCounts).map(([tribeName, count]) => {
              const mult = getTribeMultiplier(count);
              const tribeObj = TRIBES.find(t => t.name === tribeName);
              if (!tribeObj) return null;
              return (
                <div key={tribeName} style={{
                  fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.6)', border: `1px solid ${tribeObj.color}`,
                  color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span>{tribeObj.emoji} {tribeName}</span>
                  <span style={{ color: '#ffd700', fontWeight: 900 }}>{count}体 → 攻撃力{mult}倍！</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 絞り込みフィルター（種族・ランク） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
        {/* 種族フィルター */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => { setSelectedTribe('ALL'); setCurrentPage(0); }}
            style={{
              padding: '3px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap',
              background: selectedTribe === 'ALL' ? 'var(--primary-color)' : 'rgba(255,255,255,0.15)',
              color: '#fff'
            }}
          >
            種族:すべて
          </button>
          {TRIBES.map(t => (
            <button
              key={t.name}
              onClick={() => { setSelectedTribe(t.name); setCurrentPage(0); }}
              style={{
                padding: '3px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap',
                background: selectedTribe === t.name ? t.color : 'rgba(255,255,255,0.1)',
                color: '#fff', display: 'flex', alignItems: 'center', gap: '2px',
                boxShadow: selectedTribe === t.name ? '0 0 8px ' + t.color : 'none'
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* ランクフィルター */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => { setSelectedRank('ALL'); setCurrentPage(0); }}
            style={{
              padding: '2px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap',
              background: selectedRank === 'ALL' ? '#666' : 'rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            ランク:全
          </button>
          {(['Z', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'] as Rank[]).map(r => (
            <button
              key={r}
              onClick={() => { setSelectedRank(r); setCurrentPage(0); }}
              style={{
                padding: '2px 8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap',
                background: selectedRank === r ? RANK_COLORS[r] : 'rgba(255,255,255,0.1)',
                color: '#fff'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Characters Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', justifyItems: 'center', flex: 1, alignContent: 'start' }}>
            {currentChars.map(c => {
              const isSelected = selectedCharId === c.id;
              const inTeam = team.includes(c.id);
              const tribeObj = TRIBES.find(t => t.name === c.tribe);
              return (
                <div
                  key={c.id}
                  style={{ position: 'relative', cursor: 'grab' }}
                  onClick={() => setSelectedCharId(c.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                >
                  <CharacterAvatar
                    character={c}
                    size={60}
                    style={{
                      border: isSelected ? '3px solid white' : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.5)' : 'var(--glass-shadow)'
                    }}
                  />
                  {/* 種族アイコン（装備中も必ず表示） */}
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: tribeObj?.color || '#333', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px', color: '#fff', fontWeight: 'bold', zIndex: 5, border: '1px solid #fff' }}>
                    {tribeObj?.emoji}
                  </span>
                  <span className="rank-badge" style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: RANK_COLORS[c.rank], fontSize: '0.65rem', padding: '1px 4px' }}>
                    {c.rank}
                  </span>
                  {inTeam && (
                    <div style={{ position: 'absolute', top: '-5px', left: '-5px', background: 'var(--primary-color)', borderRadius: '50%', padding: '2px', border: '1px solid white', zIndex: 6 }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                  {c.eventBoost && (
                    <div style={{ position: 'absolute', top: '18px', right: '-5px', background: '#ff2255', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 900, zIndex: 5 }}>特</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}><ChevronLeft size={20} /></button>
            <span style={{ fontSize: '0.9rem' }}>{currentPage + 1} / {totalPages}</span>
            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Character Detail Panel */}
      <div className="glass-panel" style={{ marginTop: '10px', padding: '15px' }}>
        {selectedCharDef && selectedCharData ? (
          <>
            {/* Top: icon + stats */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CharacterAvatar
                  character={selectedCharDef}
                  size={64}
                />
                {selectedCharDef.eventBoost && (
                  <div style={{ position: 'absolute', top: -5, right: -5, background: '#ff2255', color: 'white', fontWeight: 900, fontSize: '0.55rem', padding: '2px 5px', borderRadius: '10px', border: '1.5px solid white', whiteSpace: 'nowrap' }}>特効中</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="rank-badge" style={{ backgroundColor: RANK_COLORS[selectedCharDef.rank] }}>{selectedCharDef.rank}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedCharDef.name}</span>
                  {/* 限界突破 ★ */}
                  <StarRating count={selectedCharData.limitBreak || 0} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div>
                    Lv.{selectedCharData.level}/{getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
                    &nbsp;|&nbsp;HP:{selectedCharDef.baseHp + selectedCharData.level * 10}
                    &nbsp;|&nbsp;ATK:{selectedCharDef.baseAtk + selectedCharData.level * 5}
                  </div>
                  {(() => {
                    const tribeObj = TRIBES.find(t => t.name === selectedCharDef.tribe);
                    const sameCount = tribeCounts[selectedCharDef.tribe] || 0;
                    const mult = getTribeMultiplier(sameCount);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{
                          background: tribeObj?.color || '#333',
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {tribeObj?.emoji} {selectedCharDef.tribe}族
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800 }}>
                          {sameCount > 0 ? `(チーム同種族${sameCount}体: 攻撃力${mult}倍発動中)` : '(未編成)'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* 必殺技 (Skill) 詳細カード */}
            <div style={{ marginBottom: '10px' }}>
              {selectedCharDef.skill ? (() => {
                const skillLv = selectedCharData.skillLevel || 1;
                const details = getSkillDetails(selectedCharDef.skill, skillLv);
                return (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255,200,0,0.2) 0%, rgba(255,100,0,0.12) 100%)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1.5px solid rgba(255,170,0,0.45)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={16} color="#d97706" />
                        <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#b45309' }}>
                          {selectedCharDef.skill.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#78350f', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '10px' }}>
                        <span style={{ fontWeight: 800 }}>技Lv.{skillLv}</span>
                        <StarRating count={skillLv} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#451a03', lineHeight: '1.45', fontWeight: 600, marginBottom: '6px' }}>
                      {details.description}
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      border: '1px solid rgba(217,119,6,0.3)'
                    }}>
                      <div style={{ color: '#92400e', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                        <span>【現在の能力】</span>
                        <span style={{ color: '#d97706', fontWeight: 900 }}>{details.countInfo}</span>
                      </div>
                      <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>【成長予測】</span>
                        <span style={{ color: skillLv >= 7 ? '#9333ea' : '#2563eb', fontWeight: 800 }}>{details.nextUpgrade}</span>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div style={{
                  background: 'rgba(0,0,0,0.04)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: '#777',
                  borderLeft: '3px solid #aaa'
                }}>
                  ⚡ 必殺技：なし
                </div>
              )}
            </div>

            {/* 特性 (Trait) + イベント特効情報 */}
            {(selectedCharDef.trait || selectedCharDef.eventBoost) && (
              <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedCharDef.trait && (
                  <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', color: '#444', borderLeft: '3px solid #ccc' }}>
                    <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>📖 キャラ特性</span>
                    {selectedCharDef.trait}
                  </div>
                )}
                {selectedCharDef.eventBoost && selectedCharDef.eventBoostDesc && (
                  <div style={{ background: 'rgba(255,34,85,0.2)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', color: '#ff88aa', borderLeft: '3px solid #ff2255' }}>
                    <span style={{ fontSize: '0.65rem', color: '#ff2255', display: 'block', marginBottom: '2px', fontWeight: 900 }}>🔥 イベント特効</span>
                    {selectedCharDef.eventBoostDesc}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* チーム編成 */}
              <button
                className={`btn ${team.includes(selectedCharDef.id) ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '10px', fontSize: '0.85rem' }}
                onClick={() => toggleTeamMember(selectedCharDef.id)}
                disabled={!team.includes(selectedCharDef.id) && team.length >= 5}
              >
                {team.includes(selectedCharDef.id) ? '編成から外す' : 'チームに入れる'}
              </button>

              {/* Yマネーで強化 */}
              {selectedCharData.level < getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0) ? (
                <button
                  className={`btn ${money >= getUpgradeCost(selectedCharDef.rank, selectedCharData.level) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px', fontSize: '0.85rem' }}
                  onClick={() => upgradeCharacter(selectedCharDef.id, getUpgradeCost(selectedCharDef.rank, selectedCharData.level))}
                  disabled={money < getUpgradeCost(selectedCharDef.rank, selectedCharData.level)}
                >
                  <ArrowUpCircle size={15} style={{ marginRight: '4px' }} />
                  強化💰{getUpgradeCost(selectedCharDef.rank, selectedCharData.level)}
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ padding: '10px', fontSize: '0.85rem', color: '#ffcc00' }} disabled>Lv.MAX</button>
              )}

              {/* 小けいけんちだま */}
              <button
                className="btn btn-green"
                style={{ padding: '8px 6px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                onClick={() => consumeExpItem(selectedCharDef.id, 'expSmall')}
                disabled={(items?.expSmall ?? 0) <= 0 || selectedCharData.level >= getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
              >
                <div>🔮 経験値だま小 ×{items?.expSmall ?? 0}</div>
                <span style={{ fontSize: '0.68rem', opacity: 0.9, background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                  Lv +1 UP
                </span>
              </button>

              {/* 大けいけんちだま */}
              <button
                className="btn btn-green"
                style={{
                  padding: '8px 6px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  borderColor: '#10b981'
                }}
                onClick={() => consumeExpItem(selectedCharDef.id, 'expLarge')}
                disabled={(items?.expLarge ?? 0) <= 0 || selectedCharData.level >= getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
              >
                <div>✨ 経験値だま大 ×{items?.expLarge ?? 0}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#fef08a', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                  Lv +5 大幅UP!
                </span>
              </button>

              {/* 秘伝書（ノーマル / 神） */}
              {selectedCharDef.skill && (
                <>
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '8px',
                      fontSize: '0.78rem',
                      background: (items?.skillBook ?? 0) > 0 && (selectedCharData.skillLevel || 1) < 5 ? 'linear-gradient(180deg, #9944ff 0%, #5500bb 100%)' : undefined
                    }}
                    onClick={() => consumeSkillBook(selectedCharDef.id)}
                    disabled={(items?.skillBook ?? 0) <= 0 || (selectedCharData.skillLevel || 1) >= 5}
                  >
                    📖 ひっさつ秘伝書 ×{items?.skillBook ?? 0}
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{
                      padding: '8px',
                      fontSize: '0.78rem',
                      background: (items?.godSkillBook ?? 0) > 0 && (selectedCharData.skillLevel || 1) < 5 ? 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)' : 'rgba(255,255,255,0.1)',
                      borderColor: '#f59e0b'
                    }}
                    onClick={() => consumeGodSkillBook(selectedCharDef.id)}
                    disabled={(items?.godSkillBook ?? 0) <= 0 || (selectedCharData.skillLevel || 1) >= 5}
                  >
                    ⚡ 神ひっさつ秘伝書(MAX) ×{items?.godSkillBook ?? 0}
                  </button>
                </>
              )}

              {/* 超限界突破の書 */}
              <button
                className="btn btn-primary"
                style={{
                  padding: '8px',
                  fontSize: '0.8rem',
                  gridColumn: 'span 2',
                  background: (items?.superLimitBreakBook ?? 0) > 0 && (selectedCharData.limitBreak || 0) < 10 ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.1)',
                  borderColor: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => consumeSuperLimitBreakBook(selectedCharDef.id)}
                disabled={(items?.superLimitBreakBook ?? 0) <= 0 || (selectedCharData.limitBreak || 0) >= 10}
              >
                <Sparkles size={16} color="#fde047" /> 超限界突破の書 (★{selectedCharData.limitBreak || 0}→★{(selectedCharData.limitBreak || 0) + 1}) ×{items?.superLimitBreakBook ?? 0}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            キャラクターを選択してください
          </div>
        )}
      </div>

      {/* 称号設定モーダル */}
      {showTitleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%', maxWidth: '420px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            backgroundColor: '#18181b', borderRadius: '20px',
            border: '1.5px solid rgba(234,179,8,0.5)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(245,158,11,0.05) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#fde047" />
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#fff' }}>称号の設定</span>
              </div>
              <button
                onClick={() => setShowTitleModal(false)}
                style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current selected */}
            <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>現在設定中の称号</div>
              <div style={{
                fontSize: '1.1rem', fontWeight: 950, color: '#fde047',
                letterSpacing: '1px', textShadow: '0 0 10px rgba(234,179,8,0.5)'
              }}>
                【{selectedTitle}】
              </div>
            </div>

            {/* List of titles */}
            <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ALL_TITLES.map(titleObj => {
                const isUnlocked = unlockedTitles.includes(titleObj.name);
                const isSelected = selectedTitle === titleObj.name;

                return (
                  <div
                    key={titleObj.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setSelectedTitle(titleObj.name);
                        showToast(`称号を【${titleObj.name}】に変更しました！`);
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #fde047' : isUnlocked ? '1px solid rgba(255,255,255,0.15)' : '1px dashed rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(234,179,8,0.25)' : isUnlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                      opacity: isUnlocked ? 1 : 0.6,
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 900,
                          backgroundColor: titleObj.color, color: '#000'
                        }}>
                          {titleObj.rarity}
                        </span>
                        <span style={{ fontWeight: 900, fontSize: '0.95rem', color: isUnlocked ? '#fff' : '#888' }}>
                          【{titleObj.name}】
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '3px' }}>
                        {titleObj.description}
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span style={{
                          fontSize: '0.72rem', background: '#fde047', color: '#000',
                          padding: '2px 8px', borderRadius: '10px', fontWeight: 900
                        }}>
                          着用中
                        </span>
                      ) : isUnlocked ? (
                        <button
                          style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                            fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          設定
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#666', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '6px' }}>
                          未開放
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setShowTitleModal(false)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;
