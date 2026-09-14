import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ChevronRight } from 'lucide-react';
import { CURRENT_EVENTS } from '../data/events';
import { CHARACTERS } from '../data/characters';
import { useGame } from '../store/GameContext';
import { CharacterAvatar } from '../components/CharacterAvatar';

const EventHome = () => {
  const navigate = useNavigate();
  const { characters, completedMissions } = useGame();

  const eventBoostChars = CHARACTERS.filter(c => c.eventBoost);
  const ownedBoostChars = eventBoostChars.filter(c => characters[c.id]);

  return (
    <div className="view-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/home')} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>🎪 イベント</h2>
      </div>

      {/* ⚔️ BLEACH 十刃 虚圏（ウェコムンド）突入バナー */}
      <div
        onClick={() => navigate('/event/bleach')}
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #312e81 100%)',
          border: '4px solid #d946ef',
          borderRadius: '24px',
          padding: '20px 22px',
          marginBottom: '24px',
          boxShadow: '0 12px 35px rgba(217, 70, 239, 0.5), 0 0 20px rgba(0, 255, 255, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'absolute', top: -15, right: -15, fontSize: '6.5rem', opacity: 0.25 }}>⚔️</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            background: 'linear-gradient(90deg, #d946ef, #9333ea)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 900,
            padding: '4px 12px',
            borderRadius: '16px',
            boxShadow: '0 0 12px #d946ef',
            letterSpacing: '1px'
          }}>
            ⚔️ BLEACH コラボ開催中！
          </span>
          <span style={{ fontSize: '0.8rem', color: '#00ffff', fontWeight: 900 }}>全8ステージ（特別深層あり）</span>
        </div>

        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚔️ 虚圏（ウェコムンド）決戦 👑
        </div>

        <div style={{ fontSize: '0.9rem', color: '#e0e7ff', lineHeight: 1.5, marginBottom: '16px', fontWeight: 600 }}>
          十刃（エスパーダ）＆超越者「藍染惣右介」を討伐せよ！<br />
          クリアで<strong style={{ color: '#00ffff', fontSize: '1rem' }}>💍 死神の指輪 & 大量Yポイント</strong>を獲得！
        </div>

        {/* アクションボタン */}
        <div style={{
          background: 'linear-gradient(135deg, #d946ef, #7c3aed)',
          color: '#ffffff',
          border: '3px solid #f0abfc',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontWeight: 900,
          fontSize: '1.25rem',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
          letterSpacing: '1px'
        }}>
          <span>⚔️ 虚圏（ウェコムンド）へ出撃！</span>
          <ChevronRight size={28} strokeWidth={3} />
        </div>
      </div>

      {CURRENT_EVENTS.map(event => {
        const allMissions = event.missions;
        const completedCount = allMissions.filter(m => completedMissions.includes(m.id)).length;

        return (
          <div key={event.id} style={{ marginBottom: '20px' }}>
            {/* Event Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${event.color} 0%, ${event.colorEnd} 100%)`,
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '15px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative bg text */}
              <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '5rem', opacity: 0.15 }}>{event.emoji}</div>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>{event.emoji} {event.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#ffcc00', fontWeight: 900, marginBottom: '8px' }}>{event.subtitle}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{event.description}</div>

              {/* Progress */}
              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>ミッション達成: {completedCount}/{allMissions.length}</span>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  onClick={() => navigate('/missions')}
                >
                  ミッション一覧
                </button>
              </div>
            </div>

            {/* 特効キャラ一覧 */}
            <div className="glass-panel" style={{ padding: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} color="#ff2255" />
                <span style={{ fontWeight: 900, color: '#ff88aa' }}>イベント特効キャラ（{event.boostMultiplier}倍）</span>
              </div>
              {eventBoostChars.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '0.85rem' }}>現在特効キャラはいません</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {eventBoostChars.map(c => {
                    const owned = !!characters[c.id];
                    return (
                      <div key={c.id} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        opacity: owned ? 1 : 0.4, position: 'relative',
                      }}>
                        <CharacterAvatar
                          character={c}
                          size={50}
                          style={{
                            border: owned ? '2px solid #ff2255' : '2px dashed #888',
                            boxShadow: owned ? '0 0 10px rgba(255,34,85,0.5)' : 'none',
                          }}
                        />
                        <span style={{ fontSize: '0.65rem', color: owned ? 'white' : '#888', textAlign: 'center', maxWidth: '55px', lineHeight: 1.2 }}>{c.name}</span>
                        {!owned && (
                          <div style={{ position: 'absolute', top: -2, right: -2, background: '#888', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white' }}>?</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {ownedBoostChars.length > 0 && (
                <div style={{ marginTop: '10px', background: 'rgba(255,34,85,0.15)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', color: '#ff88aa' }}>
                  ✅ 特効キャラを{ownedBoostChars.length}体所持中！チームに編成すると攻撃力{event.boostMultiplier}倍！
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventHome;
