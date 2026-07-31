import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAGES } from '../data/stages';
import { ArrowLeft, Map as MapIcon, Lock, Check, Sparkles, Globe, X, Heart, Swords, Coins, BookOpen, Play } from 'lucide-react';
import { useGame } from '../store/GameContext';

const StageSelect = () => {
  const navigate = useNavigate();
  const { team, clearedStages, minRequiredTeamSize = 5, savedTeams = [], activeTeamIndex = 0, setActiveTeamIndex } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [currentWorld, setCurrentWorld] = useState<1 | 2>(1);
  const [selectedStage, setSelectedStage] = useState<typeof STAGES[0] | null>(null);

  // Check if World 2 is unlocked (stage_150 cleared or any stage > 150 unlocked)
  const isWorld2Unlocked = clearedStages.includes('stage_150') || clearedStages.some(id => {
    if (id.startsWith('stage_') && !id.includes('hidden') && !id.includes('event')) {
      const num = parseInt(id.replace('stage_', ''), 10);
      return !isNaN(num) && num > 150;
    }
    return false;
  });

  const allNormalStages = STAGES.filter(s => !s.isHidden);
  const world1NormalStages = allNormalStages.filter(s => {
    const num = parseInt(s.id.replace('stage_', ''), 10);
    return !isNaN(num) && num <= 150;
  });
  const world2NormalStages = allNormalStages.filter(s => {
    const num = parseInt(s.id.replace('stage_', ''), 10);
    return !isNaN(num) && num > 150;
  });

  const normalStages = currentWorld === 1 ? world1NormalStages : world2NormalStages;

  const isUnlocked = (stageId: string, isHidden: boolean = false) => {
    const num = parseInt(stageId.replace('stage_', ''), 10);
    if (isHidden) {
      // Hidden stage unlocked if the parent normal stage is cleared
      const parentNormalId = `stage_${parseInt(stageId.replace('stage_hidden_', ''), 10) * 5}`;
      return clearedStages.includes(parentNormalId);
    }
    // Stage 1 is always unlocked
    if (num === 1) return true;
    // World 2 start (stage 151) is unlocked if stage 150 is cleared
    if (num === 151) return clearedStages.includes('stage_150');

    // Otherwise unlocked if previous stage is cleared
    const prevNormalId = `stage_${num - 1}`;
    return clearedStages.includes(prevNormalId);
  };

  const handleStageClick = (stageId: string, unlocked: boolean) => {
    if (!unlocked) return;
    if (team.length < minRequiredTeamSize) {
      setShowWarning(true);
      return;
    }
    const stage = STAGES.find(s => s.id === stageId);
    if (stage) {
      setSelectedStage(stage);
    }
  };

  const getBookRate = (stageId: string) => {
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const totalStages = STAGES.length;
    let bookRate = 0.015;
    if (stageIndex >= 0 && totalStages > 1) {
      const ratio = stageIndex / (totalStages - 1);
      bookRate = 0.015 + ratio * 0.085;
    }
    return (bookRate * 100).toFixed(1);
  };

  useEffect(() => {
    if (containerRef.current) {
      // Find highest unlocked normal stage in current world to center
      let highestIndex = 0;
      for (let i = 0; i < normalStages.length; i++) {
        if (isUnlocked(normalStages[i].id)) {
          highestIndex = i;
        } else {
          break;
        }
      }
      const scrollPos = highestIndex * 160 - window.innerWidth / 2 + 120;
      setTimeout(() => {
        containerRef.current?.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorld, clearedStages]);

  const STAGE_WIDTH = 160;

  return (
    <div className="view-container" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10, background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 80%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/home')} style={{ padding: '6px 10px' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            <MapIcon size={20} /> ワールドマップ
          </h2>
          <div style={{ width: 34 }}></div>
        </div>

        {/* World Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentWorld(1)}
            style={{
              flex: 1,
              maxWidth: '180px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: currentWorld === 1 ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
              background: currentWorld === 1 ? 'linear-gradient(135deg, #0284c7, #0f172a)' : 'rgba(15,23,42,0.6)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: currentWorld === 1 ? '0 0 12px rgba(56,189,248,0.5)' : 'none'
            }}
          >
            <Globe size={14} /> 世界1: 妖魔界 (1~150)
          </button>

          <button
            onClick={() => {
              if (isWorld2Unlocked) {
                setCurrentWorld(2);
              }
            }}
            style={{
              flex: 1,
              maxWidth: '180px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: currentWorld === 2 ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.2)',
              background: currentWorld === 2 ? 'linear-gradient(135deg, #7e22ce, #1e1b4b)' : 'rgba(15,23,42,0.6)',
              color: isWorld2Unlocked ? '#fff' : '#888',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: isWorld2Unlocked ? 'pointer' : 'not-allowed',
              opacity: isWorld2Unlocked ? 1 : 0.6,
              boxShadow: currentWorld === 2 ? '0 0 12px rgba(168,85,247,0.6)' : 'none'
            }}
          >
            {isWorld2Unlocked ? <Sparkles size={14} color="#f43f5e" /> : <Lock size={14} />} 
            世界2: 異次元神界
          </button>
        </div>
      </div>

      {team.length === 0 && (
        <div style={{ position: 'absolute', top: 95, left: 20, right: 20, padding: '8px', backgroundColor: 'rgba(255,0,0,0.85)', borderRadius: '8px', color: 'white', textAlign: 'center', zIndex: 10, fontWeight: 'bold', fontSize: '0.85rem' }}>
          チームが編成されていません！
        </div>
      )}

      {/* World 2 Challenge Warning Banner */}
      {currentWorld === 2 && (
        <div style={{ position: 'absolute', top: 95, left: 10, right: 10, padding: '6px 12px', background: 'linear-gradient(90deg, rgba(126,34,206,0.95), rgba(180,83,9,0.95))', borderRadius: '10px', border: '1px solid #ffd700', color: '#fff', textAlign: 'center', zIndex: 10, fontSize: '0.75rem', fontWeight: 800, textShadow: '0 1px 2px #000' }}>
          ⚡ 敵HP1000億超え常連の超極限世界！SSSキャラ完凸（レベルMAX・必殺技MAX）必須！
        </div>
      )}

      {/* Scrollable Map Area */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          overflowX: 'auto', 
          overflowY: 'hidden', 
          backgroundColor: currentWorld === 1 ? '#2a4b7c' : '#110c2a', 
          backgroundImage: currentWorld === 1 
            ? 'radial-gradient(circle at 50% 50%, #3a5b8c 0%, #1a2b4c 100%)'
            : 'radial-gradient(circle at 50% 50%, #2e1065 0%, #090314 100%)',
          position: 'relative'
        }}
      >
        <div style={{ 
          position: 'relative', 
          width: `${(normalStages.length + 1) * STAGE_WIDTH + 200}px`, 
          height: '100%',
          minHeight: '100%'
        }}>
          {/* Draw connecting lines SVG */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
            {normalStages.map((stage, i) => {
              if (i === normalStages.length - 1) return null;
              
              const x1 = (i + 1) * STAGE_WIDTH + STAGE_WIDTH / 2;
              const y1 = 50 + Math.sin(i) * 20 + 20; 
              const x2 = (i + 2) * STAGE_WIDTH + STAGE_WIDTH / 2;
              const y2 = 50 + Math.sin(i + 1) * 20 + 20;
              
              const isLineActive = clearedStages.includes(stage.id);

              return (
                <g key={`line-${i}`}>
                  <line 
                    x1={`${x1}px`} y1={`${y1}%`} 
                    x2={`${x2}px`} y2={`${y2}%`} 
                    stroke={isLineActive ? (currentWorld === 2 ? '#c084fc' : '#ffcc00') : 'rgba(255,255,255,0.2)'} 
                    strokeWidth="6" 
                    strokeDasharray={isLineActive ? "0" : "10,10"}
                    strokeLinecap="round"
                  />
                  {/* Branch to hidden stage */}
                  {((i + 1) % 5 === 0) && (
                    <line 
                      x1={`${x1}px`} y1={`${y1}%`} 
                      x2={`${x1}px`} y2={`${y1 > 50 ? 20 : 80}%`} 
                      stroke={clearedStages.includes(stage.id) ? '#ff22ff' : 'rgba(255,0,255,0.2)'} 
                      strokeWidth="6" 
                      strokeDasharray={clearedStages.includes(stage.id) ? "0" : "10,10"}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* World 1 Extra Node: "Next World" gate after Stage 150 */}
          {currentWorld === 1 && (
            <div
              style={{
                position: 'absolute',
                left: `${(world1NormalStages.length + 1) * STAGE_WIDTH}px`,
                top: `35%`,
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: isWorld2Unlocked ? 'pointer' : 'not-allowed',
                opacity: isWorld2Unlocked ? 1 : 0.6,
              }}
              onClick={() => {
                if (isWorld2Unlocked) {
                  setCurrentWorld(2);
                }
              }}
            >
              <div
                style={{
                  width: '85px',
                  height: '85px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f43f5e, #7e22ce)',
                  border: '4px solid #ffd700',
                  boxShadow: '0 0 25px rgba(244, 63, 94, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  animation: 'pulse 1.5s infinite alternate'
                }}
              >
                🌌
              </div>
              <div style={{
                marginTop: '10px',
                background: 'linear-gradient(135deg, #7e22ce, #be123c)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 900,
                border: '2px solid #ffd700',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap'
              }}>
                ✨ 次の世界へ (神界)
              </div>
              {!isWorld2Unlocked && (
                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#ffaaaa', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '4px' }}>
                  🔒 ステージ150クリアで開放
                </div>
              )}
            </div>
          )}

          {/* World 2 Extra Node: "Return to World 1" gate at start */}
          {currentWorld === 2 && (
            <div
              style={{
                position: 'absolute',
                left: `40px`,
                top: `35%`,
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentWorld(1)}
            >
              <div
                style={{
                  width: '75px',
                  height: '75px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 15px rgba(2, 132, 199, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}
              >
                🌎
              </div>
              <div style={{
                marginTop: '10px',
                background: 'rgba(15,23,42,0.9)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                border: '1px solid #38bdf8',
                whiteSpace: 'nowrap'
              }}>
                ↩️ 妖魔界へ戻る
              </div>
            </div>
          )}

          {/* Draw nodes */}
          {normalStages.map((stage, i) => {
            const num = parseInt(stage.id.replace('stage_', ''), 10);
            const x = (i + 1) * STAGE_WIDTH;
            const y = 50 + Math.sin(i) * 20; 
            
            const unlocked = isUnlocked(stage.id);
            const cleared = clearedStages.includes(stage.id);
            
            const hiddenStageIndex = num / 5;
            const hiddenStageId = `stage_hidden_${hiddenStageIndex}`;
            const hiddenStage = (num % 5 === 0) ? STAGES.find(s => s.id === hiddenStageId) : null;

            const isAreaStart = (currentWorld === 1 ? (num - 1) % 10 === 0 : (num - 151) % 10 === 0);

            return (
              <React.Fragment key={stage.id}>
                {/* Area Header Badge */}
                {isAreaStart && stage.areaName && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${x - 20}px`,
                      top: '25px',
                      zIndex: 3,
                      background: currentWorld === 1 
                        ? 'linear-gradient(135deg, #ff9900, #ff3300)'
                        : 'linear-gradient(135deg, #a855f7, #6b21a8)',
                      color: 'white',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      border: currentWorld === 1 ? '2px solid #ffea88' : '2px solid #f43f5e',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📍 {stage.areaName}
                  </div>
                )}

                {/* Normal Node */}
                <div 
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `calc(${y}% - 35px)`, 
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: unlocked ? 1 : 0.5,
                    filter: unlocked ? 'none' : 'grayscale(100%)',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    transform: unlocked ? 'scale(1)' : 'scale(0.9)',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleStageClick(stage.id, unlocked)}
                >
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: cleared 
                      ? (currentWorld === 2 ? 'linear-gradient(135deg, #c084fc, #7e22ce)' : 'linear-gradient(135deg, #ffcc00, #ff8800)')
                      : unlocked 
                        ? (currentWorld === 2 ? 'linear-gradient(135deg, #38bdf8, #1e1b4b)' : 'linear-gradient(135deg, #4488ff, #2255cc)') 
                        : '#555',
                    border: `4px solid ${cleared ? '#fff' : unlocked ? (currentWorld === 2 ? '#f43f5e' : '#aaddff') : '#333'}`,
                    boxShadow: unlocked ? (currentWorld === 2 ? '0 0 15px rgba(168,85,247,0.7)' : '0 5px 15px rgba(0,0,0,0.5)') : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', position: 'relative'
                  }}>
                    {unlocked ? stage.enemyEmoji : <Lock size={28} color="#aaa" />}
                    {cleared && (
                      <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#22cc22', borderRadius: '50%', padding: '2px', border: '2px solid white' }}>
                        <Check size={16} color="white" />
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    marginTop: '8px', background: 'rgba(0,0,0,0.75)', padding: '4px 10px', 
                    borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', 
                    border: currentWorld === 2 ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.2)',
                    color: currentWorld === 2 ? '#e9d5ff' : '#fff',
                    whiteSpace: 'nowrap'
                  }}>
                    {stage.name}
                  </div>
                </div>

                {/* Hidden Node */}
                {hiddenStage && (
                  <div 
                    key={hiddenStage.id}
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `calc(${y > 50 ? 20 : 80}% - 35px)`,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      opacity: cleared ? 1 : 0, 
                      pointerEvents: cleared ? 'auto' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.5s'
                    }}
                    onClick={() => handleStageClick(hiddenStage.id, cleared)}
                  >
                    <div style={{
                      width: '70px', height: '70px', borderRadius: '30%', 
                      background: clearedStages.includes(hiddenStage.id) ? 'linear-gradient(135deg, #ff22ff, #880088)' : 'linear-gradient(135deg, #ff5555, #aa0000)',
                      border: `4px solid #fff`,
                      boxShadow: '0 0 20px rgba(255,0,255,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2.2rem', position: 'relative', transform: 'rotate(45deg)' 
                    }}>
                      <div style={{ transform: 'rotate(-45deg)' }}>{hiddenStage.enemyEmoji}</div>
                      {clearedStages.includes(hiddenStage.id) && (
                        <div style={{ position: 'absolute', bottom: -10, right: 20, background: '#22cc22', borderRadius: '50%', padding: '2px', border: '2px solid white', transform: 'rotate(-45deg)' }}>
                          <Check size={16} color="white" />
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      marginTop: '15px', background: 'rgba(255,0,100,0.6)', padding: '4px 10px', 
                      borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ffaaee',
                      whiteSpace: 'nowrap', color: '#ffccff'
                    }}>
                      {hiddenStage.name}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Team Warning Modal */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(40,15,20,0.95), rgba(20,10,25,0.95))', border: '2px solid #ff2255', borderRadius: '20px', boxShadow: '0 0 20px rgba(255,34,85,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ color: '#ff2255', margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 900 }}>編成数が不足しています！</h3>
            <p style={{ fontSize: '0.85rem', color: '#eee', marginBottom: '20px', lineHeight: 1.6 }}>
              ステージに挑戦するには<br />
              <strong style={{ color: '#ffcc00', fontSize: '1rem' }}>{minRequiredTeamSize}体以上</strong>の妖怪をチームに編成する必要があります。<br />
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>（現在: {team.length} / {minRequiredTeamSize} 体）</span><br />
              <span style={{ fontSize: '0.75rem', color: '#ffcc00' }}>※Yポイントで編成条件を緩和できます！</span>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }} onClick={() => setShowWarning(false)}>
                閉じる
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', backgroundColor: '#ff2255', borderColor: '#ff2255' }} onClick={() => navigate('/team')}>
                チーム編成へ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '350px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '2px solid #38bdf8', 
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Header / Title */}
            <div style={{ 
              padding: '16px 20px', 
              background: 'linear-gradient(90deg, #1e3a8a, #0f172a)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 900, letterSpacing: '0.05em' }}>
                  {selectedStage.id.includes('hidden') ? '【かくしステージ】' : `【ステージ ${selectedStage.id.replace('stage_', '')}】`}
                </span>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem', fontWeight: 900 }}>
                  {selectedStage.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedStage(null)}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#ffffff', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Enemy Info Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '16px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: selectedStage.enemyColor || '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  flexShrink: 0,
                  boxShadow: `0 0 15px ${selectedStage.enemyColor || '#38bdf8'}`
                }}>
                  {selectedStage.enemyEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc' }}>
                    {selectedStage.enemyName}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#f43f5e', fontWeight: 800 }}>
                      <Heart size={12} fill="#f43f5e" /> 体力 (HP): {selectedStage.enemyHp.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800 }}>
                      <Swords size={12} color="#fbbf24" /> 攻撃力: {selectedStage.enemyAtk.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deck Selection UI */}
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

              {/* Rewards Summary */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '6px 10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 800 }}>獲得マネー</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    <Coins size={12} /> {selectedStage.rewardMoney.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '12px',
                  padding: '6px 10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 800 }}>獲得Yポイント</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    🏝️ {selectedStage.rewardYPoints.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Drop Rates Section */}
              <div>
                <h4 style={{ margin: '0 0 6px 4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={12} /> ドロップ期待度 (アイテム確率)
                </h4>
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.5)', 
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', 
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {/* ひっさつの秘伝書 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📖 ひっさつの秘伝書
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(251, 191, 36, 0.2)', minWidth: '55px', textAlign: 'center' }}>
                      {getBookRate(selectedStage.id)}%
                    </span>
                  </div>

                  {/* けいけんち玉・大 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔮 けいけんち玉・大
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)', padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(192, 132, 252, 0.2)', minWidth: '55px', textAlign: 'center' }}>
                      15.0%
                    </span>
                  </div>

                  {/* けいけんち玉・小 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🧪 けいけんち玉・小
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.2)', minWidth: '55px', textAlign: 'center' }}>
                      35.0%
                    </span>
                  </div>

                  {/* 妖怪ドロップ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      👤 仲間妖怪
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', padding: '1px 6px', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)', minWidth: '55px', textAlign: 'center' }}>
                      20.0%
                    </span>
                  </div>
                </div>
              </div>

              {/* Battle Play Button */}
              <button
                onClick={() => {
                  const sId = selectedStage.id;
                  setSelectedStage(null);
                  navigate(`/stage/${sId}`);
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Play size={16} fill="#ffffff" />
                バトルへ出撃！
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageSelect;
