import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CHARACTERS, TRIBES } from '../data/characters';
import type { Rank } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';

const RANKS: Rank[] = ['Z', 'SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E'];
const RANK_COLORS: Record<Rank, string> = {
  Z: '#00ffff', SSS: '#ffd700', SS: '#ff22ff', S: '#ff2222', A: '#ffaa00', B: '#ff88bb', C: '#cc6666', D: '#55bb55', E: '#88cc88'
};
const PER_PAGE = 20;

const Collection = () => {
  const navigate = useNavigate();
  const { characters } = useGame();
  const [filterRank, setFilterRank] = useState<Rank | 'ALL'>('ALL');
  const [filterTribe, setFilterTribe] = useState<string | 'ALL'>('ALL');
  const [page, setPage] = useState(0);

  const filtered = CHARACTERS.filter(c => {
    if (filterRank !== 'ALL' && c.rank !== filterRank) return false;
    if (filterTribe !== 'ALL' && c.tribe !== filterTribe) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageChars  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const ownedCount = CHARACTERS.filter(c => characters[c.id]).length;

  const handleRankFilterChange = (rank: Rank | 'ALL') => {
    setFilterRank(rank);
    setPage(0);
  };

  const handleTribeFilterChange = (tribe: string | 'ALL') => {
    setFilterTribe(tribe);
    setPage(0);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => navigate('/home')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0 }}>図鑑</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {ownedCount} / {CHARACTERS.length} 体
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Overall progress bar */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(ownedCount / CHARACTERS.length) * 100}%`,
            background: 'linear-gradient(90deg, #6c63ff, #ff6584)',
            transition: 'width 0.4s',
          }} />
        </div>
      </div>

      {/* Filter Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {/* Tribe filter tabs */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
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
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
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
      <div style={{ flex: 1, overflowY: 'auto' }}>
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
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                {owned ? (
                  <div style={{ position: 'relative' }}>
                    <CharacterAvatar
                      character={c}
                      size={52}
                      showRankBadge={true}
                    />
                    {/* 種族バッジ */}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, paddingTop: '8px' }}>
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
    </div>
  );
};

export default Collection;
