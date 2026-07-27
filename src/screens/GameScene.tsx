import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import { useGame } from '../store/GameContext';
import { STAGES } from '../data/stages';
import { CHARACTERS, getPublicUrl, createPuniSvgDataUrl } from '../data/characters';
import type { Character, SkillType } from '../data/characters';
import { CURRENT_EVENTS } from '../data/events';
import { Zap, Pause, Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { CharacterAvatar } from '../components/CharacterAvatar';

const PUNI_RADIUS      = 23;
const BIG_PUNI_MULT    = 1.5;
const FEVER_MAX        = 100;
const FEVER_DURATION   = 7000;

// Preload individual character images for ALL ranks
const CHAR_IMAGES: Record<string, HTMLImageElement> = {};

const loadCharImage = (c: { id: string; rank: string; color: string; emoji: string; imageUrl?: string }, customSrc?: string) => {
  const img = new Image();
  const fallbackSrc = createPuniSvgDataUrl(c.emoji, c.color);

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

// Initial preload
CHARACTERS.forEach(c => {
  loadCharImage(c);
});

interface PuniData { charId: string; size: number; level: number; }

const GameScene = () => {
  const { stageId } = useParams();
  const navigate    = useNavigate();
  const { team, characters, clearStage, trackMission: _trackMission } = useGame();

  useEffect(() => {
    CHARACTERS.forEach(c => {
      loadCharImage(c);
    });
  }, []);

  // Check if any team member has event boost
  const eventBoostActive = team.some(id => {
    const c = CHARACTERS.find(x => x.id === id);
    return c?.eventBoost;
  });
  const boostMultiplier = eventBoostActive ? (CURRENT_EVENTS[0]?.boostMultiplier ?? 1) : 1;

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

  const [damageTexts, setDamageTexts] = useState<{ id: number; val: number; x: number; y: number; color: string }[]>([]);

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

  const selectedRef   = useRef<Matter.Body[]>([]);
  const isDragging    = useRef(false);

  // Restart function
  const restartStage = () => {
    if (!stage) return;
    setEnemyHp(stage.enemyHp);
    setPlayerHp(maxPlayerHp);
    setIsGameOver(false);
    setIsVictory(false);
    setFeverGauge(0);
    setIsFever(false);
    setFeverTimeLeft(0);
    const g: Record<string, number> = {};
    team.forEach(id => { g[id] = 0; });
    setCharGauges(g);
    setIsPaused(false);
  };

  // Pause / Resume physics runner
  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.enabled = !isPaused && !isGameOver && !isVictory;
    }
  }, [isPaused, isGameOver, isVictory]);

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
    setPlayerHp(hp);
    setMaxPlayerHp(hp);
    setCharGauges(g);
  }, [team, characters]);

  // ---------- enemy attack timer ----------
  useEffect(() => {
    if (!stage || isGameOver || isVictory || isFever || isPaused) return;
    const iv = setInterval(() => {
      setPlayerHp(prev => {
        const next = Math.max(0, prev - stage.enemyAtk);
        if (next === 0) setIsGameOver(true);
        const id = Date.now() + Math.random();
        setDamageTexts(t => [...t, { id, val: stage.enemyAtk, x: 60, y: 40, color: '#ff4444' }]);
        setTimeout(() => setDamageTexts(t => t.filter(x => x.id !== id)), 900);
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [stage, isGameOver, isVictory, isFever, isPaused]);

  // ---------- damage / win ----------
  const dealDamage = useCallback((dmg: number) => {
    setEnemyHp(prev => {
      const next = Math.max(0, prev - dmg);
      if (next === 0) {
        setIsVictory(true);
        setTimeout(() => clearStage(stage!.id, stage!.rewardMoney, stage!.rewardYPoints), 2000);
      }
      return next;
    });
  }, [stage, clearStage]);

  // ---------- fever start ----------
  useEffect(() => {
    if (feverGauge >= FEVER_MAX && !isFever) {
      setIsFever(true);
      setFeverTimeLeft(FEVER_DURATION);
      feverDmgAccum.current = 0;
    }
  }, [feverGauge, isFever]);

  // ---------- fever timer countdown (supports pause) ----------
  useEffect(() => {
    if (!isFever || isPaused || isGameOver || isVictory) return;
    const iv = setInterval(() => {
      setFeverTimeLeft(prev => {
        const next = prev - 100;
        if (next <= 0) {
          setIsFever(false);
          setFeverGauge(0);
          dealDamage(feverDmgAccum.current);
          const id = Date.now();
          setDamageTexts(p => [...p, { id, val: feverDmgAccum.current, x: 120, y: 80, color: '#ff00ff' }]);
          setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [isFever, isPaused, isGameOver, isVictory, dealDamage]);

  const executeSkillEffect = (cd: Character) => {
    if (!cd.skill) return;
    const charData = characters[cd.id];
    const skillLv = Math.max(1, (charData as any)?.skillLevel || 1);
    const baseAtk = cd.baseAtk + (charData?.level || 1) * 5;

    const engine = engineRef.current;

    if (cd.skill.type === 'heal') {
      const healAmount = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.35));
      setPlayerHp(prev => Math.min(maxPlayerHp, prev + healAmount));
      const id = Date.now();
      setDamageTexts(p => [...p, { id, val: healAmount, x: 150, y: 150, color: '#00ff88' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
      return;
    }

    if (cd.skill.type === 'damage' || !engine) {
      const power = Math.round(cd.skill.power * (1 + (skillLv - 1) * 0.3));
      const dmg = Math.floor(baseAtk * power * boostMultiplier);
      dealDamage(dmg);
      const id = Date.now();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 120, color: cd.rank === 'SS' ? '#ff22ff' : '#ffff00' }]);
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
      const dmg = Math.floor(baseAtk * power * (popCount * 0.2 + 1) * boostMultiplier);
      dealDamage(dmg);

      const id = Date.now();
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
      const dmg = Math.floor(baseAtk * power * (popped.length * 0.2 + 1) * boostMultiplier);
      dealDamage(dmg);

      const id = Date.now();
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
      const dmg = Math.floor(baseAtk * power * (popCount * 0.28 + 1.5) * boostMultiplier);
      dealDamage(dmg);

      const id = Date.now();
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

      const dmg = Math.floor(baseAtk * cd.skill.power * (targetCount * 0.3 + 1) * boostMultiplier);
      dealDamage(dmg);

      const id = Date.now();
      setDamageTexts(p => [...p, { id, val: dmg, x: 150, y: 180, color: '#ffff00' }]);
      setTimeout(() => setDamageTexts(p => p.filter(t => t.id !== id)), 1500);
    }
  };

  const triggerSkill = (charId: string) => {
    if ((charGauges[charId] || 0) < 100 || isGameOver || isVictory || isPaused || skillCutIn) return;
    const cd = CHARACTERS.find(c => c.id === charId);
    if (!cd || !cd.skill) return;

    setCharGauges(prev => ({ ...prev, [charId]: 0 }));

    setSkillCutIn({
      character: cd,
      skillName: cd.skill.name,
      skillType: cd.skill.type,
    });

    setTimeout(() => {
      setIsShaking(true);
      executeSkillEffect(cd);
    }, 350);

    setTimeout(() => {
      setIsShaking(false);
    }, 850);

    setTimeout(() => {
      setSkillCutIn(null);
    }, 1100);
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

      const { Engine, Render, Runner, Bodies, Composite, Events, Vector } = Matter;

      const engine = Engine.create();
      engineRef.current    = engine;
      engine.world.gravity.y = 2.2; // Fast, smooth drop physics

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
      const SEG = 48;
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

      for (let i = 0; i < 42; i++) setTimeout(spawnPuni, i * 40);
      const spawnIv = setInterval(() => {
        if (!isPausedRef.current && Composite.allBodies(engine.world).filter(b => !b.isStatic).length < 46) {
          spawnPuni();
        }
      }, 200);

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
        const dmg = Math.floor((cd.baseAtk + pd.level * 5) * Math.pow(pd.size, BIG_PUNI_MULT));

        // 消した時もぷにのサイズ（長かった連結ぷに）に応じてさらにボーナス加算
        let feverAdd = 0;
        let gaugeAdd = 0;
        if (pd.size <= 1) {
          feverAdd = 0;   // 単発消しではフィーバーは増えない
          gaugeAdd = 0.2; // 単発消しでは技ゲージもほとんど増えない
        } else {
          feverAdd = Math.min(FEVER_MAX, Math.pow(pd.size, 1.2) * 0.8);
          gaugeAdd = Math.min(100, Math.floor(Math.pow(pd.size, 1.3) * 0.8));
        }

        setFeverGauge(prev => Math.min(FEVER_MAX, prev + feverAdd));
        setCharGauges(prev => ({
          ...prev,
          [pd.charId]: Math.min(100, (prev[pd.charId] || 0) + gaugeAdd)
        }));

        setIsFever(fever => {
          if (fever) { feverDmgAccum.current += dmg; } else { dealDamage(dmg); }
          return fever;
        });

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
      const handleMove = (e: PointerEvent) => {
        if (isPausedRef.current || !isDragging.current) return;
        const b = getPuniAt(getPos(e));
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
        
        // Draw Circular Gear Board Background
        ctx.save();
        ctx.beginPath();
        ctx.arc(bowlCX, bowlCY, bowlRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b132b';
        ctx.fill();

        const bgGrad = ctx.createRadialGradient(bowlCX, bowlCY, bowlRadius * 0.2, bowlCX, bowlCY, bowlRadius);
        bgGrad.addColorStop(0, 'rgba(30, 55, 110, 0.25)');
        bgGrad.addColorStop(1, 'rgba(5, 12, 30, 0.88)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Main Gold Gear Ring
        ctx.beginPath();
        ctx.arc(bowlCX, bowlCY, bowlRadius, 0, Math.PI * 2);
        ctx.lineWidth   = 10;
        ctx.strokeStyle = '#f5b000';
        ctx.stroke();

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

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            if (cd.rank === 'S' || cd.rank === 'SS') { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; }
            else if (cd.rank === 'A') ctx.strokeStyle = '#ffaa00';
            else if (cd.rank === 'B') ctx.strokeStyle = '#ff88aa';
            else if (cd.rank === 'C') ctx.strokeStyle = '#aa5555';
            else if (cd.rank === 'D') ctx.strokeStyle = '#55aa55';
            else ctx.strokeStyle = '#88cc88';
            ctx.stroke();
          } else {
            ctx.font = `${r * 1.2}px Arial`;
            ctx.fillText(cd.emoji, x, y);
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
  }, [stage, team, characters, isGameOver, isVictory, dealDamage]);

  if (!stage || !team.length) return null;

  return (
    <div className={`view-container ${isShaking ? 'animate-shake' : ''}`} style={{
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      background: isFever ? 'radial-gradient(circle,#4a1a4a,#1a001a)' : 'var(--bg-color)',
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>

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
            padding: '6px 12px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10
          }}
        >
          <Pause size={16} /> 一時停止
        </button>

        <div style={{ fontSize: '4rem', animation: isFever ? 'none' : 'float 2s infinite', filter: isFever ? 'drop-shadow(0 0 12px #f0f)' : 'none' }}>
          {stage.enemyEmoji}
        </div>
        <div style={{ width: '80%', height: 13, background: '#333', borderRadius: 8, overflow: 'hidden', marginTop: 5, border: '2px solid #555' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff3333,#ffaa00)', width: `${(enemyHp / stage.enemyHp) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#ffaaaa', marginTop: 3 }}>敵: {Math.ceil(enemyHp)} / {stage.enemyHp}</div>
        <div style={{ width: '80%', height: 9, background: '#333', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ height: '100%', background: '#44ff44', width: `${(playerHp / maxPlayerHp) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#aaffaa', marginTop: 3 }}>自分: {Math.ceil(playerHp)} / {maxPlayerHp}</div>
      </div>

      {/* ── Character skill icons ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '4px 10px', flexShrink: 0 }}>
        {team.map(charId => {
          const cd   = CHARACTERS.find(c => c.id === charId);
          if (!cd) return null;
          const hasSkill = !!cd.skill;
          const g    = charGauges[charId] || 0;
          const full = g >= 100;
          return (
            <div key={charId} style={{ position: 'relative' }}>
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
          <div key={dt.id} className="damage-text" style={{ left: dt.x, top: dt.y, color: dt.color }}>
            {dt.val}
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
              <div style={{
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
                flexShrink: 0
              }}>
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

        {/* ── Pause Modal Overlay ── */}
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
                  onClick={() => navigate('/stages')}
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
              <button className="btn btn-primary" onClick={() => navigate('/stages')}>ステージ選択</button>
            </div>
          </div>
        )}

        {isVictory && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <h1 style={{ fontSize: '3.5rem', color: '#ffd700', textShadow: '0 0 20px #fa0' }}>STAGE CLEAR!</h1>
            <div className="glass-panel" style={{ marginTop: 20, padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--money-color)', fontWeight: 'bold' }}>+ {stage.rewardMoney} コイン</p>
              <p style={{ color: 'var(--y-point-color)', fontWeight: 'bold' }}>+ {stage.rewardYPoints} Yポイント</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/stages')}>ステージ選択に戻る</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScene;

