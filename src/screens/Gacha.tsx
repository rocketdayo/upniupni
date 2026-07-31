import React, { useState, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { CHARACTERS } from '../data/characters';
import type { Character, Rank } from '../data/characters';
import { ArrowLeft, Info, ChevronLeft, ChevronRight, History, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CharacterAvatar } from '../components/CharacterAvatar';

const GACHA_COST_1 = 50;
const GACHA_COST_10 = 500;
const GACHA_COST_100 = 5000;
const GACHA_COST_500 = 25000;

const RANK_ORDER: Record<Rank, number> = { Z: -2, SSS: -1, SS: 0, S: 1, A: 2, B: 3, C: 4, D: 5, E: 6 };
const RANK_COLORS: Record<Rank, string> = {
  Z: '#00ffff', SSS: '#ffd700', SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
};

// 恒常ガシャ (Permanent)
const normalRankWeights: Record<Rank, number> = {
  'Z': 0, 'SSS': 0, 'SS': 0, 'S': 2, 'A': 8, 'B': 20, 'C': 30, 'D': 25, 'E': 15
};

// イベントガシャ (Event)
const eventRankWeights: Record<Rank, number> = {
  'Z': 0, 'SSS': 0, 'SS': 1, 'S': 5, 'A': 10, 'B': 20, 'C': 24, 'D': 25, 'E': 15
};

// 超高級ガシャ (Ultra Luxury): 100連固定 / 天井なし / 0.2%で新キャラSSS1体
const ultraLuxuryRankWeights: Record<Rank, number> = {
  'Z': 0,
  'SSS': 0.2,  // 0.2%
  'SS': 2.0,   // 2.0%
  'S': 8.0,    // 8.0%
  'A': 20.0,   // 20.0%
  'B': 30.0,   // 30.0%
  'C': 20.0,   // 20.0%
  'D': 12.8,   // 12.8%
  'E': 7.0     // 7.0%
};

// 超ウルトラガシャ (Ultra Super): 100連固定 / 天井なし / 0.2%で新キャラZ
const ultraSuperRankWeights: Record<Rank, number> = {
  'Z': 0.2,    // 0.2% (新キャラZ)
  'SSS': 1.0,  // 1.0% (User specified SSS as 1%)
  'SS': 8.0,   // 8.0%
  'S': 15.0,   // 15.0%
  'A': 25.0,   // 25.0%
  'B': 25.0,   // 25.0%
  'C': 15.0,   // 15.0%
  'D': 10.8,   // 10.8%
  'E': 0.0     // 0.0%
};

type GachaType = 'normal' | 'event' | 'ultra_luxury' | 'ultra_super';

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
  const { yPoints, addYPoints, summerMedals, addSummerMedals, convertYPointsToSummerMedals, unlockCharacter, trackMission, pityCount, stepUpCount, gachaHistory, recordGachaResult } = useGame();
  const navigate = useNavigate();
  const [results, setResults] = useState<Character[] | null>(null);
  const [capsuleStageItems, setCapsuleStageItems] = useState<GachaCapsuleItem[] | null>(null);
  const [selectedCutInChar, setSelectedCutInChar] = useState<Character | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [currentGacha, setCurrentGacha] = useState<GachaType>('normal');
  const [showRates, setShowRates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const pullGacha = (timesInput: number) => {
    let times = timesInput;
    let cost = GACHA_COST_1;
    const isSummerCurrency = currentGacha === 'ultra_luxury' || currentGacha === 'ultra_super';

    if (currentGacha === 'ultra_super') {
      times = 100; // 100連固定
      cost = 3000; // 3,000 サマーコイン
    } else if (currentGacha === 'ultra_luxury') {
      times = 100; // 100連固定
      cost = 500; // 500 サマーコイン
    } else {
      if (times === 10) cost = GACHA_COST_10;
      if (times === 100) cost = GACHA_COST_100;
      if (times === 500) cost = GACHA_COST_500;
    }

    const availableCurrency = isSummerCurrency ? (summerMedals || 0) : yPoints;
    if (availableCurrency < cost || isPulling) return;
    
    setIsPulling(true);
    if (isSummerCurrency) {
      addSummerMedals(-cost);
    } else {
      addYPoints(-cost);
    }
    trackMission('gacha_pull', times);
    
    setTimeout(() => {
      const pulledChars: Character[] = [];
      const weights = currentGacha === 'ultra_super'
        ? { ...ultraSuperRankWeights }
        : currentGacha === 'ultra_luxury'
        ? { ...ultraLuxuryRankWeights }
        : { ...(currentGacha === 'event' ? eventRankWeights : normalRankWeights) };
      
      // Step Up Logic (恒常・イベントガシャ用)
      if (currentGacha !== 'ultra_luxury' && currentGacha !== 'ultra_super') {
        const stepUpBonus = Math.floor((stepUpCount || 0) / 10);
        if (weights['SS'] !== undefined) weights['SS'] += stepUpBonus * 0.5;
        if (weights['S'] !== undefined) weights['S'] += stepUpBonus * 1.5;
      }

      let newPityCount = pityCount ?? 100;
      let newStepUpCount = (stepUpCount ?? 0) + (currentGacha !== 'ultra_luxury' && currentGacha !== 'ultra_super' ? times : 0);

      for (let i = 0; i < times; i++) {
        let pulledRank: Rank = 'E';

        if (currentGacha === 'ultra_luxury' || currentGacha === 'ultra_super') {
          // 天井なし。確率計算
          let totalWeight = 0;
          for (const w of Object.values(weights)) totalWeight += w;
          let rand = Math.random() * totalWeight;
          for (const [r, w] of Object.entries(weights)) {
            if (rand < w) {
              pulledRank = r as Rank;
              break;
            }
            rand -= w;
          }
        } else {
          // 通常/イベントガシャ: PITY適用
          newPityCount--;
          if (newPityCount <= 0) {
            pulledRank = 'SS'; // PITY GUARANTEE
          } else {
            let totalWeight = 0;
            for (const w of Object.values(weights)) totalWeight += w;
            let rand = Math.random() * totalWeight;
            for (const [r, w] of Object.entries(weights)) {
              if (rand < w) {
                pulledRank = r as Rank;
                break;
              }
              rand -= w;
            }
          }
          
          if (pulledRank === 'SS' && weights['SS'] === 0) pulledRank = 'S';

          if (pulledRank === 'SS') {
            newPityCount = 100;
            newStepUpCount = 0;
          }
        }
        
        const rankChars = CHARACTERS.filter(c => c.rank === pulledRank);
        const pulledChar = rankChars.length > 0
          ? rankChars[Math.floor(Math.random() * rankChars.length)]
          : CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

        pulledChars.push(pulledChar);
        unlockCharacter(pulledChar.id);
      }

      recordGachaResult(pulledChars.map(c => c.id), newPityCount, newStepUpCount);

      // 1連、10连の時のみカプセルタップアニメーション画面へ移行（100連・500連は即時一括結果表示）
      if (times === 1 || times === 10) {
        const caps: GachaCapsuleItem[] = pulledChars.map((char, i) => {
          let color: 'rainbow' | 'gold' | 'red' = 'red';
          if (['Z', 'SSS', 'SS'].includes(char.rank)) {
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
      if (currentGacha === 'normal') setCurrentGacha('event');
      else if (currentGacha === 'event') setCurrentGacha('ultra_luxury');
      else if (currentGacha === 'ultra_luxury') setCurrentGacha('ultra_super');
    } else if (diff < -40) {
      if (currentGacha === 'ultra_super') setCurrentGacha('ultra_luxury');
      else if (currentGacha === 'ultra_luxury') setCurrentGacha('event');
      else if (currentGacha === 'event') setCurrentGacha('normal');
    }
    touchStartX.current = null;
  };

  const GachaButton = ({ times, cost, color }: { times: number, cost: number, color?: string }) => {
    const isSummerCurrency = currentGacha === 'ultra_luxury' || currentGacha === 'ultra_super';
    const currencyLabel = isSummerCurrency ? '枚' : ' Ypt';
    const currencyIcon = isSummerCurrency ? '🏝️' : <div className="currency-icon y-point-icon" style={{width: 14, height: 14, fontSize: '0.6rem'}}>y</div>;
    const canAfford = isSummerCurrency ? (summerMedals || 0) >= cost : yPoints >= cost;

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

  const activeWeights = currentGacha === 'ultra_super'
    ? ultraSuperRankWeights
    : currentGacha === 'ultra_luxury'
    ? ultraLuxuryRankWeights
    : (currentGacha === 'event' ? eventRankWeights : normalRankWeights);

  return (
    <div className="view-container" style={{ background: 'url(https://img.game8.jp/323860/a62ab2ed8e11a6f87ea4952093557e03.png/show) center/cover no-repeat', paddingBottom: 0 }}>
      {/* Rates Modal */}
      {showRates && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '85%', maxWidth: '400px', padding: '20px', position: 'relative', border: `2px solid ${currentGacha === 'ultra_super' ? '#00ffff' : '#ffd700'}` }}>
            <button onClick={() => setShowRates(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>
              ✕
            </button>
            <h3 style={{ margin: '0 0 15px', textAlign: 'center', color: currentGacha === 'ultra_super' ? '#00ffff' : '#ffd700' }}>
              {currentGacha === 'ultra_super' ? '🌌 超ウルトラガシャ' : currentGacha === 'ultra_luxury' ? '👑 超高級ガシャ' : currentGacha === 'event' ? 'イベントガシャ' : '恒常ガシャ'} 提供割合
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(activeWeights)
                .sort((a, b) => RANK_ORDER[a[0] as Rank] - RANK_ORDER[b[0] as Rank])
                .map(([rank, weight]) => {
                  const total = Object.values(activeWeights).reduce((a, b) => a + b, 0);
                  const isNoPity = currentGacha === 'ultra_luxury' || currentGacha === 'ultra_super';
                  const stepUpBonus = !isNoPity ? Math.floor((stepUpCount || 0) / 10) : 0;
                  let finalWeight = weight;
                  if (rank === 'SS' && !isNoPity) finalWeight += stepUpBonus * 0.5;
                  if (rank === 'S' && !isNoPity) finalWeight += stepUpBonus * 1.5;
                  
                  const isZ = rank === 'Z';
                  const isSSS = rank === 'SSS';
                  const pct = ((finalWeight / total) * 100).toFixed(isZ || isSSS ? 2 : 1);
                  if (finalWeight === 0) return null;
                  return (
                    <div key={rank} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '8px 12px', 
                      background: isZ 
                        ? 'linear-gradient(90deg, rgba(0,255,255,0.3), rgba(13,148,136,0.3))' 
                        : isSSS 
                        ? 'linear-gradient(90deg, rgba(255,215,0,0.3), rgba(255,0,128,0.3))' 
                        : 'rgba(0,0,0,0.3)', 
                      borderRadius: '8px', 
                      border: isZ ? '1px solid #00ffff' : isSSS ? '1px solid #ffd700' : 'none' 
                    }}>
                      <span className="rank-badge" style={{ backgroundColor: RANK_COLORS[rank as Rank], minWidth: '36px', textAlign: 'center', fontWeight: 'bold' }}>{rank}</span>
                      <span style={{ fontWeight: 'bold', color: isZ ? '#00ffff' : isSSS ? '#ffd700' : '#fff' }}>
                        {pct}% {isZ ? '(超越新キャラZ降臨！)' : isSSS ? '(新キャラSSS降臨！)' : ''}
                      </span>
                    </div>
                  );
                })}
            </div>
            {currentGacha === 'ultra_super' ? (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#00ffff', marginTop: '15px', fontWeight: 'bold' }}>
                ※100連固定 (3,000 サマーコイン) / 天井なし固定確率抽選です
              </p>
            ) : currentGacha === 'ultra_luxury' ? (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ffd700', marginTop: '15px', fontWeight: 'bold' }}>
                ※100連固定 (500 サマーコイン) / 天井なし固定確率抽選です
              </p>
            ) : stepUpCount && stepUpCount >= 10 ? (
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-shake" style={{
              width: '240px',
              height: '300px',
              background: currentGacha === 'ultra_luxury'
                ? 'linear-gradient(180deg, #ffd700 0%, #b91c1c 50%, #4c0519 100%)'
                : 'linear-gradient(180deg, #557755 0%, #224422 100%)',
              borderRadius: '20px 20px 10px 10px',
              border: currentGacha === 'ultra_luxury' ? '8px solid #ffd700' : '8px solid #112211',
              boxShadow: currentGacha === 'ultra_luxury' ? '0 0 30px #ffd700, 0 20px 0 rgba(0,0,0,0.5)' : '0 20px 0 rgba(0,0,0,0.4)',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: 30, left: 20, right: 20, height: 120, background: 'rgba(255,255,255,0.2)', borderRadius: 10, border: '4px solid #112211', overflow: 'hidden' }}>
                {/* Spinning capsules */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse" style={{
                    position: 'absolute',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: currentGacha === 'ultra_luxury'
                      ? (i % 2 === 0 ? '#ffd700' : '#ff007f')
                      : (i % 2 === 0 ? '#333' : '#aa0000'),
                    border: '2px solid #000',
                    top: Math.random() * 80,
                    left: Math.random() * 120,
                    animationDuration: `${0.2 + Math.random() * 0.3}s`
                  }}>
                    <div style={{ width: '100%', height: '50%', background: 'rgba(255,255,255,0.3)', borderRadius: '20px 20px 0 0' }}></div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 60, height: 60, background: '#112211', borderRadius: '50%', border: '4px solid #333' }}></div>
            </div>
          </div>
        ) : capsuleStageItems ? (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'radial-gradient(circle at 50% 40%, #4a0d2e 0%, #1a0011 70%, #000000 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '10px', overflow: 'hidden'
          }}>
            {/* 右上「すべてあける」ボタン */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 60 }}>
              <button
                onClick={handleOpenAllCapsules}
                style={{
                  background: 'linear-gradient(180deg, #fff275 0%, #ffaa00 100%)',
                  color: '#3d1a00',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  padding: '8px 18px',
                  borderRadius: '25px',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 15px rgba(255, 170, 0, 0.8), 0 2px 0 #000',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  textShadow: '0 1px 0 #fff'
                }}
              >
                すべてあける
              </button>
            </div>

            {/* ガシャマシン背景イラスト */}
            <div style={{
              position: 'absolute',
              width: '260px',
              height: '320px',
              background: 'linear-gradient(180deg, #8b0032 0%, #3a0015 100%)',
              border: '6px solid #ff0055',
              borderRadius: '20px',
              boxShadow: '0 0 50px rgba(255,0,85,0.4)',
              opacity: 0.35,
              pointerEvents: 'none'
            }}>
              <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 140, border: '4px solid #ff0055', borderRadius: 10 }}></div>
              <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 60, height: 60, borderRadius: '50%', border: '4px solid #ff0055' }}></div>
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
                          animation: 'capsuleOpenPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                          background: 'rgba(0,0,0,0.7)',
                          padding: '6px',
                          borderRadius: '16px',
                          border: `2px solid ${RANK_COLORS[item.character.rank]}`,
                          boxShadow: `0 0 15px ${RANK_COLORS[item.character.rank]}`,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        <CharacterAvatar character={item.character} size={size > 80 ? 90 : 56} />
                        <div style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          color: RANK_COLORS[item.character.rank],
                          marginTop: '2px',
                          textShadow: '0 1px 3px #000'
                        }}>
                          {item.character.rank}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 結果画面へ遷移するボタン（全カプセル開封済み、または即進行用） */}
            {capsuleStageItems.every(c => c.isOpen) && (
              <button
                onClick={() => setCapsuleStageItems(null)}
                style={{
                  position: 'absolute',
                  bottom: '25px',
                  zIndex: 60,
                  background: 'linear-gradient(135deg, #00ff88 0%, #009955 100%)',
                  color: '#003311',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  padding: '12px 36px',
                  borderRadius: '30px',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 25px rgba(0, 255, 136, 0.8), 0 4px 0 #000',
                  cursor: 'pointer',
                  animation: 'capsulePulse 1.5s ease-in-out infinite'
                }}
              >
                結果一覧へ ➔
              </button>
            )}

            {/* カットインモーダル (タップしたキャラの豪華出現演出) */}
            {selectedCutInChar && (
              <div
                onClick={() => setSelectedCutInChar(null)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 100,
                  background: 'rgba(0,0,0,0.85)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <div
                  style={{
                    background: selectedCutInChar.rank === 'Z'
                      ? 'linear-gradient(135deg, #0d9488 0%, #111827 100%)'
                      : selectedCutInChar.rank === 'SSS'
                      ? 'linear-gradient(135deg, #b45309 0%, #111827 100%)'
                      : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    border: `4px solid ${RANK_COLORS[selectedCutInChar.rank]}`,
                    borderRadius: '24px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    maxWidth: '320px',
                    width: '100%',
                    boxShadow: `0 0 40px ${RANK_COLORS[selectedCutInChar.rank]}`,
                    animation: 'capsuleOpenPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    position: 'relative'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 900, color: RANK_COLORS[selectedCutInChar.rank],
                    marginBottom: '8px', textShadow: '0 0 10px rgba(255,255,255,0.5)'
                  }}>
                    ✨ RANK {selectedCutInChar.rank} GET!! ✨
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <CharacterAvatar character={selectedCutInChar} size={110} />
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginBottom: '16px' }}>
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
            <h2 className="text-outline" style={{ marginBottom: '16px', fontSize: '2rem', color: results.some(r => r.rank === 'Z') ? '#00ffff' : results.some(r => r.rank === 'SSS') ? '#ffd700' : '#fff' }}>
              {results.some(r => r.rank === 'Z') ? '✨ 超越神 Z 降臨！！！ ✨' : results.some(r => r.rank === 'SSS') ? '✨ SSS降臨！！！ ✨' : 'ガシャ結果！'}
            </h2>
            
            {/* Zが出た場合の超々々豪華巨大ピックアップ表示 */}
            {results.filter(r => r.rank === 'Z').length > 0 && (
              <div style={{
                width: '92%',
                maxWidth: '420px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(13,148,136,0.95) 50%, rgba(0,255,255,0.9) 100%)',
                border: '4px solid #00ffff',
                borderRadius: '24px',
                padding: '20px 16px',
                boxShadow: '0 0 50px rgba(0,255,255,0.9), inset 0 0 30px rgba(0,255,255,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #00ffff, #0d9488, #00ffff)',
                  color: '#000',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  padding: '4px 18px',
                  borderRadius: '20px',
                  border: '2px solid #fff',
                  boxShadow: '0 0 15px #00ffff',
                  marginBottom: '14px',
                  textShadow: '0 0 5px #fff'
                }}>
                  🌀 超越神化 Z 降臨！ 🌀
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from(new Set(results.filter(r => r.rank === 'Z').map(c => c.id))).map(zId => {
                    const zChar = results.find(c => c.id === zId)!;
                    const count = results.filter(c => c.id === zId).length;
                    return (
                      <div key={zId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          position: 'relative',
                          padding: '6px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #00ffff 0%, #0d9488 70%, #111827 100%)',
                          boxShadow: '0 0 40px #00ffff, inset 0 0 20px #fff'
                        }}>
                          <CharacterAvatar character={zChar} size={140} />
                          {count > 1 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              background: '#0d9488',
                              color: '#fff',
                              fontSize: '0.9rem',
                              fontWeight: 900,
                              padding: '2px 10px',
                              borderRadius: '12px',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 6px #000'
                            }}>
                              x{count}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#00ffff', textShadow: '0 2px 8px #000, 0 0 12px #0d9488', marginTop: '10px' }}>
                          {zChar.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#a5f3fc', background: 'rgba(0,0,0,0.65)', padding: '3px 12px', borderRadius: '12px', marginTop: '6px', border: '1px solid #00ffff', boxShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                          ⚡ HP・ATK SSSの10倍 ＆ 攻撃力30倍超特効！
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SSSが出た場合の超豪華巨大ピックアップ表示 */}
            {results.filter(r => r.rank === 'SSS').length > 0 && results.filter(r => r.rank === 'Z').length === 0 && currentGacha !== 'ultra_super' && (
              <div style={{
                width: '92%',
                maxWidth: '420px',
                margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(20,0,40,0.95) 0%, rgba(88,28,135,0.95) 50%, rgba(255,0,128,0.9) 100%)',
                border: '4px solid #ffd700',
                borderRadius: '24px',
                padding: '20px 16px',
                boxShadow: '0 0 50px rgba(255,215,0,0.9), inset 0 0 30px rgba(255,215,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ffd700, #ff007f, #ffd700)',
                  color: '#000',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  padding: '4px 18px',
                  borderRadius: '20px',
                  border: '2px solid #fff',
                  boxShadow: '0 0 15px #ffd700',
                  marginBottom: '14px',
                  textShadow: '0 0 5px #fff'
                }}>
                  👑 究極超激レア SSS 降臨！ 👑
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from(new Set(results.filter(r => r.rank === 'SSS').map(c => c.id))).map(sssId => {
                    const sssChar = results.find(c => c.id === sssId)!;
                    const count = results.filter(c => c.id === sssId).length;
                    return (
                      <div key={sssId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          position: 'relative',
                          padding: '6px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #ffd700 0%, #ff007f 70%, #1e1b4b 100%)',
                          boxShadow: '0 0 40px #ffd700, inset 0 0 20px #fff'
                        }}>
                          <CharacterAvatar character={sssChar} size={140} />
                          {count > 1 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              background: '#ff007f',
                              color: '#fff',
                              fontSize: '0.9rem',
                              fontWeight: 900,
                              padding: '2px 10px',
                              borderRadius: '12px',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 6px #000'
                            }}>
                              x{count}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffd700', textShadow: '0 2px 8px #000, 0 0 12px #ff007f', marginTop: '10px' }}>
                          {sssChar.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fef08a', background: 'rgba(0,0,0,0.65)', padding: '3px 12px', borderRadius: '12px', marginTop: '6px', border: '1px solid #ffd700', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                          ⚡ 攻撃力10倍 イベント爆発特効！
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ 
              display: 'flex', flexWrap: 'wrap', gap: results.length > 50 ? '3px' : results.length > 10 ? '4px' : '10px', justifyContent: 'center', marginBottom: '30px', padding: '0 10px'
            }}>
              {results.map((result, idx) => {
                const isZ = result.rank === 'Z';
                const isSSS = result.rank === 'SSS';
                const iconSize = results.length > 50 ? 40 : results.length > 10 ? 60 : results.length > 1 ? 80 : 140;
                return (
                  <div key={idx} style={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: isZ ? 'linear-gradient(135deg, #fff 0%, #e0ffff 100%)' : isSSS ? 'linear-gradient(135deg, #fff 0%, #fff7d0 100%)' : 'rgba(255,255,255,0.9)',
                    padding: results.length > 50 ? '3px' : '8px',
                    borderRadius: '14px',
                    border: `3px solid ${RANK_COLORS[result.rank]}`,
                    width: `${iconSize + (results.length > 50 ? 6 : 16)}px`,
                    boxShadow: isZ ? '0 0 25px #00ffff, 0 0 10px #0d9488' : isSSS ? '0 0 25px #ffd700, 0 0 10px #ff007f' : (result.rank === 'S' || result.rank === 'SS' ? `0 0 15px ${RANK_COLORS[result.rank]}` : 'none'),
                    transform: isZ ? 'scale(1.12)' : isSSS ? 'scale(1.08)' : 'none',
                    zIndex: isZ ? 15 : isSSS ? 10 : 1
                  }}>
                    <CharacterAvatar character={result} size={iconSize} />
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: RANK_COLORS[result.rank],
                      color: isZ || isSSS ? '#000' : 'white',
                      fontWeight: 900,
                      fontSize: results.length > 50 ? '0.55rem' : '0.7rem',
                      padding: results.length > 50 ? '1px 3px' : '2px 5px',
                      borderRadius: '8px',
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      lineHeight: 1.2,
                      zIndex: 20
                    }}>
                      {result.rank}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '15px 30px' }} onClick={() => setResults(null)}>
                OK
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Swipable Banners */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ position: 'relative', marginTop: '20px', flex: 1, overflow: 'hidden' }}
            >
              {/* Navigation Arrows */}
              {currentGacha !== 'normal' && (
                <div 
                  onClick={() => {
                    if (currentGacha === 'ultra_super') setCurrentGacha('ultra_luxury');
                    else if (currentGacha === 'ultra_luxury') setCurrentGacha('event');
                    else if (currentGacha === 'event') setCurrentGacha('normal');
                  }} 
                  style={{ position: 'absolute', left: 8, top: '42%', zIndex: 20, animation: 'pulse 2s infinite', cursor: 'pointer', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px' }}
                >
                  <ChevronLeft size={36} color="white" />
                </div>
              )}
              {currentGacha !== 'ultra_super' && (
                <div 
                  onClick={() => {
                    if (currentGacha === 'normal') setCurrentGacha('event');
                    else if (currentGacha === 'event') setCurrentGacha('ultra_luxury');
                    else if (currentGacha === 'ultra_luxury') setCurrentGacha('ultra_super');
                  }} 
                  style={{ position: 'absolute', right: 8, top: '42%', zIndex: 20, animation: 'pulse 2s infinite', cursor: 'pointer', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px' }}
                >
                  <ChevronRight size={36} color="white" />
                </div>
              )}
              
              <div 
                style={{ 
                  display: 'flex', 
                  width: '400%', 
                  height: '100%', 
                  transform: `translateX(${
                    currentGacha === 'ultra_super' ? '-75%' : 
                    currentGacha === 'ultra_luxury' ? '-50%' : 
                    currentGacha === 'event' ? '-25%' : '0%'
                  })`,
                  transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                {/* 1. Normal Gacha Page */}
                <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ 
                    width: '210px', height: '240px', background: 'linear-gradient(180deg, #336633 0%, #113311 100%)', borderRadius: '20px 20px 10px 10px', border: '6px solid #112211', boxShadow: '0 15px 0 rgba(0,0,0,0.3)', position: 'relative', marginTop: '10px'
                  }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#331155', border: '3px solid #ffcc00', padding: '5px 20px', borderRadius: '20px', color: 'white', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>
                      妖怪ガシャ
                    </div>
                    <div style={{ position: 'absolute', top: 30, left: 20, right: 20, height: 100, background: 'rgba(255,255,255,0.2)', borderRadius: 10, border: '4px solid #112211' }}>
                      <div style={{ fontSize: '3rem', marginTop: 10, textAlign: 'center' }}>🔮</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#112211', borderRadius: '50%', border: '4px solid #333' }}></div>
                  </div>
                </div>

                {/* 2. Event Gacha Page */}
                <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="animate-float" style={{ 
                    width: '210px', height: '240px', background: 'linear-gradient(180deg, #ff3366 0%, #990033 100%)', borderRadius: '20px 20px 10px 10px', border: '6px solid #550011', boxShadow: '0 15px 0 rgba(0,0,0,0.3), 0 0 30px rgba(255,50,100,0.5)', position: 'relative', marginTop: '10px'
                  }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#ffcc00', border: '3px solid #ff3300', padding: '5px 20px', borderRadius: '20px', color: '#ff0000', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>
                      イベントガシャ
                    </div>
                    <div style={{ position: 'absolute', top: 30, left: 20, right: 20, height: 100, background: 'rgba(255,255,255,0.2)', borderRadius: 10, border: '4px solid #550011' }}>
                      <div style={{ fontSize: '3rem', marginTop: 10, textAlign: 'center', filter: 'hue-rotate(180deg)' }}>🔮</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#550011', borderRadius: '50%', border: '4px solid #333' }}></div>
                  </div>
                </div>

                {/* 3. Ultra Luxury Gacha Page (超高級ガシャ) */}
                <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="animate-pulse" style={{ 
                    width: '220px',
                    height: '250px',
                    background: 'linear-gradient(180deg, #ffd700 0%, #d97706 40%, #7f1d1d 100%)',
                    borderRadius: '20px 20px 10px 10px',
                    border: '6px solid #ffd700',
                    boxShadow: '0 15px 0 rgba(0,0,0,0.4), 0 0 35px rgba(255,215,0,0.8)',
                    position: 'relative',
                    marginTop: '10px'
                  }}>
                    <div style={{ 
                      position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #ffd700, #ff007f)',
                      border: '3px solid #ffffff',
                      padding: '5px 16px', borderRadius: '20px', color: '#000', fontWeight: 900, whiteSpace: 'nowrap',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Crown size={18} fill="#000" color="#000" />
                      超高級ガシャ
                    </div>
                    <div style={{ position: 'absolute', top: 30, left: 15, right: 15, height: 110, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '3px solid #ffd700', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>👑✨</div>
                      <div style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: 'bold', marginTop: '4px' }}>【100連固定】500 サマーコイン</div>
                      <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '900' }}>0.2%で新キャラSSS降臨！</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 25, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#4c0519', borderRadius: '50%', border: '4px solid #ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>💎</span>
                    </div>
                  </div>
                </div>

                {/* 4. Ultra Super Gacha Page (超ウルトラガシャ) */}
                <div style={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="animate-pulse" style={{ 
                    width: '220px',
                    height: '250px',
                    background: 'linear-gradient(180deg, #00ffff 0%, #0d9488 40%, #111827 100%)',
                    borderRadius: '20px 20px 10px 10px',
                    border: '6px solid #00ffff',
                    boxShadow: '0 15px 0 rgba(0,0,0,0.4), 0 0 35px rgba(0,255,255,0.8)',
                    position: 'relative',
                    marginTop: '10px'
                  }}>
                    <div style={{ 
                      position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #00ffff, #0d9488)',
                      border: '3px solid #ffffff',
                      padding: '5px 16px', borderRadius: '20px', color: '#000', fontWeight: 900, whiteSpace: 'nowrap',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Sparkles size={18} fill="#000" color="#000" />
                      超ウルトラガシャ
                    </div>
                    <div style={{ position: 'absolute', top: 30, left: 15, right: 15, height: 110, background: 'rgba(0,0,0,0.4)', borderRadius: 10, border: '3px solid #00ffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>🌀🌌⚡</div>
                      <div style={{ fontSize: '0.72rem', color: '#00ffff', fontWeight: 'bold', marginTop: '4px' }}>【100連固定】3,000 サマーコイン</div>
                      <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '900' }}>0.2%で超越新キャラZ降臨！</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 25, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, background: '#111827', borderRadius: '50%', border: '4px solid #00ffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>🌀</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pagination dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              <div 
                onClick={() => setCurrentGacha('normal')} 
                style={{ width: 12, height: 12, borderRadius: '50%', background: currentGacha === 'normal' ? 'white' : 'rgba(255,255,255,0.3)', border: '2px solid rgba(0,0,0,0.3)', cursor: 'pointer' }} 
              />
              <div 
                onClick={() => setCurrentGacha('event')} 
                style={{ width: 12, height: 12, borderRadius: '50%', background: currentGacha === 'event' ? 'white' : 'rgba(255,255,255,0.3)', border: '2px solid rgba(0,0,0,0.3)', cursor: 'pointer' }} 
              />
              <div 
                onClick={() => setCurrentGacha('ultra_luxury')} 
                style={{ width: 12, height: 12, borderRadius: '50%', background: currentGacha === 'ultra_luxury' ? '#ffd700' : 'rgba(255,255,255,0.3)', border: '2px solid rgba(0,0,0,0.3)', cursor: 'pointer' }} 
              />
              <div 
                onClick={() => setCurrentGacha('ultra_super')} 
                style={{ width: 12, height: 12, borderRadius: '50%', background: currentGacha === 'ultra_super' ? '#00ffff' : 'rgba(255,255,255,0.3)', border: '2px solid rgba(0,0,0,0.3)', cursor: 'pointer' }} 
              />
            </div>

            {/* Pity / Info area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
              {currentGacha === 'ultra_super' ? (
                <div style={{ background: 'linear-gradient(90deg, rgba(0,255,255,0.9), rgba(13,148,136,0.9))', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', color: '#000', fontWeight: '900', border: '1px solid #fff', boxShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                  🌀 超ウルトラガシャ: 天井なし（100連3,000 サマーコイン / 0.2%で超越新キャラZ！）
                </div>
              ) : currentGacha === 'ultra_luxury' ? (
                <div style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.9), rgba(255,0,128,0.9))', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', color: '#000', fontWeight: '900', border: '1px solid #fff', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                  👑 超高級ガシャ: 天井なし（100連500 サマーコイン / 0.2%で新キャラSSS！）
                </div>
              ) : (
                <>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', color: '#ffcc00', border: '1px solid rgba(255,255,255,0.3)' }}>
                    SS確定まで あと <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{pityCount ?? 100}</strong> 回
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
              {currentGacha === 'ultra_super' ? (
                /* 超ウルトラガシャ用: 100連3000サマーコイン固定ボタン */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn"
                    onClick={() => pullGacha(100)}
                    disabled={(summerMedals || 0) < 3000}
                    style={{ 
                      width: '100%',
                      padding: '16px',
                      flexDirection: 'column',
                      gap: '4px',
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, #00ffff 0%, #0d9488 100%)',
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 8px 20px rgba(0,255,255,0.4)'
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>🌀 超ウルトラ100連ガシャをまわす！</span>
                    <span style={{ 
                      background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.95rem', border: '1px solid #00ffff', display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      🏝️ 3,000 サマーコイン
                    </span>
                  </button>
                  {(summerMedals || 0) < 3000 && (
                    <p className="text-outline" style={{ color: '#ff2255', textAlign: 'center', margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>
                      サマーコインが足りません！(必要: 3,000枚)
                    </p>
                  )}
                </div>
              ) : currentGacha === 'ultra_luxury' ? (
                /* 超高級ガシャ用: 100連500サマーコイン固定ボタン */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn"
                    onClick={() => pullGacha(100)}
                    disabled={(summerMedals || 0) < 500}
                    style={{ 
                      width: '100%',
                      padding: '16px',
                      flexDirection: 'column',
                      gap: '4px',
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, #ffd700 0%, #ff007f 100%)',
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 8px 20px rgba(255,215,0,0.4)'
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>👑 超高級100連ガシャをまわす！</span>
                    <span style={{ 
                      background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.95rem', border: '1px solid #ffd700', display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      🏝️ 500 サマーコイン
                    </span>
                  </button>
                  {(summerMedals || 0) < 500 && (
                    <p className="text-outline" style={{ color: '#ff2255', textAlign: 'center', margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>
                      サマーコインが足りません！(必要: 500枚)
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
                marginTop: '24px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(253, 224, 71, 0.2))', 
                borderRadius: '24px', 
                border: '2px solid #38bdf8',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <h4 style={{ color: '#fff', textAlign: 'center', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  🏝️ ビーチ両替所
                </h4>
                <p style={{ color: '#e2e8f0', textAlign: 'center', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
                  Yポイントをサマーコインに両替します。<br />
                  <span style={{ color: '#fde047', fontWeight: 'bold' }}>10,000 YP → 3枚</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button onClick={() => { const res = convertYPointsToSummerMedals(10000); if(res.message) alert(res.message); }} style={{ background: '#0c4a6e', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>1万 (3枚)</button>
                  <button onClick={() => { const res = convertYPointsToSummerMedals(100000); if(res.message) alert(res.message); }} style={{ background: '#0c4a6e', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>10万 (30枚)</button>
                  <button onClick={() => { const res = convertYPointsToSummerMedals(1000000); if(res.message) alert(res.message); }} style={{ background: '#0c4a6e', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>100万 (300枚)</button>
                  <button onClick={() => { const res = convertYPointsToSummerMedals(10000000); if(res.message) alert(res.message); }} style={{ background: '#0c4a6e', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>1000万 (3000枚)</button>
                  <button onClick={() => { const res = convertYPointsToSummerMedals(100000000); if(res.message) alert(res.message); }} style={{ background: '#0c4a6e', color: 'white', padding: '10px 4px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>1億 (3万枚)</button>
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
