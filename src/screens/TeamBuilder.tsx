import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { CHARACTERS, getCharacterMaxLevel, getSkillDescription } from '../data/characters';
import type { Rank } from '../data/characters';
import { ArrowLeft, ArrowUpCircle, ChevronLeft, ChevronRight, Check, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterAvatar } from '../components/CharacterAvatar';

const rankCostMultipliers: Record<Rank, number> = {
  'SS': 500, 'S': 300, 'A': 200, 'B': 150, 'C': 100, 'D': 80, 'E': 50
};
const RANK_COLORS: Record<Rank, string> = {
  SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
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
  const { characters, team, money, items, setTeam, upgradeCharacter, consumeExpItem, consumeSkillBook } = useGame();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const ownedChars = CHARACTERS.filter(c => characters[c.id]);
  const totalPages = Math.max(1, Math.ceil(ownedChars.length / CHARS_PER_PAGE));
  const currentChars = ownedChars.slice(currentPage * CHARS_PER_PAGE, (currentPage + 1) * CHARS_PER_PAGE);

  const getUpgradeCost = (rank: Rank, level: number) => level * rankCostMultipliers[rank];
  const getMaxLevel = (rank: Rank, limitBreak: number) => getCharacterMaxLevel(rank, limitBreak);

  const toggleTeamMember = (charId: string) => {
    if (team.includes(charId)) {
      setTeam(team.filter(id => id !== charId));
    } else if (team.length < 5) {
      setTeam([...team, charId]);
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/home')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>チーム編成・育成</h2>
        {/* Items display */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>
          <span>🔮×{items?.expSmall ?? 0}</span>
          <span>✨×{items?.expLarge ?? 0}</span>
          <span>📖×{items?.skillBook ?? 0}</span>
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
                {idx === 0 ? '★一番左' : `${idx + 1}`}
              </div>
              {c ? (
                <div
                  className="char-icon"
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id, idx)}
                  style={{
                    position: 'relative',
                    cursor: 'grab'
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
                </div>
              ) : (
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

      {/* Characters Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', justifyItems: 'center', flex: 1, alignContent: 'start' }}>
            {currentChars.map(c => {
              const isSelected = selectedCharId === c.id;
              const inTeam = team.includes(c.id);
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
                  <span className="rank-badge" style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: RANK_COLORS[c.rank], fontSize: '0.65rem', padding: '1px 4px' }}>
                    {c.rank}
                  </span>
                  {inTeam && (
                    <div style={{ position: 'absolute', top: '-5px', left: '-5px', background: 'var(--primary-color)', borderRadius: '50%', padding: '2px' }}>
                      <Check size={12} color="white" />
                    </div>
                  )}
                  {c.eventBoost && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff2255', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 900 }}>特</div>
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
                <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                  Lv.{selectedCharData.level}/{getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
                  &nbsp;|&nbsp;HP:{selectedCharDef.baseHp + selectedCharData.level * 10}
                  &nbsp;|&nbsp;ATK:{selectedCharDef.baseAtk + selectedCharData.level * 5}
                </div>
              </div>
            </div>

            {/* 必殺技 (Skill) 詳細カード */}
            <div style={{ marginBottom: '10px' }}>
              {selectedCharDef.skill ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,200,0,0.18) 0%, rgba(255,100,0,0.12) 100%)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1.5px solid rgba(255,170,0,0.4)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={16} color="#d97706" />
                      <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#b45309' }}>
                        {selectedCharDef.skill.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#78350f' }}>
                      <span>技Lv.</span>
                      <StarRating count={selectedCharData.skillLevel || 1} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#451a03', lineHeight: '1.45', fontWeight: 600 }}>
                    {getSkillDescription(selectedCharDef.skill)}
                  </div>
                </div>
              ) : (
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
                style={{ padding: '8px', fontSize: '0.8rem' }}
                onClick={() => consumeExpItem(selectedCharDef.id, 'expSmall')}
                disabled={(items?.expSmall ?? 0) <= 0 || selectedCharData.level >= getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
              >
                🔮 経験値だま小 ×{items?.expSmall ?? 0}
              </button>

              {/* 大けいけんちだま */}
              <button
                className="btn btn-green"
                style={{ padding: '8px', fontSize: '0.8rem' }}
                onClick={() => consumeExpItem(selectedCharDef.id, 'expLarge')}
                disabled={(items?.expLarge ?? 0) <= 0 || selectedCharData.level >= getMaxLevel(selectedCharDef.rank, selectedCharData.limitBreak || 0)}
              >
                ✨ 経験値だま大 ×{items?.expLarge ?? 0}
              </button>

              {/* 秘伝書 */}
              {selectedCharDef.skill && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px', fontSize: '0.8rem', gridColumn: 'span 2', background: (items?.skillBook ?? 0) > 0 && (selectedCharData.skillLevel || 1) < 5 ? 'linear-gradient(180deg, #9944ff 0%, #5500bb 100%)' : undefined }}
                  onClick={() => consumeSkillBook(selectedCharDef.id)}
                  disabled={(items?.skillBook ?? 0) <= 0 || (selectedCharData.skillLevel || 1) >= 5}
                >
                  📖 ひっさつ秘伝書 (わざLv.{selectedCharData.skillLevel || 1}→{Math.min(5, (selectedCharData.skillLevel || 1) + 1)}) ×{items?.skillBook ?? 0}
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            キャラクターを選択してください
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;
