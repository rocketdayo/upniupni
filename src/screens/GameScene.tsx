import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import { useGame } from '../store/GameContext';
import { STAGES } from '../data/stages';
import { CHARACTERS, getPublicUrl, createPuniSvgDataUrl, getTribeMultiplier, TRIBES } from '../data/characters';
import type { Character, SkillType } from '../data/characters';
import { CURRENT_EVENTS } from '../data/events';
import { Zap, Pause, Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import type { StageDropReward } from '../store/GameContext';
import { StageResultModal } from '../components/StageResultModal';
import { SkillParticleEffect } from '../components/SkillParticleEffect';

const PUNI_RADIUS      = 23;
const BIG_PUNI_MULT    = 1.5;
const FEVER_MAX        = 100;
const FEVER_DURATION   = 7000;

// Preload individual character images for ALL ranks
const CHAR_IMAGES: Record<string, HTMLImageElement> = {};
const OFFSCREEN_PUNI_CANVAS: Record<string, HTMLCanvasElement> = {};

const loadCharImage = (c: { id: string; name: string; rank: string; color: string; imageUrl?: string }, customSrc?: string) => {
  const img = new Image();
  const fallbackSrc = createPuniSvgDataUrl(c.name, c.color, c.rank);

  img.onload = () => {
    Object.keys(OFFSCREEN_PUNI_CANVAS).forEach(k => {
      if (k.startsWith(c.id + '_')) delete OFFSCREEN_PUNI_CANVAS[k];
    });
  };

  img.onerror = () => {
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
  };

  if (customSrc) {
    img.src = customSrc;
  } else if (c.imageUrl) {
    img.src = getPublicUrl(c.imageUrl);
  } else {
    img.src = fallbackSrc;
  }

  CHAR_IMAGES[c.id] = img;
  return img;
};

// Offscreen pre-rendered canvas cache helper for maximum rendering speed on mobile GPUs
const getOrCreateOffscreenPuniCanvas = (cd: Character, radius: number): HTMLCanvasElement => {
  const roundedR = Math.round(radius);
  const cacheKey = `${cd.id}_${roundedR}`;
  if (OFFSCREEN_PUNI_CANVAS[cacheKey]) return OFFSCREEN_PUNI_CANVAS[cacheKey];

  const size = Math.ceil(roundedR * 2);
  const cvs = document.createElement('canvas');
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext('2d');
  if (!ctx) return cvs;

  const r = roundedR;
  const x = r;
  const y = r;

  const img = CHAR_IMAGES[cd.id];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = cd.color;
    ctx.fill();
    ctx.drawImage(img, 0, 0, size, size);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = cd.color;
    ctx.fill();

    // Glass highlight
    ctx.beginPath();
    ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.35, r * 0.18, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.1, r * 0.11, r * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(x + r * 0.28, y - r * 0.1, r * 0.11, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#111122';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(x, y + r * 0.1, r * 0.18, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.strokeStyle = '#221133';
    ctx.stroke();

    if (cd.emoji) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(10, r * 0.45)}px sans-serif`;
      ctx.fillText(cd.emoji, x, y - r * 0.35);
    }
  }

  // Outer rank border ring
  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0, Math.PI * 2);
  if (cd.rank === 'Z') {
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
  } else if (cd.rank === 'SSS') {
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
  } else if (cd.rank === 'SS') {
    ctx.strokeStyle = '#e500ff';
    ctx.lineWidth = 2.5;
  } else if (cd.rank === 'S') {
    ctx.strokeStyle = '#ff33aa';
    ctx.lineWidth = 2.5;
  } else if (cd.rank === 'A') {
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
  } else if (cd.rank === 'B') {
    ctx.strokeStyle = '#33ccff';
    ctx.lineWidth = 2;
  } else if (cd.rank === 'C') {
    ctx.strokeStyle = '#a333ff';
    ctx.lineWidth = 2;
  } else if (cd.rank === 'D') {
    ctx.strokeStyle = '#55aa55';
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
  }
  ctx.stroke();

  OFFSCREEN_PUNI_CANVAS[cacheKey] = cvs;
  return cvs;
};

// Initial preload
CHARACTERS.forEach(c => {
  loadCharImage(c);
});

// Format HP with clean units and exact sub-digits for small screen support
const formatHpDisplay = (curr: number, max: number) => {
  const c = Math.max(0, Math.ceil(curr));
  const m = Math.ceil(max);
  const pct = max > 0 ? ((c / m) * 100).toFixed(m >= 100000000 ? 2 : 1) : '0';

  if (m >= 1000000000000) { // 1兆以上
    const cho = Math.floor(c / 1000000000000);
    const okuRem = Math.floor((c % 1000000000000) / 100000000);
    const mCho = Math.floor(m / 1000000000000);

    let mainText = '';
    if (cho > 0) {
      mainText = `${cho}兆${okuRem > 0 ? okuRem + '億' : ''}`;
    } else if (okuRem > 0) {
      mainText = `${okuRem}億`;
    } else {
      mainText = `${c.toLocaleString()}`;
    }
    if (c === 0) mainText = '0';

    return {
      main: `${mainText} / ${mCho}兆`,
      sub: `${c.toLocaleString()} (${pct}%)`,
      pct: pct
    };
  } else if (m >= 100000000) { // 1億以上
    const oku = Math.floor(c / 100000000);
    const manRem = Math.floor((c % 100000000) / 10000);
    const mOku = Math.floor(m / 100000000);

    let mainText = '';
    if (oku > 0) {
      mainText = `${oku}億${manRem > 0 ? manRem + '万' : ''}`;
    } else if (manRem > 0) {
      mainText = `${manRem}万`;
    } else {
      mainText = `${c}`;
    }
    if (c === 0) mainText = '0';

    return {
      main: `${mainText} / ${mOku}億`,
      sub: `${c.toLocaleString()} (${pct}%)`,
      pct: pct
    };
  } else if (m >= 10000) { // 1万以上
    const man = Math.floor(c / 10000);
    const remainder = c % 10000;
    const mMan = Math.floor(m / 10000);

    let mainText = '';
    if (man > 0) {
      mainText = `${man}万${remainder > 0 ? remainder : ''}`;
    } else {
      mainText = `${remainder}`;
    }

    return {
      main: `${mainText} / ${mMan}万`,
      sub: `${c.toLocaleString()} (${pct}%)`,
      pct: pct
    };
  }

  return {
    main: `${c.toLocaleString()} / ${m.toLocaleString()}`,
    sub: `(${pct}%)`,
    pct: pct
  };
};

interface PuniData { charId: string; size: number; level: number; }

const GameScene = () => {
  const { stageId } = useParams();
  const navigate    = useNavigate();
  const { team, characters, clearStage, trackMission, submitScoreAttackScore } = useGame();

  useEffect(() => {
    CHARACTERS.forEach(c => {
      loadCharImage(c);
    });
  }, []);

  // Helper to get individual character's event boost multiplier
  const getCharBoostMultiplier = (c?: Character): number => {
    if (!c || !c.eventBoost) return 1;
    if (c.rank === 'Z') return 30; // Zキャラ特攻30倍
    if (c.rank === 'SSS') return 10; // SSSキャラ特攻10倍
    if (c.rank === 'SS') return CURRENT_EVENTS[0]?.boostMultiplier ?? 3; // SS特攻3倍
    return 2;
  };

  // チーム内の同じ種族の数を集計
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

  // 各キャラの種族倍率を取得するヘルパー (1体:1倍, 2体:2倍, 3体:3倍, 4体:4倍, 5体:5倍)
  const getCharTribeMultiplier = useCallback((c?: Character): number => {
    if (!c) return 1;
    const count = tribeCounts[c.tribe] || 1;
    return getTribeMultiplier(count);
  }, [tribeCounts]);

  // チーム全体の合計攻撃力（パーティ全員の攻撃力の和）
  const totalTeamAtk = useMemo(() => {
    const rawAtk = team.reduce((sum, charId) => {
      const cd = CHARACTERS.find(c => c.id === charId);
      if (!cd) return sum;
      const charData = characters[charId];
      const level = charData?.level || 1;
      return sum + (cd.baseAtk + level * 5);
    }, 0);
    // 単推し（メンバー数が5人未満）の救済・反映：5人分の強さにスケーリングする
    if (team.length > 0 && team.length < 5) {
      return Math.floor(rawAtk * (5 / team.length));
    }
    return rawAtk;
  }, [team, characters]);

  const stage = STAGES.find(s => s.id === stageId);

  const sceneRef     = useRef<HTMLDivElement>(null);
  const engineRef    = useRef<Matter.Engine | null>(null);
  const renderRef    = useRef<Matter.Render | null>(null);
  const runnerRef    = useRef<Matter.Runner | null>(null);

  const bowlCenterRef = useRef<{ x: number; y: number }>({ x: 200, y: 200 });
  const bowlRadiusRef = useRef<number>(180);
  const spawnPuniRef  = useRef<() => void>(() => {});

  const [enemyHp,     setEnemyHp]     = useState(stage?.enemyHp || 100);
  const [playerHp,    setPlayerHp]    = useState(1);
  const [maxPlayerHp, setMaxPlayerHp] = useState(1);
  const [isGameOver,  setIsGameOver]  = useState(false);
  const [isVictory,   setIsVictory]   = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const isPausedRef   = useRef(false);
  isPausedRef.current = isPaused;

  // Score Attack states
  const isScoreAttack = stageId === 'score_attack';
  const [scoreAttackTimeLeft, setScoreAttackTimeLeft] = useState(60);
  const [isSaFinished, setIsSaFinished] = useState(false);
  const [saResult, setSaResult] = useState<{ isNewHighScore: boolean; previousHighScore: number } | null>(null);

  const [damageTexts, setDamageTexts] = useState<{ id: number; val: number; x: number; y: number; color: string; isFeverFinish?: boolean }[]>([]);
  const [feverFinishEffect, setFeverFinishEffect] = useState<{ active: boolean; dmg: number } | null>(null);

  const [score, setScore]           = useState(0);
  const [feverCount, setFeverCount] = useState(0);
  const [dropResult, setDropResult] = useState<StageDropReward | undefined>(undefined);

  const [feverGauge, setFeverGauge] = useState(0);
  const [isFever,    setIsFever]    = useState(false);
  const [feverTimeLeft, setFeverTimeLeft] = useState(0);
  const feverDmgAccum = useRef(0);
  const [charGauges,  setCharGauges]  = useState<Record<string, number>>({});

  const [skillCutIn, setSkillCutIn] = useState<{
    character: Character;
    skillName: string;
    skillType: SkillType;
  } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSkillShaking, setIsSkillShaking] = useState(false);

  // ---------- Lightweight / Low Performance Mode for smooth smartphone play ----------
  const [isLowPerfMode, setIsLowPerfMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('puni_low_perf_mode');
    if (saved !== null) return saved === 'true';
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
  });
  const isLowPerfModeRef = useRef(isLowPerfMode);
  isLowPerfModeRef.current = isLowPerfMode;

  const toggleLowPerfMode = () => {
    setIsLowPerfMode(prev => {
      const next = !prev;
      localStorage.setItem('puni_low_perf_mode', String(next));
      return next;
    });
  };

  const selectedRef   = useRef<Matter.Body[]>([]);
  const isDragging    = useRef(false);
  const clearedRef     = useRef(false);
  const clearTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clearedRef.current = false;
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, [stageId]);

  // Restart function
  const restartStage = () => {
    if (!stage) return;
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    clearedRef.current = false;
    setEnemyHp(stage.enemyHp);
    setPlayerHp(maxPlayerHp);
    setIsGameOver(false);
    setIsVictory(false);
    setFeverGauge(0);
    setIsFever(false);
    setFeverTimeLeft(0);
    setScore(0);
    setFeverCount(0);
    setDropResult(undefined);
    setScoreAttackTimeLeft(60);
    setIsSaFinished(false);
    setSaResult(null);
    const g: Record<string, number> = {};
    team.forEach(id => { g[id] = 0; });
    setCharGauges(g);
    setIsPaused(false);
  };

  // Pause / Resume physics runner
  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.enabled = !isPaused && !isGameOver && !isVictory && !isSaFinished;
    }
  }, [isPaused, isGameOver, isVictory, isSaFinished]);

  // ---------- init player HP ----------
  useEffect(() => {
    if (!team.length) return;
    let hp = 0;
    const g: Record<string, number> = {};
    team.forEach(id => {
      const c = CHARACTERS.find(x => x.id === id);
      if (!c) return;
      hp += c.baseHp + (characters[id]?.level || 1) * 10;
      g[id] = 0;
    });
    // 単推し（メンバー数5人未満）の救済スケーリング
    if (team.length < 5) {
      hp = Math.floor(hp * (5 / team.length));
    }
    setPlayerHp(hp);
    setMaxPlayerHp(hp);
    setCharGauges(g);
  }, [team, characters]);

  // ---------- enemy attack timer ----------
  useEffect(() => {
    if (!stage || isGameOver || isVictory || isFever || isPaused || enemyHp <= 0 || isSaFinished || skillCutIn) return;
    const iv = setInterval(() => {
      setPlayerHp(prev => {
        const next = Math.max(0, prev - stage.enemyAtk);
        if (next === 0) {
          if (isScoreAttack) {
            setIsSaFinished(true);
          } else {
            setIsGameOver(true);
          }
        }
        const id = Date.now() + Math.random();
        setDamageTexts(t => [...t, { id, val: stage.enemyAtk, x: 60, y: 40, color: '#ff4444' }]);
        setTimeout(() => setDamageTexts(t => t.filter(x => x.id !== id)), 900);
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [stage, isGameOver, isVictory, isFever, isPaused, enemyHp, isSaFinished, isScoreAttack, skillCutIn]);

  // ---------- damage / win ----------
  const dealDamage = useCallback((dmg: number) => {
    setEnemyHp(prev => Math.max(0, prev - dmg));
    setScore(s => s + Math.floor(dmg * 10));
  }, []);

  const isFeverRef = useRef(isFever);
  useEffect(() => {
    isFeverRef.current = isFever;
  }, [isFever]);

  // フィーバー蓄積ダメージを即座に精算（全解放してスコア＆ダメージに加算＋敵にド派手な被弾演出）
  const flushFeverDamage = useCallback(() => {
    if (feverDmgAccum.current > 0) {
      const accumDmg = feverDmgAccum.current;
      feverDmgAccum.current = 0;
      dealDamage(accumDmg);

      // 敵の被弾＆フィーバーフィニッシュ演出フラグをON（1.5秒間）
      setFeverFinishEffect({ active: true, dmg: accumDmg });
      setTimeout(() => setFeverFinishEffect(null), 1500);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: accumDmg, x: 100, y: 70, color: '#ff22aa', isFeverFinish: true }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 2000);
    }
  }, [dealDamage]);

  // ---------- ダメージ適用（フィーバー中は蓄積、通常時は即時ダメージ） ----------
  const applyDamage = useCallback((dmg: number) => {
    if (isFeverRef.current) {
      feverDmgAccum.current += dmg;
    } else {
      dealDamage(dmg);
    }
  }, [dealDamage]);

  // ---------- Score Attack Timer Countdown (必殺技カットイン中はカウント停止) ----------
  useEffect(() => {
    if (!isScoreAttack || isSaFinished || isPaused || isGameOver || isVictory || skillCutIn) return;
    const iv = setInterval(() => {
      setScoreAttackTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          setIsSaFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isScoreAttack, isSaFinished, isPaused, isGameOver, isVictory, skillCutIn]);

  // ---------- スコアタ終了・決着時にフィーバー中の溜まりダメージを全額精算・スコア加算 ----------
  useEffect(() => {
    if (isSaFinished || isVictory || isGameOver) {
      flushFeverDamage();
    }
  }, [isSaFinished, isVictory, isGameOver, flushFeverDamage]);

  // ---------- Score Attack Submission ----------
  useEffect(() => {
    if (isSaFinished && !saResult) {
      const res = submitScoreAttackScore(score);
      setSaResult(res);
    }
  }, [isSaFinished, saResult, score, submitScoreAttackScore]);

  // ---------- victory check ----------
  useEffect(() => {
    if (enemyHp <= 0 && !clearedRef.current && stage) {
      clearedRef.current = true;
      const sId = stage.id;
      const rMoney = stage.rewardMoney;
      const rYpt = stage.rewardYPoints;
      const drops = clearStage(sId, rMoney, rYpt);
      setDropResult(drops);

      // 演出（必殺技カットイン、パーティクル、ダメージ数値、HPバー減少）をプレイヤーがしっかり楽しんでから勝利画面を表示！
      setTimeout(() => {
        setIsVictory(true);
      }, 1200);
    }
  }, [enemyHp, stage, clearStage]);

  // ---------- fever start ----------
  useEffect(() => {
    if (feverGauge >= FEVER_MAX && !isFever) {
      setIsFever(true);
      setFeverTimeLeft(FEVER_DURATION);
      setFeverCount(c => c + 1);
      feverDmgAccum.current = 0;
      trackMission('fever_enter', 1);
    }
  }, [feverGauge, isFever, trackMission]);

  // ---------- fever timer countdown (必殺技カットイン中はタイマー停止) ----------
  useEffect(() => {
    if (!isFever || isPaused || isGameOver || isVictory || skillCutIn) return;
    const iv = setInterval(() => {
      setFeverTimeLeft(prev => {
        const next = prev - 100;
        if (next <= 0) {
          setIsFever(false);
          setFeverGauge(0);
          flushFeverDamage();
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [isFever, isPaused, isGameOver, isVictory, skillCutIn, flushFeverDamage]);

  const executeSkillEffect = (cd: Character) => {
    if (!cd.skill) return;
    const charData = characters[cd.id];
    const skillLv = Math.max(1, (charData as any)?.skillLevel || 1);
    const baseAtk = totalTeamAtk;
    const charBoost = getCharBoostMultiplier(cd);
    const charTribeMult = getCharTribeMultiplier(cd);
    const totalBoost = charBoost * charTribeMult;

    const engine = engineRef.current;

    if (cd.skill.type === 'heal') {
      const healAmount = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.35));
      setPlayerHp(prev => Math.min(maxPlayerHp, prev + healAmount));
      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: healAmount, x: 150, y: 150, color: '#00ff88' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
      return;
    }

    if (cd.skill.type === 'damage' || !engine) {
      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * totalBoost);
      applyDamage(dmg);
      const id = Date.now() + Math.random();
      let textDmgColor = '#ffff00';
      if (cd.rank === 'Z') textDmgColor = '#00ffff';
      else if (cd.rank === 'SSS') textDmgColor = '#ffd700';
      else if (cd.rank === 'SS') textDmgColor = '#ff22ff';
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 120, color: textDmgColor }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
      return;
    }

    const allPuniBodies = Matter.Composite.allBodies(engine.world).filter(b => !b.isStatic);

    if (cd.skill.type === 'center_pop') {
      const radiusRatio = Math.min(0.75, 0.45 + skillLv * 0.04);
      const centerBodies = allPuniBodies.filter(b => {
        const dx = b.position.x - bowlCenterRef.current.x;
        const dy = b.position.y - bowlCenterRef.current.y;
        return Math.sqrt(dx * dx + dy * dy) < bowlRadiusRef.current * radiusRatio;
      });
      const popCount = Math.max(5, centerBodies.length);
      centerBodies.forEach(b => Matter.Composite.remove(engine.world, b));

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.25));
      const dmg = Math.floor(baseAtk * power * (popCount * 0.2 + 1) * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: bowlCenterRef.current.x, y: bowlCenterRef.current.y, color: '#ff3366' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);

      setFeverGauge(prev => Math.min(FEVER_MAX, prev + popCount * 2.5));

      for (let i = 0; i < popCount; i++) {
        setTimeout(() => spawnPuniRef.current(), i * 40);
      }
    } else if (cd.skill.type === 'random_pop') {
      const targetCount = Math.min(allPuniBodies.length, 8 + skillLv * 2);
      const shuffled = [...allPuniBodies].sort(() => Math.random() - 0.5);
      const popped = shuffled.slice(0, targetCount);
      popped.forEach(b => Matter.Composite.remove(engine.world, b));

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.25));
      const dmg = Math.floor(baseAtk * power * (popped.length * 0.2 + 1) * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 180, color: '#00ccff' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);

      setFeverGauge(prev => Math.min(FEVER_MAX, prev + popped.length * 2.2));

      for (let i = 0; i < popped.length; i++) {
        setTimeout(() => spawnPuniRef.current(), i * 35);
      }
    } else if (cd.skill.type === 'all_pop') {
      const popCount = allPuniBodies.length;
      allPuniBodies.forEach(b => Matter.Composite.remove(engine.world, b));

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * (popCount * 0.28 + 1.5) * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 160, color: '#ff0055' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1800);

      setFeverGauge(prev => Math.min(FEVER_MAX, prev + 35));

      for (let i = 0; i < Math.max(15, popCount); i++) {
        setTimeout(() => spawnPuniRef.current(), i * 30);
      }
    } else if (cd.skill.type === 'inflate_puni') {
      const targetCount = Math.min(allPuniBodies.length, Math.min(5, 1 + Math.floor((skillLv + 1) / 2)));
      const sizeBonus = 3 + Math.floor(skillLv * 0.8);
      const scaleFactor = 1.4 + skillLv * 0.15;

      const shuffled = [...allPuniBodies].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, targetCount);
      targets.forEach(b => {
        const pd = (b as any).puniData as PuniData;
        if (pd) {
          pd.size += sizeBonus;
          b.circleRadius = (b.circleRadius || PUNI_RADIUS) * scaleFactor;
          Matter.Body.scale(b, scaleFactor, scaleFactor);
        }
      });

      const dmg = Math.floor(baseAtk * cd.skill.power * (targetCount * 0.3 + 1) * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 180, color: '#ffff00' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
    } else if (cd.skill.type === 'fever_charge') {
      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * totalBoost);
      applyDamage(dmg);

      setFeverGauge(FEVER_MAX);
      if (isFeverRef.current) {
        setFeverTimeLeft(FEVER_DURATION); // フィーバー中なら残り時間を10秒に即時全回復！
      }

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 150, color: '#ff8800' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
    } else if (cd.skill.type === 'puni_unify') {
      allPuniBodies.forEach(b => {
        const pd = (b as any).puniData as PuniData;
        if (pd) {
          pd.charId = cd.id;
          b.render.fillStyle = cd.color;
        }
      });

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 150, color: '#00ffff' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
    } else if (cd.skill.type === 'team_gauge_fill') {
      setCharGauges(prev => {
        const next = { ...prev };
        team.forEach(id => {
          next[id] = Math.min(100, (next[id] || 0) + 50);
        });
        return next;
      });

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 150, color: '#a855f7' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
    } else if (cd.skill.type === 'god_burst') {
      const popCount = allPuniBodies.length;
      allPuniBodies.forEach(b => Matter.Composite.remove(engine.world, b));

      const healAmount = Math.round(50000 * (1 + (skillLv - 1) * 0.3));
      setPlayerHp(prev => Math.min(maxPlayerHp, prev + healAmount));

      setFeverGauge(FEVER_MAX);
      if (isFeverRef.current) {
        setFeverTimeLeft(FEVER_DURATION); // フィーバー中なら残り時間を10秒に即時全回復！
      }

      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.35));
      const dmg = Math.floor(baseAtk * power * (popCount * 0.3 + 2.0) * totalBoost);
      applyDamage(dmg);

      const id = Date.now() + Math.random();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 130, color: '#ffd700' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1800);

      for (let i = 0; i < Math.max(15, popCount); i++) {
        setTimeout(() => spawnPuniRef.current(), i * 30);
      }
    }
  };

  const triggerSkill = (charId: string) => {
    if ((charGauges[charId] || 0) < 100 || isGameOver || isVictory || isPaused || skillCutIn) return;
    const cd = CHARACTERS.find(c => c.id === charId);
    if (!cd || !cd.skill) return;

    trackMission('use_skill', 1);

    setCharGauges(prev => ({ ...prev, [charId]: 0 }));

    setSkillCutIn({
      character: cd,
      skillName: cd.skill.name,
      skillType: cd.skill.type,
    });

    // 必殺技発動時に画面全体を大きく震わせる！
    setIsSkillShaking(true);

    setTimeout(() => {
      setIsShaking(true);
      executeSkillEffect(cd);
    }, 350);

    setTimeout(() => {
      setIsShaking(false);
    }, 850);

    setTimeout(() => {
      setIsSkillShaking(false);
      setSkillCutIn(null);
    }, 1200);
  };

  // ---------- Matter.js — built from actual container size ----------
  useEffect(() => {
    if (!stage || !team.length || isGameOver || isVictory || !sceneRef.current) return;

    const container = sceneRef.current;

    const buildScene = (W: number, H: number) => {
      // Tear down previous instance if it exists
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (renderRef.current.canvas) renderRef.current.canvas.remove();
      }
      if (runnerRef.current && engineRef.current) {
        Matter.Runner.stop(runnerRef.current);
        Matter.Engine.clear(engineRef.current);
      }

      const lowPerf = isLowPerfModeRef.current;
      const { Engine, Render, Runner, Bodies, Composite, Events, Vector } = Matter;

      const engine = Engine.create();
      engineRef.current    = engine;
      engine.world.gravity.y = 2.2; // Fast, smooth drop physics
      engine.positionIterations = lowPerf ? 3 : 6;
      engine.velocityIterations = lowPerf ? 2 : 4;
      engine.constraintIterations = lowPerf ? 1 : 2;

      const render = Render.create({
        element: container,
        engine,
        options: { width: W, height: H, wireframes: false, background: 'transparent' },
      });
      renderRef.current = render;

      // Canvas fills container exactly
      const cvs = render.canvas;
      cvs.style.position   = 'absolute';
      cvs.style.top        = '0';
      cvs.style.left       = '0';
      cvs.style.width      = '100%';
      cvs.style.height     = '100%';
      cvs.style.touchAction= 'none';

      // Bowl geometry: Fill almost full width of scene like original game
      const bowlRadius  = Math.min((W / 2) - 6, (H / 2) - 10);
      const bowlCX      = W / 2;
      const bowlCY      = bowlRadius + 12;

      bowlCenterRef.current = { x: bowlCX, y: bowlCY };
      bowlRadiusRef.current = bowlRadius;

      // Build bowl from arc segments
      const walls: Matter.Body[] = [];
      const SEG = lowPerf ? 32 : 48;
      const WALL_THICKNESS = 28;
      for (let i = 0; i < SEG; i++) {
        const a0 = (i / SEG) * Math.PI;
        const a1 = ((i + 1) / SEG) * Math.PI;
        const x0 = bowlCX + Math.cos(a0) * bowlRadius;
        const y0 = bowlCY + Math.sin(a0) * bowlRadius;
        const x1 = bowlCX + Math.cos(a1) * bowlRadius;
        const y1 = bowlCY + Math.sin(a1) * bowlRadius;
        const cx  = (x0 + x1) / 2;
        const cy  = (y0 + y1) / 2;
        const len = Math.hypot(x1 - x0, y1 - y0) + WALL_THICKNESS;
        const ang = Math.atan2(y1 - y0, x1 - x0);
        walls.push(Bodies.rectangle(cx, cy, len, WALL_THICKNESS, {
          isStatic: true, angle: ang, friction: 0.3,
          restitution: 0.4,
          render: { visible: false },
        }));
      }

      // Solid floor at the very bottom of the bowl
      walls.push(Bodies.rectangle(bowlCX, bowlCY + bowlRadius - 4, bowlRadius * 2, 20, {
        isStatic: true, render: { visible: false },
      }));

      // Left & right vertical walls
      const sideWallH = H * 2;
      walls.push(Bodies.rectangle(bowlCX - bowlRadius - 10, bowlCY - sideWallH / 2, 24, sideWallH, { isStatic: true, render: { visible: false } }));
      walls.push(Bodies.rectangle(bowlCX + bowlRadius + 10, bowlCY - sideWallH / 2, 24, sideWallH, { isStatic: true, render: { visible: false } }));

      // Invisible ceiling
      walls.push(Bodies.rectangle(bowlCX, -60, W * 2, 40, { isStatic: true, render: { visible: false } }));

      Composite.add(engine.world, walls);

      // Spawn punis
      const spawnPuni = () => {
        const charId  = team[Math.floor(Math.random() * team.length)];
        const cd      = CHARACTERS.find(c => c.id === charId);
        if (!cd) return;
        const lv = characters[charId]?.level || 1;
        const x  = bowlCX + (Math.random() * bowlRadius - bowlRadius / 2) * 0.65;
        const p  = Bodies.circle(x, bowlCY - bowlRadius + 15, PUNI_RADIUS, {
          restitution: 0.7, friction: 0.05, density: 0.0012,
          render: { fillStyle: cd.color, strokeStyle: '#ffffff', lineWidth: 2 },
        });
        (p as any).puniData = { charId, size: 1, level: lv } as PuniData;
        Composite.add(engine.world, p);
      };
      spawnPuniRef.current = spawnPuni;

      const initPunis = lowPerf ? 28 : 42;
      const maxPunis  = lowPerf ? 32 : 46;

      for (let i = 0; i < initPunis; i++) setTimeout(spawnPuni, i * (lowPerf ? 25 : 40));
      const spawnIv = setInterval(() => {
        if (!isPausedRef.current && Composite.allBodies(engine.world).filter(b => !b.isStatic).length < maxPunis) {
          spawnPuni();
        }
      }, lowPerf ? 300 : 200);

      // Coordinate scale
      const getPos = (e: PointerEvent) => {
        const rect   = cvs.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      };

      const getPuniAt = (pos: { x: number; y: number }) => {
        for (const b of Composite.allBodies(engine.world).filter(b => !b.isStatic)) {
          if (Vector.magnitude(Vector.sub(b.position, pos)) <= (b.circleRadius ?? 0)) return b;
        }
        return null;
      };

      const mergePunis = (list: Matter.Body[]) => {
        const fd      = (list[0] as any).puniData as PuniData;
        const total   = list.reduce((s, p) => s + ((p as any).puniData.size || 1), 0);
        const center  = list.reduce((s, p) => Vector.add(s, p.position), Vector.create(0, 0));
        const pos     = Vector.mult(center, 1 / list.length);
        Composite.remove(engine.world, list);
        const cd    = CHARACTERS.find(c => c.id === fd.charId)!;
        const newR  = PUNI_RADIUS * Math.pow(total, 0.4);
        const big   = Bodies.circle(pos.x, pos.y, newR, {
          restitution: 0.65, friction: 0.1, density: 0.002,
          render: { fillStyle: cd.color, strokeStyle: '#ffd700', lineWidth: 4 },
        });
        (big as any).puniData = { ...fd, size: total };
        Composite.add(engine.world, big);

        // ── 繋いだ長さ (total) に応じてフィーバーゲージ＆技ゲージを即座に加算！ ──
        if (total >= 2) {
          const feverAdd = Math.min(FEVER_MAX, Math.pow(total, 1.4) * 1.1);
          const gaugeAdd = Math.min(100, Math.floor(Math.pow(total, 1.45) * 1.0));

          setFeverGauge(prev => Math.min(FEVER_MAX, prev + feverAdd));
          setCharGauges(prev => ({
            ...prev,
            [fd.charId]: Math.min(100, (prev[fd.charId] || 0) + gaugeAdd)
          }));

          // フィーバー増加ポップアップ表示
          if (feverAdd >= 5) {
            const id = Date.now() + Math.random();
            setDamageTexts(t => [...t, { id, val: Math.floor(feverAdd), x: pos.x, y: pos.y - 20, color: '#00ffff' }]);
            setTimeout(() => setDamageTexts(t => t.filter(x => x.id !== id)), 800);
          }
        }
      };

      const popPuni = (puni: Matter.Body) => {
        const pd  = (puni as any).puniData as PuniData;
        const cd  = CHARACTERS.find(c => c.id === pd.charId)!;
        const charBoost = getCharBoostMultiplier(cd);
        const charTribeMult = getCharTribeMultiplier(cd);
        const dmg = Math.floor(totalTeamAtk * Math.pow(pd.size, BIG_PUNI_MULT) * charBoost * charTribeMult);

        // 消した時もぷにのサイズ（長かった連結ぷに）に応じてさらにボーナス加算
        let feverAdd = 0;
        let gaugeAdd = 0;
        if (pd.size >= 10) {
          trackMission('big_puni', 1);
        }

        if (pd.size <= 1) {
          feverAdd = 0;   // 単発消しではフィーバーは増えない
          gaugeAdd = 0.2; // 単発消しでは技ゲージもほとんど増えない
        } else {
          feverAdd = Math.min(FEVER_MAX, Math.pow(pd.size, 1.2) * 0.8);
          gaugeAdd = Math.min(100, Math.floor(Math.pow(pd.size, 1.4) * 1.2));
        }

        setFeverGauge(prev => Math.min(FEVER_MAX, prev + feverAdd));
        setCharGauges(prev => ({
          ...prev,
          [pd.charId]: Math.min(100, (prev[pd.charId] || 0) + gaugeAdd)
        }));

        applyDamage(dmg);

        const id = Date.now() + Math.random();
        setDamageTexts(t => [...t, { id, val: dmg, x: puni.position.x, y: puni.position.y, color: '#ff3333' }]);
        setTimeout(() => setDamageTexts(t => t.filter(x => x.id !== id)), 900);
        Composite.remove(engine.world, puni);

        // Immediately spawn replacement punis to keep the board full & falling
        const numToSpawn = Math.max(1, Math.min(5, Math.floor(pd.size)));
        for (let i = 0; i < numToSpawn; i++) {
          setTimeout(spawnPuni, i * 35);
        }
      };

      const handleDown = (e: PointerEvent) => {
        if (isPausedRef.current) return;
        const b = getPuniAt(getPos(e));
        if (b) { isDragging.current = true; selectedRef.current = [b]; b.render.lineWidth = 5; }
      };

      let lastMoveX = 0;
      let lastMoveY = 0;
      const handleMove = (e: PointerEvent) => {
        if (isPausedRef.current || !isDragging.current) return;
        const pos = getPos(e);

        if (isLowPerfModeRef.current) {
          const dx = pos.x - lastMoveX;
          const dy = pos.y - lastMoveY;
          if (dx * dx + dy * dy < 16) return;
        }
        lastMoveX = pos.x;
        lastMoveY = pos.y;

        const b = getPuniAt(pos);
        if (b && !selectedRef.current.includes(b)) {
          const first = selectedRef.current[0];
          const last  = selectedRef.current[selectedRef.current.length - 1];
          const fd    = (first as any).puniData as PuniData;
          const hd    = (b as any).puniData    as PuniData;
          if (fd.charId === hd.charId) {
            const maxD = last.circleRadius! + b.circleRadius! + PUNI_RADIUS * 2.5;
            if (Vector.magnitude(Vector.sub(b.position, last.position)) < maxD) {
              selectedRef.current.push(b);
              b.render.lineWidth = 5;
            }
          }
        }
      };
      const handleUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (isPausedRef.current) {
          selectedRef.current = [];
          return;
        }
        const sel = selectedRef.current;
        if (sel.length > 1)       mergePunis(sel);
        else if (sel.length === 1) popPuni(sel[0]);
        sel.forEach(b => { if (b.render) b.render.lineWidth = 2; });
        selectedRef.current = [];
      };

      cvs.addEventListener('pointerdown',  handleDown);
      cvs.addEventListener('pointermove',  handleMove);
      cvs.addEventListener('pointerup',    handleUp);
      cvs.addEventListener('pointerleave', handleUp);

      Events.on(render, 'afterRender', () => {
        const ctx = render.context;
        const isLowPerf = isLowPerfModeRef.current;
        
        // Draw Circular Gear Board Background
        ctx.save();
        ctx.beginPath();
        ctx.arc(bowlCX, bowlCY, bowlRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b132b';
        ctx.fill();

        if (!isLowPerf) {
          const bgGrad = ctx.createRadialGradient(bowlCX, bowlCY, bowlRadius * 0.2, bowlCX, bowlCY, bowlRadius);
          bgGrad.addColorStop(0, 'rgba(30, 55, 110, 0.25)');
          bgGrad.addColorStop(1, 'rgba(5, 12, 30, 0.88)');
          ctx.fillStyle = bgGrad;
          ctx.fill();
        }

        // Main Gold Gear Ring
        ctx.beginPath();
        ctx.arc(bowlCX, bowlCY, bowlRadius, 0, Math.PI * 2);
        ctx.lineWidth   = isLowPerf ? 6 : 10;
        ctx.strokeStyle = '#f5b000';
        ctx.stroke();

        if (!isLowPerf) {
          // Outer Red Rim
          ctx.beginPath();
          ctx.arc(bowlCX, bowlCY, bowlRadius + 6, 0, Math.PI * 2);
          ctx.lineWidth   = 3;
          ctx.strokeStyle = '#e63946';
          ctx.stroke();

          // Inner Yellow Rim
          ctx.beginPath();
          ctx.arc(bowlCX, bowlCY, bowlRadius - 5, 0, Math.PI * 2);
          ctx.lineWidth   = 2;
          ctx.strokeStyle = '#ffea00';
          ctx.stroke();
        }
        ctx.restore();

        // Draw puni sprites
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        for (const b of Composite.allBodies(engine.world).filter(b => !b.isStatic)) {
          const pd = (b as any).puniData as PuniData;
          if (!pd) continue;
          const cd = CHARACTERS.find(c => c.id === pd.charId);
          if (!cd) continue;
          const r = b.circleRadius ?? PUNI_RADIUS;
          const { x, y } = b.position;

          if (isLowPerf) {
            // Ultra-fast pre-rendered offscreen canvas draw
            const offCvs = getOrCreateOffscreenPuniCanvas(cd, r);
            ctx.drawImage(offCvs, x - r, y - r, r * 2, r * 2);
          } else {
            const img = CHAR_IMAGES[cd.id];
            if (img?.complete && img.naturalWidth > 0) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.clip();
              ctx.fillStyle = cd.color;
              ctx.fill();
              ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
              ctx.restore();

              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              if (cd.rank === 'Z') {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 5;
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 12;
              } else if (cd.rank === 'SSS') {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10;
              } else if (cd.rank === 'SS') {
                ctx.strokeStyle = '#e500ff';
                ctx.lineWidth = 3;
              } else if (cd.rank === 'S') {
                ctx.strokeStyle = '#ff33aa';
                ctx.lineWidth = 3;
              } else if (cd.rank === 'A') {
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 2.5;
              } else if (cd.rank === 'B') {
                ctx.strokeStyle = '#33ccff';
                ctx.lineWidth = 2;
              } else if (cd.rank === 'C') {
                ctx.strokeStyle = '#a333ff';
                ctx.lineWidth = 2;
              } else if (cd.rank === 'D') {
                ctx.strokeStyle = '#55aa55';
                ctx.lineWidth = 2;
              } else {
                ctx.strokeStyle = '#88cc88';
                ctx.lineWidth = 2;
              }
              ctx.stroke();
              ctx.restore();
            } else {
              const offCvs = getOrCreateOffscreenPuniCanvas(cd, r);
              ctx.drawImage(offCvs, x - r, y - r, r * 2, r * 2);
            }
          }

          if (pd.size > 1) {
            ctx.font = `bold ${Math.max(14, r * 0.5)}px Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(pd.size.toString(), x, y);
            ctx.fillText(pd.size.toString(), x, y);
          }
        }

        // Connection lines
        if (isDragging.current && selectedRef.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(selectedRef.current[0].position.x, selectedRef.current[0].position.y);
          for (let i = 1; i < selectedRef.current.length; i++) {
            ctx.lineTo(selectedRef.current[i].position.x, selectedRef.current[i].position.y);
          }
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth   = 8;
          ctx.lineJoin    = 'round';
          ctx.lineCap     = 'round';
          ctx.stroke();
        }
      });

      Render.run(render);
      const runner = Runner.create();
      runnerRef.current = runner;
      Runner.run(runner, engine);

      return () => {
        clearInterval(spawnIv);
        cvs.removeEventListener('pointerdown',  handleDown);
        cvs.removeEventListener('pointermove',  handleMove);
        cvs.removeEventListener('pointerup',    handleUp);
        cvs.removeEventListener('pointerleave', handleUp);
        Render.stop(render);
        Runner.stop(runner);
        Engine.clear(engine);
        if (render.canvas) render.canvas.remove();
      };
    };

    let cleanup = buildScene(container.clientWidth || 400, container.clientHeight || 450);

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        cleanup?.();
        cleanup = buildScene(Math.floor(width), Math.floor(height));
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, team, characters, totalTeamAtk, isGameOver, isVictory, dealDamage]);

  if (!stage || !team.length) return null;

  return (
    <div className={`view-container ${isSkillShaking ? 'animate-skill-screen-shake' : isShaking ? 'animate-shake' : ''}`} style={{
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      background: isFever ? 'radial-gradient(circle,#4a1a4a,#1a001a)' : 'var(--bg-color)',
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Real-time Score & Timer HUD (Absolute Position to prevent shrinking puzzle area) ── */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '5px 12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.6rem', color: '#88a0c0', fontWeight: 900 }}>SCORE</span>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: '#00ffcc', fontFamily: 'monospace, sans-serif' }}>
            {score.toLocaleString()}
          </span>
        </div>
        {isScoreAttack && (
          <>
            <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.6rem', color: '#ff4466', fontWeight: 900 }}>⏱️</span>
              <span style={{
                fontSize: '1rem',
                fontWeight: 900,
                color: scoreAttackTimeLeft <= 10 ? '#ff3333' : '#ffd700',
                fontFamily: 'monospace, sans-serif',
              }}>
                {scoreAttackTimeLeft}s
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Enemy + HP bars ── */}
      <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
        {/* Pause Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setIsPaused(true)}
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            padding: '6px 10px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10
          }}
        >
          <Pause size={14} /> ポーズ
        </button>

        {/* Lightweight Mode Quick Toggle Button */}
        <button
          onClick={toggleLowPerfMode}
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            padding: '5px 10px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10,
            borderRadius: '12px',
            background: isLowPerfMode ? '#00cc88' : '#333344',
            color: '#ffffff',
            border: isLowPerfMode ? '1px solid #00ffaa' : '1px solid #666',
            fontWeight: 800,
            boxShadow: isLowPerfMode ? '0 0 10px rgba(0,255,136,0.5)' : 'none',
            cursor: 'pointer'
          }}
        >
          <Zap size={14} color={isLowPerfMode ? '#ffffff' : '#aaaaaa'} />
          {isLowPerfMode ? '軽量 ON' : '軽量 OFF'}
        </button>



        {/* ── Enemy Display with Fever Finish Animation ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* FEVER FINISH テキスト演出 */}
          {feverFinishEffect?.active && (
            <div style={{
              position: 'absolute',
              top: '-32px',
              zIndex: 50,
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#ffffff',
              textShadow: '0 0 10px #ff0077, 0 0 20px #ff00ff, 0 0 30px #ffff00',
              background: 'linear-gradient(90deg, #ff0055, #ffaa00)',
              padding: '2px 14px',
              borderRadius: '20px',
              border: '2px solid #ffffff',
              animation: 'feverFinishPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.8)'
            }}>
              💥 FEVER FINISH!! 💥
            </div>
          )}

          {/* 敵絵文字 */}
          <div style={{
            fontSize: '3.6rem',
            animation: feverFinishEffect?.active
              ? 'feverEnemyShake 0.8s ease-in-out infinite'
              : isFever ? 'none' : 'float 2s infinite',
            filter: feverFinishEffect?.active
              ? 'drop-shadow(0 0 30px #ff0055) drop-shadow(0 0 15px #ffff00) brightness(1.3)'
              : isFever ? 'drop-shadow(0 0 12px #f0f)' : 'none',
            lineHeight: 1
          }}>
            {stage.enemyEmoji}
          </div>
        </div>

        {/* ── 敵＆自分 HPメーター表示エリア (スマホ画幅レスポンシブ・桁切れ防止) ── */}
        <div style={{
          width: '92%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          marginTop: '4px'
        }}>
          {/* 敵HPゲージ */}
          <div style={{ width: '100%', height: 13, background: '#222', borderRadius: 7, overflow: 'hidden', border: '1.5px solid #666', boxShadow: '0 0 6px rgba(0,0,0,0.5)' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff3333,#ffaa00)', width: `${Math.min(100, Math.max(0, (enemyHp / stage.enemyHp) * 100))}%`, transition: 'width 0.25s' }} />
          </div>

          {/* 敵HP数値テキスト */}
          {(() => {
            const hpInfo = formatHpDisplay(enemyHp, stage.enemyHp);
            return (
              <div style={{
                fontSize: '0.82rem',
                color: '#ffc0c0',
                fontWeight: 'bold',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'monospace, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                lineHeight: 1.2
              }}>
                <div>
                  敵: <strong style={{ color: '#ffffff', fontSize: '0.9rem', letterSpacing: '0.5px' }}>{hpInfo.main}</strong>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#ffd0d0', opacity: 0.9 }}>
                  {hpInfo.sub}
                </div>
              </div>
            );
          })()}

          {/* 自分HPゲージ */}
          <div style={{ width: '100%', height: 9, background: '#222', borderRadius: 5, overflow: 'hidden', marginTop: '4px', border: '1px solid #444' }}>
            <div style={{ height: '100%', background: '#44ff44', width: `${Math.min(100, Math.max(0, (playerHp / maxPlayerHp) * 100))}%`, transition: 'width 0.25s' }} />
          </div>

          {/* 自分HP数値テキスト */}
          {(() => {
            const hpInfo = formatHpDisplay(playerHp, maxPlayerHp);
            return (
              <div style={{
                fontSize: '0.74rem',
                color: '#b0ffb0',
                fontWeight: 'bold',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'monospace, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span>自分: <strong style={{ color: '#ffffff' }}>{hpInfo.main}</strong></span>
                <span style={{ fontSize: '0.65rem', color: '#88ff88', opacity: 0.85 }}>{hpInfo.sub}</span>
              </div>
            );
          })()}

          {/* 種族シナジーボーナス表示 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            {Object.entries(tribeCounts).map(([tribeName, count]) => {
              const mult = getTribeMultiplier(count);
              const tribeObj = TRIBES.find(t => t.name === tribeName);
              if (!tribeObj) return null;
              return (
                <div key={tribeName} style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: `1px solid ${tribeObj.color}`,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 800,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}>
                  <span>{tribeObj.emoji} {tribeName}</span>
                  <span style={{ color: '#ffd700', fontWeight: 900 }}>{count}体 (攻{mult}倍)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Character skill icons ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '4px 10px', flexShrink: 0 }}>
        {team.map(charId => {
          const cd   = CHARACTERS.find(c => c.id === charId);
          if (!cd) return null;
          const hasSkill = !!cd.skill;
          const g    = charGauges[charId] || 0;
          const full = g >= 100;
          const tribeMult = getCharTribeMultiplier(cd);
          const tribeObj  = TRIBES.find(t => t.name === cd.tribe);

          return (
            <div key={charId} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 種族バッジ */}
              <div style={{
                fontSize: '0.6rem',
                background: tribeObj?.color || '#333',
                color: '#fff',
                padding: '1px 4px',
                borderRadius: '6px',
                marginBottom: '2px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <span>{tribeObj?.emoji}</span>
                <span style={{ color: '#ffff00' }}>×{tribeMult}</span>
              </div>

              <div
                className={`char-icon ${hasSkill && full ? 'animate-pulse' : ''}`}
                onClick={() => full && hasSkill ? triggerSkill(charId) : undefined}
                style={{
                  backgroundColor: 'transparent',
                  width: 50, height: 50,
                  border:    hasSkill && full ? `3px solid ${cd.rank === 'SS' ? '#ff22ff' : '#ffff00'}` : '2px solid #555',
                  borderRadius: '50%',
                  boxShadow: hasSkill && full ? `0 0 16px ${cd.rank === 'SS' ? '#ff22ff' : '#ffff00'}` : 'none',
                  cursor:    hasSkill && full ? 'pointer' : 'default',
                  opacity:   full ? 1 : 0.7,
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${g}%`, background: 'rgba(255,255,255,0.35)', zIndex: 2 }} />
                <CharacterAvatar character={cd} size={46} />
              </div>
              {hasSkill && full && (
                <div style={{ position: 'absolute', top: -8, right: -8, background: cd.rank === 'SS' ? '#ff22ff' : '#ffff00', color: '#000', borderRadius: '50%', padding: 2, zIndex: 5 }}>
                  <Zap size={14} />
                </div>
              )}
              {cd.eventBoost && (
                <div style={{ position: 'absolute', top: -5, left: -5, background: '#ff2255', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 900, border: '1px solid white', zIndex: 5 }}>特</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Fever bar ── */}
      <div style={{ padding: '2px 20px 4px', flexShrink: 0 }}>
        <div style={{ height: 7, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: isFever ? '#f0f' : '#0ff', width: isFever ? `${(feverTimeLeft / FEVER_DURATION) * 100}%` : `${feverGauge}%`, transition: isFever ? 'none' : 'width 0.2s' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: isFever ? '#f0f' : '#0ff', fontWeight: 'bold' }}>
          {isFever ? '🌟 FEVER TIME!! 🌟' : 'FEVER GAUGE'}
        </div>
      </div>

      {/* ── Physics canvas ── */}
      <div ref={sceneRef} style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {damageTexts.map(dt => (
          <div
            key={dt.id}
            className={dt.isFeverFinish ? 'fever-finish-damage-text' : 'damage-text'}
            style={{
              left: dt.x,
              top: dt.y,
              color: dt.isFeverFinish ? undefined : dt.color
            }}
          >
            {dt.isFeverFinish ? `🔥 +${dt.val.toLocaleString()}` : dt.val.toLocaleString()}
          </div>
        ))}

        {/* ── Skill Cut-In Overlay Animation ── */}
        {skillCutIn && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2000,
            pointerEvents: 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* 粒子・集中線・衝撃波パーティクルエフェクト */}
            <SkillParticleEffect character={skillCutIn.character} isLowPerfMode={isLowPerfMode} />

            {/* Dynamic Background Banner */}
            <div className="skill-cutin-bg" style={{
              position: 'absolute',
              width: '130%',
              height: '190px',
              background: skillCutIn.character.rank === 'SS' 
                ? 'linear-gradient(110deg, #ff0055 0%, #aa00ff 50%, #ff00aa 100%)'
                : skillCutIn.character.rank === 'S'
                ? 'linear-gradient(110deg, #ffaa00 0%, #ff2200 50%, #ff6600 100%)'
                : 'linear-gradient(110deg, #0088ff 0%, #00cc88 50%, #0044cc 100%)',
              boxShadow: '0 0 50px rgba(255,255,255,0.8), inset 0 0 30px rgba(0,0,0,0.5)',
              transform: 'rotate(-6deg)',
              display: 'flex',
              alignItems: 'center',
              borderTop: '5px solid #ffffff',
              borderBottom: '5px solid #ffffff',
            }} />

            {/* Flash overlay */}
            <div className="skill-flash-overlay" style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
              zIndex: 2005
            }} />

            {/* Character Cut-In Avatar & Info */}
            <div className="skill-cutin-avatar" style={{
              position: 'relative',
              zIndex: 2010,
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              paddingLeft: '10px',
              paddingRight: '10px'
            }}>
              <div
                className="skill-aura-glow"
                style={{
                  position: 'relative',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  border: '4px solid #ffffff',
                  boxShadow: '0 0 25px #ffffff, 0 0 50px ' + skillCutIn.character.color,
                  background: skillCutIn.character.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  ['--glow-color' as string]: skillCutIn.character.color,
                }}
              >
                <CharacterAvatar character={skillCutIn.character} size={88} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Rank & Name */}
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  textShadow: '0 2px 4px #000',
                  letterSpacing: '1px'
                }}>
                  {skillCutIn.character.rank}ランク 【{skillCutIn.character.name}】
                </div>
                {/* Skill Name */}
                <div className="skill-cutin-text" style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#ffea00',
                  textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 0 20px #ffaa00',
                  whiteSpace: 'nowrap',
                  marginTop: '2px'
                }}>
                  {skillCutIn.skillName}！！
                </div>
                {/* Skill Type Tag */}
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  background: 'rgba(0,0,0,0.65)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  alignSelf: 'flex-start',
                  marginTop: '4px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}>
                  {skillCutIn.skillType === 'center_pop' && '🔥 中央のぷにを一括消去！'}
                  {skillCutIn.skillType === 'random_pop' && '⚡ ランダムにぷにを大量消去！'}
                  {skillCutIn.skillType === 'all_pop' && '💥 盤面のぷにを全消去！'}
                  {skillCutIn.skillType === 'inflate_puni' && '✨ ぷにをでかぷに化！'}
                  {skillCutIn.skillType === 'heal' && '💖 HPを大幅回復！'}
                  {skillCutIn.skillType === 'damage' && '🗡️ 強烈な一撃必殺！'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Full-Screen Game-End Overlays ── */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '320px',
            padding: '24px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderRadius: '16px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00ccff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}>
              <Pause size={28} /> 一時停止
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
              {stage.name}: {stage.enemyName}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {/* Low Perf Mode Toggle */}
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '10px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Zap size={15} color="#00ffaa" /> 動作軽量化モード
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
                    スマホ・低スペックでラグ防止
                  </div>
                </div>
                <button
                  onClick={toggleLowPerfMode}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    background: isLowPerfMode ? '#00cc88' : '#444455',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isLowPerfMode ? 'ON' : 'OFF'}
                </button>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setIsPaused(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '1rem' }}
              >
                <Play size={20} /> ゲームを再開する
              </button>

              <button
                className="btn btn-secondary"
                onClick={restartStage}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem' }}
              >
                <RotateCcw size={18} /> 最初からやり直す
              </button>

              <button
                className="btn btn-danger"
                onClick={() => navigate(stageId?.startsWith('event_snow_') ? '/event/map' : '/stages')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem', marginTop: '4px' }}
              >
                <ArrowLeft size={18} /> ステージ選択に戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(40,0,0,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <h1 style={{ fontSize: '3.5rem', color: '#ff3333', textShadow: '0 0 20px #f00' }}>GAME OVER</h1>
          <div style={{ display: 'flex', gap: '12px', marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={restartStage}>もう一度挑戦</button>
            <button className="btn btn-primary" onClick={() => navigate(stageId?.startsWith('event_snow_') ? '/event/map' : '/stages')}>ステージ選択</button>
          </div>
        </div>
      )}

      {isSaFinished && saResult && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', textAlign: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '25px', border: '3px solid #ffcc00', borderRadius: '24px', boxShadow: '0 0 25px rgba(255,204,0,0.4)', background: 'linear-gradient(135deg, rgba(20,15,35,0.95), rgba(10,5,20,0.95))' }}>
            <div style={{ fontSize: '1.2rem', color: '#ffcc00', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '5px' }}>⏱️ TIME UP !!</div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 20px 0', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)', fontWeight: 900 }}>スコアタ終了！</h1>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '15px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>今回の獲得スコア</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00ffcc', fontFamily: 'monospace' }}>
                {score.toLocaleString()} <span style={{ fontSize: '1rem' }}>点</span>
              </div>

              <div style={{ margin: '12px 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>ハイスコア</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                {Math.max(score, saResult.previousHighScore).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>点</span>
              </div>

              {saResult.isNewHighScore && (
                <div style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(90deg, #ff0055, #ffcc00)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255,0,85,0.4)'
                }}>
                  🎉 自己新記録更新！
                </div>
              )}
            </div>

            {/* Participation rewards */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px' }}>🎁 参加報酬を獲得！</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '8px 15px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'bold' }}>🔶 +100 Ypt</span>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '8px 15px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 'bold' }}>💰 +300 コイン</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={restartStage}
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 900, background: 'linear-gradient(135deg, #ea580c, #ca8a04)' }}
              >
                もう一度挑戦する
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/score_attack')}
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 900 }}
              >
                スコアタ画面に戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {isVictory && stage && (
        <StageResultModal
          stageName={stage.name}
          enemyName={stage.enemyName}
          enemyEmoji={stage.enemyEmoji}
          score={score}
          playerHp={playerHp}
          maxPlayerHp={maxPlayerHp}
          feverCount={feverCount}
          rewardMoney={stage.rewardMoney}
          rewardYPoints={stage.rewardYPoints}
          isEventStage={Boolean(stageId?.startsWith('event_snow_'))}
          drops={dropResult}
          onRetry={restartStage}
          onNext={() => navigate(stageId?.startsWith('event_snow_') ? '/event/map' : '/stages')}
        />
      )}
    </div>
  );
};

export default GameScene;

