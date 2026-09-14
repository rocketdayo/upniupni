import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Award, BookOpen, Check, Lock, Zap, Key, X, Sparkles, Package } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CHARACTERS, TRIBES, getSkillDetails } from '../data/characters';
import type { Rank, Character } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { ALL_TITLES, getTitleInfo, getCompleteTitleList } from '../data/titles';
import type { TitleInfo } from '../data/titles';

const RANKS: Rank[] = ['K', 'UZ+++', 'ZZ', "Z'", 'Z', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'];
const RANK_COLORS: Record<Rank, string> = {
  'K': '#00ffcc', 'UZ+++': '#ff007f', 'ZZ': '#ffd700', "Z'": '#ff3399', Z: '#00ffff', SSS: '#ffd700', SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
};
const PER_PAGE = 20;

export interface GameItemDoc {
  id: string;
  name: string;
  category: '秘石・神昇' | '秘伝書' | 'けいけんち' | 'イベント限定';
  rarity: 'LEGEND' | 'UR' | 'SSR' | 'SR' | 'Normal';
  iconEmoji: string;
  color: string;
  description: string;
  effectText: string;
  howToGet: string;
  getCount: (items: any) => number;
}

const GAME_ITEMS_DICTIONARY: GameItemDoc[] = [
  {
    id: 'godAscensionStone',
    name: '神昇の秘石',
    category: '秘石・神昇',
    rarity: 'LEGEND',
    iconEmoji: '💎',
    color: '#ffd700',
    description: '神代のエネルギーを宿した至高の秘石。Z\'ランクの妖怪を極限の【ZZランク】へと神昇進化させることができる。',
    effectText: '神昇の祭壇にてZ\'ランクキャラをZZランクへ神昇覚醒（ステータス大幅増＋第2スキル解放）',
    howToGet: 'ウラステージの強敵ボス撃破、スコアアタック上位報酬・大台突破報酬、シリアルコードなど',
    getCount: (items) => items?.godAscensionStone || 0
  },
  {
    id: 'superLimitBreakBook',
    name: '超限界突破の書',
    category: '秘伝書',
    rarity: 'LEGEND',
    iconEmoji: '📖',
    color: '#e11d48',
    description: 'キャラクターの限界突破上限をさらに開放する至高の秘伝の書物。',
    effectText: 'キャラクターの限界突破レベル（最大+10）を+1強化し全ステータスを大幅増強',
    howToGet: 'スコアアタック1000兆pt・100京pt突破報酬、全国ランキング上位報酬、イベント限定報酬',
    getCount: (items) => items?.superLimitBreakBook || 0
  },
  {
    id: 'godSkillBook',
    name: '神ひっさつの秘伝書',
    category: '秘伝書',
    rarity: 'UR',
    iconEmoji: '📜',
    color: '#38bdf8',
    description: '神々の技の極意が記された神聖な書物。',
    effectText: '使用した妖怪のひっさつ技レベルを一気にMAX(Lv.7)まで引き上げる',
    howToGet: 'スコアアタック1000億pt・10兆pt突破報酬、全国ランキング入賞、ミッション報酬',
    getCount: (items) => items?.godSkillBook || 0
  },
  {
    id: 'skillBook',
    name: 'ひっさつの秘伝書',
    category: '秘伝書',
    rarity: 'SSR',
    iconEmoji: '📘',
    color: '#ec4899',
    description: '妖怪の必殺技の威力を磨き上げる秘伝の巻物。',
    effectText: 'キャラクターの必殺技レベルを +1 上昇させる',
    howToGet: 'ステージクリアドロップ、スコアタ1億pt突破報酬、ミッション報酬',
    getCount: (items) => items?.skillBook || 0
  },
  {
    id: 'expLarge',
    name: '超けいけんちだま',
    category: 'けいけんち',
    rarity: 'UR',
    iconEmoji: '🟣',
    color: '#a855f7',
    description: '膨大なる経験値が濃縮された最高級の霊魂玉。',
    effectText: 'キャラクターに膨大な経験値（+2,000 EXP）を付与',
    howToGet: '高難易度ウラステージクリア、スコアタ報酬、イベント報酬',
    getCount: (items) => items?.expLarge || 0
  },
  {
    id: 'expSmall',
    name: '小けいけんちだま',
    category: 'けいけんち',
    rarity: 'Normal',
    iconEmoji: '🟢',
    color: '#22c55e',
    description: '初心者にぴったりの小さなけいけんちだま。',
    effectText: 'キャラクターに経験値（+100 EXP）を付与',
    howToGet: '通常ステージドロップ、ログインボーナス',
    getCount: (items) => items?.expSmall || 0
  },
  {
    id: 'bleachRings',
    name: '死神の指輪 (ソウルリング)',
    category: 'イベント限定',
    rarity: 'UR',
    iconEmoji: '⚔️',
    color: '#8b5cf6',
    description: '霊圧を極限まで高める異世界の霊具。BLEACHコラボ特別装備品。',
    effectText: '死神たちの潜在能力を引き出し、コラボ限定称号や報酬を解禁',
    howToGet: 'BLEACHコラボイベントマップ各ステージ撃破',
    getCount: (items) => items?.bleachRings || 0
  }
];

const RARITY_ORDER: Record<TitleInfo['rarity'], number> = {
  LEGEND: 6,
  UR: 5,
  SSR: 4,
  SR: 3,
  Rare: 2,
  Normal: 1,
};

const RARITY_COLORS: Record<TitleInfo['rarity'], { border: string; bg: string; text: string }> = {
  LEGEND: { border: '#e11d48', bg: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)', text: '#ffffff' },
  UR: { border: '#38bdf8', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', text: '#ffffff' },
  SSR: { border: '#ec4899', bg: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', text: '#ffffff' },
  SR: { border: '#a855f7', bg: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)', text: '#ffffff' },
  Rare: { border: '#3b82f6', bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', text: '#ffffff' },
  Normal: { border: '#64748b', bg: 'linear-gradient(135deg, #475569 0%, #334155 100%)', text: '#ffffff' },
};

const Collection = () => {
  const navigate = useNavigate();
  const {
    characters,
    items,
    selectedTitle = '新米妖怪レーサー',
    unlockedTitles = ['新米妖怪レーサー'],
    setSelectedTitle,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'characters' | 'titles' | 'items'>('characters');

  // 妖怪図鑑の状態
  const [filterRank, setFilterRank] = useState<Rank | 'ALL'>('ALL');
  const [filterTribe, setFilterTribe] = useState<string | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [detailChar, setDetailChar] = useState<Character | null>(null);

  // 称号図鑑の状態
  const [titleCategory, setTitleCategory] = useState<string>('ALL');
  const [titleRarity, setTitleRarity] = useState<string>('ALL');
  const [titleStatus, setTitleStatus] = useState<'ALL' | 'OWNED' | 'LOCKED'>('ALL');

  // アイテム・装備図鑑の状態
  const [itemCategory, setItemCategory] = useState<string>('ALL');
  const [itemRarity, setItemRarity] = useState<string>('ALL');

  // --- 妖怪図鑑フィルタ計算 ---
  const filteredChars = CHARACTERS.filter(c => {
    if (filterRank !== 'ALL' && c.rank !== filterRank) return false;
    if (filterTribe !== 'ALL' && c.tribe !== filterTribe) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredChars.length / PER_PAGE));
  const pageChars  = filteredChars.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const ownedCount = CHARACTERS.filter(c => characters[c.id]).length;

  // --- 称号図鑑フィルタ計算 ---
  const allAvailableTitles = getCompleteTitleList(unlockedTitles);
  const unlockedTitleSet = new Set(unlockedTitles);
  const filteredTitles = allAvailableTitles.filter(t => {
    const isOwned = unlockedTitleSet.has(t.name) || unlockedTitleSet.has(t.id);
    if (titleStatus === 'OWNED' && !isOwned) return false;
    if (titleStatus === 'LOCKED' && isOwned) return false;
    if (titleCategory !== 'ALL' && t.category !== titleCategory) return false;
    if (titleRarity !== 'ALL' && t.rarity !== titleRarity) return false;
    return true;
  }).sort((a, b) => {
    // 装備中 -> 獲得済み -> 未解禁, その後レアリティ順
    const aEquipped = selectedTitle === a.name || selectedTitle === a.id;
    const bEquipped = selectedTitle === b.name || selectedTitle === b.id;
    if (aEquipped) return -1;
    if (bEquipped) return 1;

    const aOwned = unlockedTitleSet.has(a.name) || unlockedTitleSet.has(a.id);
    const bOwned = unlockedTitleSet.has(b.name) || unlockedTitleSet.has(b.id);
    if (aOwned && !bOwned) return -1;
    if (!aOwned && bOwned) return 1;

    return (RARITY_ORDER[b.rarity] || 1) - (RARITY_ORDER[a.rarity] || 1);
  });

  const ownedTitleCount = allAvailableTitles.filter(t => unlockedTitleSet.has(t.name) || unlockedTitleSet.has(t.id)).length;
  const currentEquippedInfo = getTitleInfo(selectedTitle);

  const handleRankFilterChange = (rank: Rank | 'ALL') => {
    setFilterRank(rank);
    setPage(0);
  };

  const handleTribeFilterChange = (tribe: string | 'ALL') => {
    setFilterTribe(tribe);
    setPage(0);
  };

  return (
    <div className="view-container" style={{ padding: '16px', gap: '12px', overflowY: 'auto', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => navigate('/home')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', fontWeight: 900 }}>
            大辞典
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            {activeTab === 'characters'
              ? `妖怪収集: ${ownedCount} / ${CHARACTERS.length} 体`
              : activeTab === 'titles'
              ? `称号獲得: ${ownedTitleCount} / ${allAvailableTitles.length} 個`
              : `神昇の秘石: ${items?.godAscensionStone || 0} 個`}
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* ホームの神昇の祭壇への案内バナー */}
      <div
        onClick={() => navigate('/ascension')}
        style={{
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 0, 127, 0.15) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>👑</span>
          <span style={{ fontSize: '0.75rem', color: '#ffd700', fontWeight: 800 }}>
            神昇覚醒（Z'➔ZZ進化）はホーム画面の【神昇の祭壇】へ
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#00ffcc', fontWeight: 900 }}>
          祭壇へ進む ➔
        </span>
      </div>

      {/* 大辞典 タブ切り替えバー */}
      <div style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '16px',
        padding: '4px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('characters')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'characters'
              ? 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)'
              : 'transparent',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            boxShadow: activeTab === 'characters' ? '0 2px 10px rgba(255,0,127,0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={13} color="#ffd700" />
          <span>妖怪</span>
          <span style={{ fontSize: '0.62rem', opacity: 0.8, background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '8px' }}>
            {ownedCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'titles'
              ? 'linear-gradient(135deg, #00c853 0%, #009688 100%)'
              : 'transparent',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            boxShadow: activeTab === 'titles' ? '0 2px 10px rgba(0,200,83,0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Award size={13} color="#00ffff" />
          <span>称号</span>
          <span style={{ fontSize: '0.62rem', opacity: 0.8, background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '8px' }}>
            {ownedTitleCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('items')}
          style={{
            flex: 1,
            padding: '8px 4px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'items'
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
              : 'transparent',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.74rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            boxShadow: activeTab === 'items' ? '0 2px 10px rgba(245,158,11,0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Package size={13} color="#ffd700" />
          <span>装備・道具</span>
          <span style={{ fontSize: '0.62rem', opacity: 0.8, background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '8px' }}>
            {GAME_ITEMS_DICTIONARY.length}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: 妖怪大辞典 ─── */}
      {activeTab === 'characters' && (
        <>
          {/* Progress bar */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(ownedCount / CHARACTERS.length) * 100}%`,
                background: 'linear-gradient(90deg, #ff007f, #7928ca)',
                transition: 'width 0.4s',
              }} />
            </div>
          </div>

          {/* Filter Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            {/* Tribe filter tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              <button
                onClick={() => handleTribeFilterChange('ALL')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.78rem',
                  background: filterTribe === 'ALL' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  whiteSpace: 'nowrap',
                }}
              >
                種族:すべて
              </button>
              {TRIBES.map(t => (
                <button
                  key={t.name}
                  onClick={() => handleTribeFilterChange(t.name)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.78rem',
                    background: filterTribe === t.name ? t.color : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: filterTribe === t.name ? `0 0 8px ${t.color}` : 'none'
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>

            {/* Rank filter tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              {(['ALL', ...RANKS] as (Rank | 'ALL')[]).map(rank => (
                <button
                  key={rank}
                  onClick={() => handleRankFilterChange(rank)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    background: filterRank === rank
                      ? (rank === 'ALL' ? '#666' : RANK_COLORS[rank as Rank])
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rank}
                </button>
              ))}
            </div>
          </div>

          {/* Character grid */}
          <div style={{ width: '100%' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              padding: '4px',
            }}>
              {pageChars.map(c => {
                const owned = !!characters[c.id];
                const tribeObj = TRIBES.find(t => t.name === c.tribe);
                return (
                  <div
                    key={c.id}
                    onClick={() => owned && setDetailChar(c)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: owned ? 'pointer' : 'default',
                      transition: 'transform 0.15s'
                    }}
                  >
                    {owned ? (
                      <div style={{ position: 'relative' }}>
                        <CharacterAvatar
                          character={c}
                          size={52}
                          showRankBadge={true}
                        />
                        <span style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          backgroundColor: tribeObj?.color || '#333',
                          fontSize: '0.6rem',
                          padding: '1px 3px',
                          borderRadius: '4px',
                          color: '#fff',
                          fontWeight: 'bold',
                          border: '1px solid #fff'
                        }}>
                          {tribeObj?.emoji}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          backgroundColor: '#222',
                          border: '2px solid #333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem'
                        }}
                      >
                        ❓
                      </div>
                    )}
                    <span style={{
                      fontSize: '0.6rem',
                      color: owned ? 'var(--text-color)' : '#444',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: '52px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {owned ? c.name : '？？？'}
                    </span>
                    {owned && (
                      <span style={{
                        fontSize: '0.55rem',
                        color: tribeObj?.color || '#aaa',
                        fontWeight: 700
                      }}>
                        {c.tribe}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
            <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {page + 1} / {totalPages}
            </span>
            <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
              <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}

      {/* ─── TAB 2: 称号大辞典 ─── */}
      {activeTab === 'titles' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* 現在装着中の称号バナー */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.2) 0%, rgba(121, 40, 202, 0.2) 100%)',
            borderRadius: '16px',
            padding: '10px 14px',
            border: '1.5px solid #ff007f',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}>
            <Award size={28} color="#ffd700" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.68rem', color: '#ff77aa', fontWeight: 900 }}>現在装備中の称号</div>
              <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 900, textShadow: '0 0 8px rgba(255,0,127,0.5)' }}>
                {currentEquippedInfo?.name || selectedTitle}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#00ffcc', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} color="#00ffcc" />
                <span>{currentEquippedInfo?.effect.specialDescription || '効果なし'}</span>
              </div>
            </div>
          </div>

          {/* 称号進捗バー */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 800 }}>
              <span>称号コンプリート率</span>
              <span style={{ color: '#00ffcc' }}>{Math.round((ownedTitleCount / ALL_TITLES.length) * 100)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(ownedTitleCount / ALL_TITLES.length) * 100}%`,
                background: 'linear-gradient(90deg, #00c853, #009688)',
                transition: 'width 0.4s',
              }} />
            </div>
          </div>

          {/* フィルターバー */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
            {/* 状態フィルター */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'ALL', label: 'すべて' },
                { id: 'OWNED', label: '獲得済み' },
                { id: 'LOCKED', label: '未獲得' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setTitleStatus(st.id as any)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: titleStatus === st.id ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                    color: titleStatus === st.id ? '#0f172a' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* カテゴリフィルター */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              {['ALL', '基本', 'バトル', '育成', '収集', 'スコアタ', 'イベント', '伝説'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setTitleCategory(cat)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: titleCategory === cat ? '#a855f7' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat === 'ALL' ? 'カテゴリ:すべて' : cat}
                </button>
              ))}
            </div>

            {/* レアリティフィルター */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              {['ALL', 'LEGEND', 'UR', 'SSR', 'SR', 'Rare', 'Normal'].map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setTitleRarity(rarity)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: titleRarity === rarity ? '#ec4899' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {rarity === 'ALL' ? 'レア:すべて' : rarity}
                </button>
              ))}
            </div>
          </div>

          {/* 称号カードリスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
            {filteredTitles.map(t => {
              const isOwned = unlockedTitleSet.has(t.name) || unlockedTitleSet.has(t.id);
              const isEquipped = selectedTitle === t.name || selectedTitle === t.id;
              const styleTheme = RARITY_COLORS[t.rarity] || RARITY_COLORS.Normal;

              return (
                <div
                  key={t.id}
                  style={{
                    background: isEquipped
                      ? 'linear-gradient(135deg, rgba(255,0,127,0.2) 0%, rgba(121,40,202,0.2) 100%)'
                      : isOwned
                      ? 'rgba(30, 41, 59, 0.7)'
                      : 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '16px',
                    border: isEquipped
                      ? '2px solid #ff007f'
                      : isOwned
                      ? `1px solid ${t.color}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    opacity: isOwned ? 1 : 0.65,
                    boxShadow: isEquipped ? '0 0 12px rgba(255,0,127,0.3)' : 'none',
                    position: 'relative'
                  }}
                >
                  {/* 上部: 称号名、レアリティ、装備ボタン */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{
                        background: styleTheme.bg,
                        color: styleTheme.text,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        flexShrink: 0
                      }}>
                        {t.rarity}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', color: isOwned ? '#ffffff' : '#94a3b8', fontWeight: 900 }}>
                        {t.name}
                      </h3>
                    </div>

                    {/* 状態ボタン / バッジ */}
                    {isEquipped ? (
                      <span style={{
                        background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 0 8px rgba(255,0,127,0.5)'
                      }}>
                        <Check size={12} /> 装備中
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => setSelectedTitle(t.name)}
                        style={{
                          background: 'rgba(0, 200, 83, 0.2)',
                          border: '1px solid #00c853',
                          color: '#00ff88',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        装着する
                      </button>
                    ) : (
                      <span style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#64748b',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Lock size={12} /> 未獲得
                      </span>
                    )}
                  </div>

                  {/* 称号の能力（パッシブ効果） */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    border: '1px solid rgba(0, 255, 204, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Zap size={14} color="#00ffcc" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#00ffcc', fontWeight: 900, lineHeight: 1.3 }}>
                      {t.effect.specialDescription}
                    </span>
                  </div>

                  {/* 入手方法（解禁条件） */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    fontSize: '0.73rem',
                    color: isOwned ? '#cbd5e1' : '#f59e0b',
                    lineHeight: 1.35
                  }}>
                    <Key size={13} color={isOwned ? '#94a3b8' : '#f59e0b'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <span style={{ fontWeight: 800, marginRight: '4px' }}>入手条件:</span>
                      <span>{t.howToGet}</span>
                    </div>
                  </div>

                  {/* フレーバー説明 */}
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                    "{t.description}"
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ─── TAB 3: 装備・アイテム大辞典 ─── */}
      {activeTab === 'items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          {/* Summary Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffd700' }}>
                🎒 装備・アイテム大辞典
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                秘石・秘伝書・育成アイテム・イベント限定装備の全効果と入手先
              </div>
            </div>
          </div>

          {/* フィルターバー */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* カテゴリ */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              {['ALL', '秘石・神昇', '秘伝書', 'けいけんち', 'イベント限定'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setItemCategory(cat)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: itemCategory === cat ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat === 'ALL' ? 'カテゴリ:すべて' : cat}
                </button>
              ))}
            </div>

            {/* レアリティ */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'thin' }}>
              {['ALL', 'LEGEND', 'UR', 'SSR', 'SR', 'Normal'].map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setItemRarity(rarity)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: itemRarity === rarity ? '#ea580c' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {rarity === 'ALL' ? 'レア:すべて' : rarity}
                </button>
              ))}
            </div>
          </div>

          {/* アイテムカードリスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
            {GAME_ITEMS_DICTIONARY.filter(item => {
              if (itemCategory !== 'ALL' && item.category !== itemCategory) return false;
              if (itemRarity !== 'ALL' && item.rarity !== itemRarity) return false;
              return true;
            }).map(item => {
              const count = item.getCount(items);
              const hasItem = count > 0;
              const rarityTheme = RARITY_COLORS[item.rarity] || RARITY_COLORS.Normal;

              return (
                <div
                  key={item.id}
                  style={{
                    background: hasItem ? 'rgba(30, 41, 59, 0.75)' : 'rgba(15, 23, 42, 0.45)',
                    borderRadius: '16px',
                    border: hasItem ? `1px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: hasItem ? `0 2px 10px ${item.color}22` : 'none',
                    opacity: hasItem ? 1 : 0.7
                  }}
                >
                  {/* ヘッダー: アイコン、名前、レアリティ、所持数 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.iconEmoji}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: rarityTheme.bg,
                            color: rarityTheme.text,
                            fontSize: '0.62rem',
                            fontWeight: 900,
                            padding: '2px 6px',
                            borderRadius: '6px'
                          }}>
                            {item.rarity}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800 }}>
                            {item.category}
                          </span>
                        </div>
                        <h3 style={{ margin: '2px 0 0 0', fontSize: '0.95rem', color: '#ffffff', fontWeight: 900 }}>
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    {/* 所持数バッジ */}
                    <div style={{
                      background: hasItem ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: hasItem ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.62rem', color: hasItem ? '#fde047' : '#64748b', fontWeight: 800 }}>所持数</span>
                      <span style={{ fontSize: '0.95rem', color: hasItem ? '#ffffff' : '#94a3b8', fontWeight: 900 }}>
                        {count.toLocaleString()} 個
                      </span>
                    </div>
                  </div>

                  {/* 効果説明 */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={14} color="#ffd700" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#fde047', fontWeight: 900, lineHeight: 1.3 }}>
                      {item.effectText}
                    </span>
                  </div>

                  {/* 入手方法 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    fontSize: '0.73rem',
                    color: '#cbd5e1',
                    lineHeight: 1.35
                  }}>
                    <Key size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <span style={{ fontWeight: 800, marginRight: '4px', color: '#f59e0b' }}>入手場所:</span>
                      <span>{item.howToGet}</span>
                    </div>
                  </div>

                  {/* フレーバー説明 */}
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                    "{item.description}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── キャラクター詳細モーダル ─── */}
      {detailChar && (() => {
        const charData = characters[detailChar.id];
        const skillLv = charData?.skillLevel || 1;
        const skillDetails = detailChar.skill ? getSkillDetails(detailChar.skill, skillLv) : null;
        const tribeObj = TRIBES.find(t => t.name === detailChar.tribe);
        const rankColor = RANK_COLORS[detailChar.rank] || '#ffffff';

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 1000,
              backdropFilter: 'blur(6px)',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setDetailChar(null)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '380px',
                background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
                borderRadius: '20px',
                border: `2px solid ${rankColor}`,
                boxShadow: `0 0 25px ${rankColor}55`,
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: '#ffffff',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: rankColor,
                      color: detailChar.rank === 'SSS' || detailChar.rank === 'Z' ? '#000' : '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    {detailChar.rank}
                  </span>
                  <span
                    style={{
                      background: tribeObj?.color || '#333',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    {tribeObj?.emoji} {detailChar.tribe}族
                  </span>
                </div>
                <button
                  onClick={() => setDetailChar(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Avatar + Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <CharacterAvatar character={detailChar} size={76} showRankBadge={false} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                    {detailChar.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <span>HP: <strong style={{ color: '#00ffcc' }}>{detailChar.baseHp + (charData?.level || 1) * 10}</strong></span>
                    <span>ATK: <strong style={{ color: '#ff77aa' }}>{detailChar.baseAtk + (charData?.level || 1) * 5}</strong></span>
                    <span>Lv: <strong style={{ color: '#ffd700' }}>{charData?.level || 1}</strong></span>
                  </div>
                </div>
              </div>

              {/* 必殺技 (Skill) カード */}
              {detailChar.skill && skillDetails ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15) 0%, rgba(255, 0, 127, 0.15) 100%)',
                    border: '1.5px solid #ffaa00',
                    borderRadius: '14px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={18} color="#ffd700" />
                      <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffd700' }}>
                        {detailChar.skill.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#00ffcc', fontWeight: 800, background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px' }}>
                      技Lv.{skillLv}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#f8fafc', lineHeight: 1.5, fontWeight: 500 }}>
                    {skillDetails.description}
                  </div>

                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}
                  >
                    <div style={{ color: '#ffd700', fontWeight: 800 }}>
                      【能力詳細】{skillDetails.countInfo}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  ⚡ 必殺技なし
                </div>
              )}

              {/* パッシブスキル (SSS以上/ZZ) */}
              {detailChar.passiveSkills && detailChar.passiveSkills.length > 0 && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)',
                    border: '1.5px solid #00ffcc',
                    borderRadius: '14px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#00ffcc" />
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#00ffcc' }}>
                      常時発動スキル ({detailChar.passiveSkills.length}種)
                    </span>
                  </div>
                  {detailChar.passiveSkills.map((ps, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        lineHeight: 1.4
                      }}
                    >
                      <div style={{ color: '#ffd700', fontWeight: 800 }}>
                        ⚡ スキル{idx + 1}: {ps.name}
                      </div>
                      <div style={{ color: '#e2e8f0', fontSize: '0.74rem', marginTop: '2px' }}>
                        {ps.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 特性 & イベント特効 */}
              {(detailChar.trait || detailChar.eventBoost) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {detailChar.trait && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', marginBottom: '2px', fontWeight: 800 }}>
                        📖 キャラクター特性
                      </span>
                      {detailChar.trait}
                    </div>
                  )}

                  {detailChar.eventBoost && (
                    <div style={{ background: 'rgba(255, 34, 85, 0.2)', border: '1px solid #ff2255', borderRadius: '10px', padding: '8px 12px', fontSize: '0.78rem', color: '#ff77aa', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#ff2255" />
                      <span>{detailChar.eventBoostDesc || 'イベントステージ特効！攻撃力爆増！'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setDetailChar(null)}
                style={{
                  marginTop: '4px',
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                とじる
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Collection;
