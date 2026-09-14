import React, { useState, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { CHARACTERS } from '../data/characters';
import type { Character, Rank } from '../data/characters';
import { ArrowLeft, Info, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterAvatar } from '../components/CharacterAvatar';

const GACHA_COST_1 = 50;
const GACHA_COST_10 = 500;
const GACHA_COST_100 = 5000;
const GACHA_COST_500 = 25000;

const RANK_ORDER: Record<Rank, number> = { 'K': -6, 'UZ+++': -5, ZZ: -4, "Z'": -3, Z: -2, SSS: -1, SS: 0, S: 1, A: 2, B: 3, C: 4, D: 5, E: 6 };
const RANK_COLORS: Record<Rank, string> = {
  'K': '#00ffcc', 'UZ+++': '#ff007f', ZZ: '#ffd700', "Z'": '#ff3399', Z: '#00ffff', SSS: '#ffd700', SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
};

// 恒常ガシャ (Permanent)
const normalRankWeights: Record<Rank, number> = {
  'K': 0, 'UZ+++': 0, ZZ: 0, "Z'": 0, 'Z': 0, 'SSS': 0.5, 'SS': 2.5, 'S': 7, 'A': 10, 'B': 20, 'C': 30, 'D': 18, 'E': 12
};

// イベントガシャ (Event): Z=0.5% (ユーザー指定), 合計100.0%
const eventRankWeights: Record<Rank, number> = {
  'K': 0,
  'UZ+++': 0,
  ZZ: 0,
  "Z'": 0,
  'Z': 0.5,    // 0.5%
  'SSS': 2.0,  // 2.0%
  'SS': 6.0,   // 6.0%
  'S': 12.0,   // 12.0%
  'A': 18.0,   // 18.0%
  'B': 21.5,   // 21.5%
  'C': 18.0,   // 18.0%
  'D': 15.0,   // 15.0%
  'E': 7.0     // 7.0%
};

// ブリーチコラボガシャ (BLEACH Espada Gacha): 高価値ブリーチリング用 (Z: 1.0%, Z': 0.1%, SSS: 18.9%, SS: 39.5%, S: 40.5%)
const bleachRankWeights: Record<Rank, number> = {
  'K': 0,
  'UZ+++': 0,
  ZZ: 0,
  "Z'": 0.1,   // 0.1% (十刃 & 崩玉藍染)
  'Z': 1.0,    // 1.0%
  'SSS': 18.9, // 18.9%
  'SS': 39.5,  // 39.5%
  'S': 40.5,   // 40.5%
  'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0
};

type GachaType = 'bleach' | 'event' | 'normal';
const GACHA_TYPES: GachaType[] = ['bleach', 'event', 'normal'];

interface GachaCapsuleItem {
  id: number;
  character: Character;
  color: 'rainbow' | 'gold' | 'red';
  isOpen: boolean;
}

import { formatJapaneseNumber } from '../utils/format';

const CAPSULE_POSITIONS_10 = [
  { x: 50, y: 10 },  // 上中央
  { x: 18, y: 22 },  // 上左
  { x: 82, y: 22 },  // 上右
  { x: 50, y: 32 },  // 中中央
  { x: 12, y: 44 },  // 中左
  { x: 88, y: 44 },  // 中右
  { x: 50, y: 54 },  // 下中央
  { x: 16, y: 66 },  // 最下左
  { x: 84, y: 66 },  // 最下右
  { x: 50, y: 78 },  // 最下中央
];

const Gacha = () => {
  const { yPoints, addYPoints, bleachRings, addBleachRings, convertYPointsToBleachRings, unlockCharacter, trackMission, pityCount, stepUpCount, gachaHistory, recordGachaResult } = useGame();
  const navigate = useNavigate();
  const [results, setResults] = useState<Character[] | null>(null);
  const [capsuleStageItems, setCapsuleStageItems] = useState<GachaCapsuleItem[] | null>(null);
  const [selectedCutInChar, setSelectedCutInChar] = useState<Character | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [currentGacha, setCurrentGacha] = useState<GachaType>('bleach');
  const [showRates, setShowRates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const pullGacha = (timesInput: number) => {
    let times = timesInput;
    let cost = GACHA_COST_1;
    const isBleach = currentGacha === 'bleach';

    if (isBleach) {
      if (times === 1) cost = 5;
      else if (times === 10) cost = 50;
      else cost = 500;
    } else {
      if (times === 10) cost = GACHA_COST_10;
      if (times === 100) cost = GACHA_COST_100;
      if (times === 500) cost = GACHA_COST_500;
    }

    const availableCurrency = isBleach ? (bleachRings || 0) : yPoints;
    if (availableCurrency < cost || isPulling) return;
    
    setIsPulling(true);
    if (isBleach) {
      addBleachRings(-cost);
    } else {
      addYPoints(-cost);
    }
    trackMission('gacha_pull', times);
    
    setTimeout(() => {
      const pulledChars: Character[] = [];
      const weights = isBleach
        ? { ...bleachRankWeights }
        : { ...(currentGacha === 'event' ? eventRankWeights : normalRankWeights) };
      
      // Step Up Logic (恒常・イベントガシャ用)
      if (!isBleach) {
        const stepUpBonus = Math.floor((stepUpCount || 0) / 10);
        if (weights['SS'] !== undefined) weights['SS'] += stepUpBonus * 0.5;
        if (weights['S'] !== undefined) weights['S'] += stepUpBonus * 1.5;
      }

      let newPityCount = pityCount ?? 100;
      let newStepUpCount = (stepUpCount ?? 0) + (!isBleach ? times : 0);

      const isBleachCharacter = (c: { id?: string; name: string }) => 
        (c.id && c.id.includes('bleach')) || 
        /ウルキオラ|グリムジョー|スターク|バラガン|ハリベル|ノイトラ|ヤミー|ゾマリ|ザエルアポロ|アーロニーロ|藍染|崩玉|十刃|一護|白哉|冬獅郎|ルキア|恋次|雨竜|茶渡|織姫/i.test(c.name);

      for (let i = 0; i < times; i++) {
        let pulledRank: Rank = 'E';

        if (isBleach) {
          // ブリーチガシャ: 固定確率抽選
          let rand = Math.random() * 100;
          const ranks: Rank[] = ["Z'", 'Z', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'];
          for (const r of ranks) {
            const w = weights[r] || 0;
            if (rand < w) {
              pulledRank = r;
              break;
            }
            rand -= w;
          }
        } else {
          // 通常/イベントガシャ: PITY適用 (100回でSSS以上確定)
          newPityCount--;
          if (newPityCount <= 0) {
            // SSS以上確定: Z (20%) または SSS (80%)
            pulledRank = Math.random() < 0.2 ? 'Z' : 'SSS';
            newPityCount = 100;
            newStepUpCount = 0;
          } else {
            let rand = Math.random() * 100;
            const ranks: Rank[] = ["Z'", 'Z', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'];
            for (const r of ranks) {
              const w = weights[r] || 0;
              if (rand < w) {
                pulledRank = r;
                break;
              }
              rand -= w;
            }
          }

          if (['Z', 'SSS'].includes(pulledRank)) {
            newPityCount = 100;
            newStepUpCount = 0;
          }
        }
        
        const rankChars = CHARACTERS.filter(c => {
          const isBleachChar = isBleachCharacter(c);
          if (isBleach) {
            return isBleachChar && c.rank === pulledRank;
          } else {
            return !isBleachChar && c.rank === pulledRank;
          }
        });
        let pulledChar: any;
        if (rankChars.length > 0) {
          pulledChar = rankChars[Math.floor(Math.random() * rankChars.length)];
        } else if (isBleach) {
          const bleachChars = CHARACTERS.filter(c => isBleachCharacter(c));
          const bleachCharsByRank = bleachChars.filter(c => c.rank === pulledRank);
          pulledChar = bleachCharsByRank.length > 0
            ? bleachCharsByRank[Math.floor(Math.random() * bleachCharsByRank.length)]
            : (bleachChars.length > 0 ? bleachChars[Math.floor(Math.random() * bleachChars.length)] : CHARACTERS[0]);
        } else {
          pulledChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        }

        pulledChars.push(pulledChar);
        unlockCharacter(pulledChar.id);
      }

      recordGachaResult(pulledChars.map(c => c.id), newPityCount, newStepUpCount);

      // 1連、10连の時のみカプセルタップアニメーション画面へ移行（100連・500連は即時一括結果表示）
      if (times === 1 || times === 10) {
        const caps: GachaCapsuleItem[] = pulledChars.map((char, i) => {
          let color: 'rainbow' | 'gold' | 'red' = 'red';
          if (["Z'", 'Z', 'SSS', 'SS'].includes(char.rank)) {
            color = 'rainbow';
          } else if (['S', 'A'].includes(char.rank)) {
            color = 'gold';
          }
          return {
            id: i,
            character: char,
            color,
            isOpen: false,
          };
        });
        setCapsuleStageItems(caps);

        const sorted = [...pulledChars].sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
        setResults(sorted);
      } else {
        pulledChars.sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank]);
        setResults(pulledChars);
      }
      setIsPulling(false);
    }, 2000); // 2 second animation
  };

  const handleTapCapsule = (id: number) => {
    if (!capsuleStageItems) return;
    setCapsuleStageItems(prev => {
      if (!prev) return null;
      return prev.map(cap => {
        if (cap.id === id) {
          if (!cap.isOpen) {
            setSelectedCutInChar(cap.character);
          }
          return { ...cap, isOpen: true };
        }
        return cap;
      });
    });
  };

  const handleOpenAllCapsules = () => {
    if (!capsuleStageItems) return;
    setCapsuleStageItems(prev => {
      if (!prev) return null;
      return prev.map(cap => ({ ...cap, isOpen: true }));
    });
  };

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      if (currentGacha === 'bleach') setCurrentGacha('event');
      else if (currentGacha === 'event') setCurrentGacha('normal');
      else if (currentGacha === 'normal') setCurrentGacha('bleach');
    } else if (diff < -40) {
      if (currentGacha === 'normal') setCurrentGacha('event');
      else if (currentGacha === 'event') setCurrentGacha('bleach');
      else if (currentGacha === 'bleach') setCurrentGacha('normal');
    }
    touchStartX.current = null;
  };

  const GachaButton = ({ times, cost, color }: { times: number, cost: number, color?: string }) => {
    const isBleach = currentGacha === 'bleach';
    const currencyLabel = isBleach ? '個' : ' Ypt';
    const currencyIcon = isBleach ? '💍' : <div className="currency-icon y-point-icon" style={{width: 14, height: 14, fontSize: '0.6rem'}}>y</div>;
    const canAfford = isBleach ? (bleachRings || 0) >= cost : yPoints >= cost;

    return (
      <button 
        className={`btn ${color || 'btn-primary'}`}
        onClick={() => pullGacha(times)}
        disabled={!canAfford || isPulling}
        style={{ 
          width: '100%', padding: '12px', flexDirection: 'column', gap: '2px', borderRadius: '30px', boxShadow: '0 6px 0 rgba(0,0,0,0.2)'
        }}
      >
        <span className="text-outline" style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
          {times === 1 ? '単発でまわす！' : `${times}連でまわす！`}
        </span>
        <span style={{ 
          background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
          {typeof currencyIcon === 'string' ? <span style={{fontSize: '0.8rem'}}>{currencyIcon}</span> : currencyIcon}
          {formatJapaneseNumber(cost)}{currencyLabel}
        </span>
      </button>
    );
  };

  const activeWeights = currentGacha === 'bleach'
    ? bleachRankWeights
    : (currentGacha === 'event' ? eventRankWeights : normalRankWeights);

  return (
    <div className="view-container" style={{ background: 'url(https://img.game8.jp/323860/a62ab2ed8e11a6f87ea4952093557e03.png/show) center/cover no-repeat', paddingBottom: 0 }}>
      {/* Rates Modal */}
      {showRates && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '85%', maxWidth: '400px', padding: '20px', position: 'relative', border: `2px solid ${currentGacha === 'bleach' ? '#ff3399' : '#ffd700'}` }}>
            <button onClick={() => setShowRates(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>
              ✕
            </button>
            <h3 style={{ margin: '0 0 15px', textAlign: 'center', color: currentGacha === 'bleach' ? '#ff3399' : '#ffd700' }}>
              {currentGacha === 'event' ? 'イベントガシャ' : currentGacha === 'bleach' ? '⚔️ ブリーチコラボガシャ' : '恒常ガシャ'} 提供割合
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(activeWeights)
                .sort((a, b) => RANK_ORDER[a[0] as Rank] - RANK_ORDER[b[0] as Rank])
                .map(([rank, weight]) => {
                  const total = Object.values(activeWeights).reduce((a, b) => a + b, 0);
                  const isBleach = currentGacha === 'bleach';
                  const stepUpBonus = !isBleach ? Math.floor((stepUpCount || 0) / 10) : 0;
                  let finalWeight = weight;
                  if (rank === 'SS' && !isBleach) finalWeight += stepUpBonus * 0.5;
                  if (rank === 'S' && !isBleach) finalWeight += stepUpBonus * 1.5;
                  
                  const isZ = rank === 'Z';
                  const isZPrime = rank === "Z'";
                  const isSSS = rank === 'SSS';
                  const pct = ((finalWeight / total) * 100).toFixed(isZ || isSSS || isZPrime ? 2 : 1);
                  if (finalWeight === 0) return null;
                  return (
                    <div key={rank} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '8px 12px', 
                      background: isZ 
                        ? 'linear-gradient(90deg, rgba(0,255,255,0.3), rgba(13,148,136,0.3))' 
                        : isZPrime
                        ? 'linear-gradient(90deg, rgba(255,51,153,0.3), rgba(136,19,55,0.3))'
                        : isSSS 
                        ? 'linear-gradient(90deg, rgba(255,215,0,0.3), rgba(255,0,128,0.3))' 
                        : 'rgba(0,0,0,0.3)', 
                      borderRadius: '8px', 
                      border: isZ ? '1px solid #00ffff' : isZPrime ? '1px solid #ff3399' : isSSS ? '1px solid #ffd700' : 'none' 
                    }}>
                      <span className="rank-badge" style={{ backgroundColor: RANK_COLORS[rank as Rank], minWidth: '36px', textAlign: 'center', fontWeight: 'bold' }}>{rank}</span>
                      <span style={{ fontWeight: 'bold', color: isZ ? '#00ffff' : isZPrime ? '#ff3399' : isSSS ? '#ffd700' : '#fff' }}>
                        {pct}% {isZPrime ? '(十刃＆藍染 Z\'降臨！)' : ''}
                      </span>
                    </div>
                  );
                })}
            </div>
            {stepUpCount && stepUpCount >= 10 ? (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ff2255', marginTop: '15px' }}>※ステップアップボーナス適用中の確率です</p>
            ) : null}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '90%', maxHeight: '80%', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
            <button onClick={() => setShowHistory(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>
              ✕
            </button>
            <h3 style={{ margin: '0 0 15px', textAlign: 'center' }}>ガシャ履歴（直近50件）</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!gachaHistory || gachaHistory.length === 0) ? (
                <div style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>履歴がありません</div>
              ) : (
                gachaHistory.map((h: any, i: number) => {
                  const c = CHARACTERS.find(x => x.id === h.charId);
                  if (!c) return null;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#aaa', width: '70px' }}>
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="rank-badge" style={{ backgroundColor: RANK_COLORS[c.rank], padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>{c.rank}</div>
                      <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 'bold', color: c.rank === 'SSS' ? '#ffd700' : '#fff' }}>{c.name}</div>
                      <CharacterAvatar character={c} size={32} showRankBadge={false} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px 0 10px', zIndex: 10 }}>
        <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => navigate('/home')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowRates(true)}>
            <Info size={16} /> 提供割合
          </button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowHistory(true)}>
            <History size={16} /> 履歴
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {isPulling ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* ガラガラ演出中のきらめきバックライト */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: currentGacha === 'bleach'
                ? 'radial-gradient(circle, rgba(255, 51, 153, 0.4) 0%, rgba(0,0,0,0) 70%)'
                : 'radial-gradient(circle, rgba(255, 170, 0, 0.4) 0%, rgba(0,0,0,0) 70%)',
              animation: 'pulse 0.8s ease-in-out infinite'
            }} />

            {/* ガシャ本体 */}
            <div className="animate-shake" style={{
              width: '260px',
              height: '330px',
              background: currentGacha === 'bleach'
                ? 'linear-gradient(180deg, #ff3399 0%, #881337 50%, #1e1b4b 100%)'
                : 'linear-gradient(180deg, #ffaa00 0%, #bb4400 50%, #224422 100%)',
              borderRadius: '24px 24px 16px 16px',
              border: '6px solid #ffffff',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2
            }}>
              {/* ドーム透明ケース */}
              <div style={{
                position: 'absolute',
                top: 25,
                width: '210px',
                height: '140px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '16px',
                border: '4px solid #ffffff',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)'
              }}>
                {/* 激しく跳ね回るカプセル群 */}
                {[
                  { color: '#ff0055', top: '20%', left: '15%', size: 38 },
                  { color: '#ffd700', top: '50%', left: '55%', size: 40 },
                  { color: '#00ffff', top: '15%', left: '60%', size: 36 },
                  { color: '#ff3399', top: '60%', left: '20%', size: 42 },
                  { color: '#00ff88', top: '35%', left: '38%', size: 38 },
                  { color: '#aa00ff', top: '25%', left: '75%', size: 36 },
                ].map((cap, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      position: 'absolute',
                      width: cap.size,
                      height: cap.size,
                      borderRadius: '50%',
                      background: cap.color,
                      border: '2px solid #ffffff',
                      top: cap.top,
                      left: cap.left,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      animationDelay: `${i * 0.1}s`,
                      transform: `rotate(${i * 45}deg)`
                    }}
                  >
                    <div style={{ width: '100%', height: '50%', background: 'rgba(255,255,255,0.4)', borderRadius: '20px 20px 0 0' }} />
                  </div>
                ))}
              </div>

              {/* 回転ハンドル */}
              <div style={{
                position: 'absolute',
                bottom: 50,
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                border: '4px solid #333333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
              }}>
                <div style={{
                  width: '50px',
                  height: '14px',
                  background: '#ff0055',
                  borderRadius: '7px',
                  transform: 'rotate(45deg)',
                  border: '1px solid #000'
                }} />
              </div>

              {/* 取り出し口 */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                width: '80px',
                height: '24px',
                background: '#1a1a1a',
                borderRadius: '12px 12px 0 0',
                border: '2px solid #555'
              }} />
            </div>

            <div style={{
              marginTop: '24px',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 10px #ff0055',
              letterSpacing: '2px',
              zIndex: 2
            }}>
              ガチャ回転中……！ 💥
            </div>
          </div>
        ) : capsuleStageItems ? (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: '#1a0011',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '10px', overflow: 'hidden'
          }}>
            {/* 右上「すべてあける」ボタン */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 60 }}>
              <button
                onClick={handleOpenAllCapsules}
                style={{
                  background: '#ffaa00',
                  color: '#3d1a00',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  padding: '8px 18px',
                  borderRadius: '25px',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                すべてあける
              </button>
            </div>

            {/* カプセル群表示エリア */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {capsuleStageItems.map((item, idx) => {
                const pos = capsuleStageItems.length === 10
                  ? CAPSULE_POSITIONS_10[idx]
                  : { x: 50, y: 45 };

                const size = capsuleStageItems.length === 1 ? 110 : 68;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleTapCapsule(item.id)}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: item.isOpen ? 20 : 10,
                      cursor: 'pointer'
                    }}
                  >
                    {!item.isOpen ? (
                      <div
                        className={`gacha-capsule gacha-capsule-${item.color}`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`
                        }}
                      >
                        <div className="tap-badge" style={{ fontSize: size > 80 ? '1rem' : '0.82rem' }}>
                          タップ！
                        </div>
                      </div>
                    ) : (
                      /* 開封済みキャラ表示 */
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          background: 'rgba(0,0,0,0.8)',
                          padding: '4px',
                          borderRadius: '12px',
                          border: `2px solid ${RANK_COLORS[item.character.rank]}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                        }}
                      >
                        <CharacterAvatar character={item.character} size={size > 80 ? 90 : 56} />
                        <div style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          color: RANK_COLORS[item.character.rank],
                          marginTop: '2px'
                        }}>
                          {item.character.rank}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 結果画面へ遷移するボタン */}
            {capsuleStageItems.every(c => c.isOpen) && (
              <button
                onClick={() => setCapsuleStageItems(null)}
                style={{
                  position: 'absolute',
                  bottom: '25px',
                  zIndex: 60,
                  background: '#00cc66',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  padding: '12px 36px',
                  borderRadius: '30px',
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer'
                }}
              >
                結果一覧へ ➔
              </button>
            )}

            {/* カットインモーダル (タップしたキャラの出現演出) */}
            {selectedCutInChar && (
              <div
                onClick={() => setSelectedCutInChar(null)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 100,
                  background: 'rgba(0,0,0,0.8)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <div
                  style={{
                    background: '#111827',
                    border: `3px solid ${RANK_COLORS[selectedCutInChar.rank]}`,
                    borderRadius: '16px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    maxWidth: '300px',
                    width: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    position: 'relative'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 900, color: RANK_COLORS[selectedCutInChar.rank],
                    marginBottom: '8px'
                  }}>
                    ✨ RANK {selectedCutInChar.rank} GET!! ✨
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <CharacterAvatar character={selectedCutInChar} size={110} />
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '16px' }}>
                    {selectedCutInChar.name}
                  </div>
                  <button
                    onClick={() => setSelectedCutInChar(null)}
                    className="btn btn-primary"
                    style={{
                      width: '100%', padding: '10px',
                      background: RANK_COLORS[selectedCutInChar.rank],
                      color: ['Z', 'SSS', 'A'].includes(selectedCutInChar.rank) ? '#000' : '#fff',
                      fontWeight: 900
                    }}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : results ? (
          <div style={{ flex: 1, overflowY: 'auto', textAlign: 'center', width: '100%', padding: '30px 0 40px' }}>
            <h2 className="text-outline" style={{ marginBottom: '16px', fontSize: '2rem', color: results.some(r => r.rank === "Z'") ? '#ff3399' : '#fff' }}>
              {results.some(r => r.rank === "Z'") ? '⚔️ 虚圏十刃 Z\' 降臨！！！ ⚔️' : 'ガシャ結果！'}
            </h2>
            
            {/* Z'が出た場合の十刃降臨超豪華巨大ピックアップ表示 */}
            {results.filter(r => r.rank === "Z'").length > 0 && (
              <div style={{
                width: '92%',
                maxWidth: '420px',
                margin: '0 auto 24px',
                background: '#1e1b4b',
                border: '3px solid #ff3399',
                borderRadius: '16px',
                padding: '16px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ff3399, #d946ef)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  padding: '4px 18px',
                  borderRadius: '20px',
                  border: '1px solid #fff',
                  marginBottom: '12px'
                }}>
                  ⚔️ 究極神ランク Z' 十刃（エスパーダ）降臨！ ⚔️
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from(new Set(results.filter(r => r.rank === "Z'").map(c => c.id))).map(zId => {
                    const zChar = results.find(c => c.id === zId)!;
                    const count = results.filter(c => c.id === zId).length;
                    return (
                      <div key={zId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          position: 'relative',
                          padding: '4px',
                          borderRadius: '50%',
                          background: '#312e81',
                          border: '2px solid #ff3399'
                        }}>
                          <CharacterAvatar character={zChar} size={120} />
                          {count > 1 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              background: '#9333ea',
                              color: '#fff',
                              fontSize: '0.85rem',
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              border: '1px solid #fff'
                            }}>
                              x{count}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f0abfc', marginTop: '8px' }}>
                          {zChar.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#00ffff', background: 'rgba(0,0,0,0.8)', padding: '3px 10px', borderRadius: '10px', marginTop: '4px', border: '1px solid #d946ef' }}>
                          ⚡ HP・ATK Zの2倍 ＆ イベント攻撃力50倍超特効！
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ 
              display: 'flex', flexWrap: 'wrap', gap: results.length > 50 ? '3px' : results.length > 10 ? '4px' : '8px', justifyContent: 'center', marginBottom: '24px', padding: '0 8px'
            }}>
              {results.map((result, idx) => {
                const isZ = result.rank === 'Z';
                const isSSS = result.rank === 'SSS';
                const isZPrime = result.rank === "Z'";
                const iconSize = results.length > 50 ? 40 : results.length > 10 ? 56 : results.length > 1 ? 76 : 130;
                return (
                  <div key={idx} style={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#ffffff',
                    padding: results.length > 50 ? '2px' : '6px',
                    borderRadius: '10px',
                    border: `2px solid ${RANK_COLORS[result.rank]}`,
                    width: `${iconSize + (results.length > 50 ? 4 : 12)}px`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    zIndex: (isZPrime || isZ) ? 10 : isSSS ? 5 : 1
                  }}>
                    <CharacterAvatar character={result} size={iconSize} />
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: RANK_COLORS[result.rank],
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      padding: '1px 4px',
                      borderRadius: '6px'
                    }}>
                      {result.rank}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setResults(null)}
              style={{ padding: '12px 36px', fontSize: '1.1rem', fontWeight: 900, borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', marginTop: '10px', marginBottom: '20px' }}
            >
              OK (ガシャ画面へ戻る)
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>

            {/* Navigation Arrows */}
            <div 
              onClick={() => {
                const idx = GACHA_TYPES.indexOf(currentGacha);
                const prevIdx = (idx - 1 + GACHA_TYPES.length) % GACHA_TYPES.length;
                setCurrentGacha(GACHA_TYPES[prevIdx]);
              }} 
              style={{ position: 'absolute', left: 8, top: '42%', zIndex: 20, cursor: 'pointer', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              <ChevronLeft size={36} color="white" />
            </div>
            <div 
              onClick={() => {
                const idx = GACHA_TYPES.indexOf(currentGacha);
                const nextIdx = (idx + 1) % GACHA_TYPES.length;
                setCurrentGacha(GACHA_TYPES[nextIdx]);
              }} 
              style={{ position: 'absolute', right: 8, top: '42%', zIndex: 20, cursor: 'pointer', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              <ChevronRight size={36} color="white" />
            </div>
              
            {/* Single Gacha Display */}
            <div 
              onTouchStart={handleTouchStart} 
              onTouchEnd={handleTouchEnd}
              style={{ width: '100%', overflow: 'hidden', position: 'relative', minHeight: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'pan-y' }}
            >
              {currentGacha === 'bleach' && (
                <div className="animate-pulse" style={{ 
                  width: '240px', height: '260px', background: 'linear-gradient(180deg, #881337 0%, #4c0519 50%, #0f172a 100%)', borderRadius: '20px 20px 10px 10px', border: '6px solid #e11d48', boxShadow: '0 15px 0 rgba(0,0,0,0.4), 0 0 35px rgba(225,29,72,0.8)', position: 'relative', marginTop: '10px'
                }}>
                  <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #e11d48, #9333ea)', border: '3px solid #00ffff', padding: '5px 16px', borderRadius: '20px', color: 'white', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.6)' }}>
                    ⚔️ ブリーチコラボガシャ
                  </div>
                  <div style={{ position: 'absolute', top: 30, left: 15, right: 15, height: 110, background: 'rgba(0,0,0,0.5)', borderRadius: 10, border: '3px solid #e11d48', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔮⚔️👑</div>
                    <div style={{ fontSize: '0.75rem', color: '#00ffff', fontWeight: 'bold', marginTop: '4px' }}>【ランクZ\'】崩玉藍染 確率0.1%！</div>
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: '900' }}>十刃（エスパーダ）限定降臨！</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 25, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#0f172a', borderRadius: '50%', border: '4px solid #00ffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>💍</span>
                  </div>
                </div>
              )}

              {currentGacha === 'normal' && (
                <div style={{ 
                  width: '230px', height: '250px', background: 'linear-gradient(180deg, #336633 0%, #113311 100%)', borderRadius: '20px 20px 10px 10px', border: '6px solid #112211', boxShadow: '0 15px 0 rgba(0,0,0,0.3)', position: 'relative', marginTop: '10px'
                }}>
                  <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#331155', border: '3px solid #ffcc00', padding: '5px 20px', borderRadius: '20px', color: 'white', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>
                    妖怪ガシャ
                  </div>
                  <div style={{ position: 'absolute', top: 30, left: 20, right: 20, height: 100, background: 'rgba(255,255,255,0.2)', borderRadius: 10, border: '4px solid #112211' }}>
                    <div style={{ fontSize: '3rem', marginTop: 10, textAlign: 'center' }}>🔮</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#112211', borderRadius: '50%', border: '4px solid #333' }}></div>
                </div>
              )}

              {currentGacha === 'event' && (
                <div className="animate-float" style={{ 
                  width: '230px', height: '250px', background: 'linear-gradient(180deg, #ff3366 0%, #990033 100%)', borderRadius: '20px 20px 10px 10px', border: '6px solid #550011', boxShadow: '0 15px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,50,100,0.5)', position: 'relative', marginTop: '10px'
                }}>
                  <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#ffcc00', border: '3px solid #ff3300', padding: '5px 20px', borderRadius: '20px', color: '#ff0000', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>
                    イベントガシャ
                  </div>
                  <div style={{ position: 'absolute', top: 30, left: 20, right: 20, height: 100, background: 'rgba(255,255,255,0.2)', borderRadius: 10, border: '4px solid #550011' }}>
                    <div style={{ fontSize: '3rem', marginTop: 10, textAlign: 'center', filter: 'hue-rotate(180deg)' }}>🔮</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#550011', borderRadius: '50%', border: '4px solid #333' }}></div>
                </div>
              )}
            </div>

            {/* Pagination dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              {GACHA_TYPES.map(type => (
                <div 
                  key={type}
                  onClick={() => setCurrentGacha(type)} 
                  style={{ 
                    width: 12, height: 12, borderRadius: '50%', 
                    background: currentGacha === type ? (type === 'bleach' ? '#e11d48' : type === 'event' ? '#ff3366' : '#fff') : 'rgba(255,255,255,0.3)', 
                    border: '2px solid rgba(0,0,0,0.3)', cursor: 'pointer' 
                  }} 
                />
              ))}
            </div>

            {/* Pity / Info area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
              {currentGacha === 'bleach' ? (
                <div style={{ background: 'linear-gradient(90deg, rgba(225,29,72,0.9), rgba(147,51,234,0.9))', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', color: '#fff', fontWeight: '900', border: '1px solid #00ffff', boxShadow: '0 0 10px rgba(225,29,72,0.5)' }}>
                  ⚔️ ブリーチガシャ: ランクZ'【崩玉藍染】&【十刃】全降臨！(1連=💍5個)
                </div>
              ) : (
                <>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', color: '#ffcc00', border: '1px solid rgba(255,255,255,0.3)' }}>
                    SSS以上確定まで あと <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{pityCount ?? 100}</strong> 回
                  </div>
                  {currentGacha === 'event' && (stepUpCount ?? 0) >= 10 && (
                    <div style={{ background: 'rgba(255,34,85,0.8)', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>
                      🔥 ステップアップ中！（SS確率UP）
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Buttons Area */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentGacha === 'bleach' ? (
                /* ブリーチガシャ用: 1連=5個, 10連=50個, 100連=500個 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <GachaButton times={1} cost={5} color="btn-primary" />
                    <GachaButton times={10} cost={50} color="btn-secondary" />
                    <GachaButton times={100} cost={500} color="btn-green" />
                  </div>
                  {(bleachRings || 0) < 5 && (
                    <p className="text-outline" style={{ color: '#ff2255', textAlign: 'center', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ブリーチリングが足りません！（5個〜500個必要）
                    </p>
                  )}
                </div>
              ) : (
                /* 通常/イベントガシャ用ボタン群 */
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <GachaButton times={1} cost={GACHA_COST_1} color="btn-primary" />
                    <GachaButton times={10} cost={GACHA_COST_10} color="btn-secondary" />
                    <GachaButton times={100} cost={GACHA_COST_100} color="btn-green" />
                    <GachaButton times={500} cost={GACHA_COST_500} color="btn-y-point" />
                  </div>
                  
                  {yPoints < GACHA_COST_1 && (
                    <p className="text-outline" style={{ color: '#ff2255', textAlign: 'center', margin: 0, fontSize: '1rem' }}>Yポイントが足りません！</p>
                  )}
                </>
              )}

              {/* Exchange Section */}
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(225,29,72,0.2), rgba(147,51,234,0.2))', 
                borderRadius: '24px', 
                border: '2px solid #e11d48',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <h4 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  💍 ブリーチリング両替所
                </h4>
                <p style={{ color: '#e2e8f0', textAlign: 'center', fontSize: '0.8rem', marginBottom: '12px', lineHeight: 1.4 }}>
                  5,000 Ypt → 💍 1個（1連分） / 50,000 Ypt → 💍 10個
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => { const res = convertYPointsToBleachRings(5000); if(res.message) alert(res.message); }} style={{ background: '#881337', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #00ffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>5,000 Yp (💍1個)</button>
                  <button onClick={() => { const res = convertYPointsToBleachRings(50000); if(res.message) alert(res.message); }} style={{ background: '#881337', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #00ffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>5万 Yp (💍10個)</button>
                  <button onClick={() => { const res = convertYPointsToBleachRings(500000); if(res.message) alert(res.message); }} style={{ background: '#881337', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #00ffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>50万 Yp (💍100個)</button>
                  <button onClick={() => { const res = convertYPointsToBleachRings(5000000); if(res.message) alert(res.message); }} style={{ background: '#881337', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #00ffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>500万 Yp (💍1000個)</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gacha;
