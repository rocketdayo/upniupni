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

      {/* 超巨大・激アツ裏マップ「常夏ビーチ(裏)」突入バナー */}
      <div
        onClick={() => navigate('/event/map')}
        style={{
          background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #b45309 100%)',
          border: '4px solid #fde047',
          borderRadius: '24px',
          padding: '20px 22px',
          marginBottom: '24px',
          boxShadow: '0 12px 35px rgba(234, 88, 12, 0.6), 0 0 20px rgba(253, 224, 71, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'absolute', top: -15, right: -15, fontSize: '6.5rem', opacity: 0.25 }}>👑</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 900,
            padding: '4px 12px',
            borderRadius: '16px',
            boxShadow: '0 0 12px #ef4444',
            letterSpacing: '1px'
          }}>
            🔥 超激ムズ 裏マップ解放中！
          </span>
          <span style={{ fontSize: '0.8rem', color: '#fef08a', fontWeight: 900 }}>全5ステージ</span>
        </div>

        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏝️ 常夏ビーチ (裏) 👑
        </div>

        <div style={{ fontSize: '0.9rem', color: '#ffedd5', lineHeight: 1.5, marginBottom: '16px', fontWeight: 600 }}>
          最奥に潜む「サマーエンマ大王」を撃破せよ！<br />
          クリアで<strong style={{ color: '#fde047', fontSize: '1rem' }}>最大20,000 pt Yポイント</strong>＆超豪華報酬を獲得！
        </div>

        {/* 超デカい特注アクションボタン */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#000000',
          border: '3px solid #fef08a',
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
          <span>⚔️ 裏マップへ挑戦する！</span>
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
