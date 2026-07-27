import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Sparkles, BookOpen, CalendarDays, Bell, Gift, X, HelpCircle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CHARACTERS } from '../data/characters';
import { STAGES } from '../data/stages';
import { TutorialModal } from '../components/TutorialModal';

const NEWS_ITEMS = [
  "🎉【新機能】ワールドマップ追加！ウラステージも探してみてね！",
  "🌟 ガシャで新SSキャラが確率アップ中！",
  "🎁 毎日ログインして豪華ボーナスをもらおう！",
];

const Home = () => {
  const navigate = useNavigate();
  const { characters, clearedStages, team, addYPoints, addMoney } = useGame();

  const ownedCount   = Object.keys(characters).length;
  const totalCount   = CHARACTERS.length;
  const clearedCount = (clearedStages || []).length;
  const totalStages  = STAGES.filter(s => !s.isHidden).length;

  const progressPct  = Math.round((clearedCount / totalStages) * 100);

  const [newsIndex, setNewsIndex] = useState(0);
  const [showDaily, setShowDaily] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTeamWarning, setShowTeamWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex(p => (p + 1) % NEWS_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    if (lastLogin !== today) {
      setShowDaily(true);
      localStorage.setItem('lastLoginDate', today);
    }

    const tutorialDone = localStorage.getItem('tutorial_completed');
    if (!tutorialDone) {
      setShowTutorial(true);
    }
  }, []);

  const claimDaily = () => {
    addYPoints(50);
    addMoney(100);
    setShowDaily(false);
  };

  const handlePlayClick = () => {
    if (team.length < 5) {
      setShowTeamWarning(true);
      return;
    }
    navigate('/stages');
  };

  return (
    <div className="view-container" style={{ gap: '15px', padding: '20px 20px', position: 'relative' }}>
      
      {/* ── News Banner & Tutorial Button ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <Bell size={18} color="#ffcc00" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {NEWS_ITEMS[newsIndex]}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowTutorial(true)}
          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, height: '100%' }}
          title="遊び方を見る"
        >
          <HelpCircle size={18} color="#ffcc00" />
          <span>遊び方</span>
        </button>
      </div>

      {/* ── Progress Card ── */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.95)' }}>
        <h3 className="text-outline" style={{ margin: '0 0 15px', fontSize: '1.2rem', color: '#ff7700', letterSpacing: '0.05em' }}>
          冒険の記録
        </h3>

        {/* Stage progress */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem', fontWeight: 'bold', color: '#004488' }}>
            <span>⚔️ ステージクリア</span>
            <span style={{ color: '#ff3366' }}>{clearedCount} / {totalStages}</span>
          </div>
          <div style={{ height: '14px', background: '#bbddff', borderRadius: '10px', overflow: 'hidden', border: '2px solid #0088cc' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #ffaa00, #ff3366)',
              borderRadius: '8px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Character count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#004488' }}>
          <span>👾 ぷにコレクション</span>
          <span style={{ color: '#ff9900' }}>{ownedCount} / {totalCount} 体</span>
        </div>
      </div>

      {/* ── Main play button ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          style={{ 
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            flexDirection: 'column', 
            gap: '12px', 
            borderWidth: '8px',
            boxShadow: '0 12px 0 var(--btn-orange-border), 0 15px 10px rgba(0,0,0,0.4)',
            marginBottom: '10px'
          }}
          onClick={handlePlayClick}
        >
          <Play size={60} fill="white" style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))', marginLeft: '10px' }} />
          <span className="text-outline" style={{ fontWeight: '900', fontSize: '2rem', marginTop: '-10px' }}>プレイ！</span>
          {clearedCount > 0 && (
            <span style={{ fontSize: '0.9rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.5)' }}>
              ステージ {clearedCount} までクリア
            </span>
          )}
        </button>
      </div>

      {/* ── Secondary buttons ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '15px 5px', flexDirection: 'column', gap: '8px' }}
          onClick={() => navigate('/team')}
        >
          <Users size={28} />
          <span className="text-outline" style={{ fontSize: '0.9rem' }}>妖怪ぷに</span>
        </button>
        
        <button
          className="btn btn-primary"
          style={{ padding: '15px 5px', flexDirection: 'column', gap: '8px' }}
          onClick={() => navigate('/gacha')}
        >
          <Sparkles size={28} />
          <span className="text-outline" style={{ fontSize: '0.9rem' }}>妖怪ガシャ</span>
        </button>
        
        <button
          className="btn btn-green"
          style={{ padding: '15px 5px', flexDirection: 'column', gap: '8px' }}
          onClick={() => navigate('/collection')}
        >
          <BookOpen size={28} />
          <span className="text-outline" style={{ fontSize: '0.9rem' }}>大辞典</span>
        </button>

        <button
          className="btn btn-y-point"
          style={{ padding: '15px 5px', flexDirection: 'column', gap: '8px', position: 'relative' }}
          onClick={() => navigate('/event')}
        >
          <div style={{ position: 'absolute', top: -5, right: -5, background: '#ff2255', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900, border: '2px solid white' }}>NEW</div>
          <CalendarDays size={28} />
          <span className="text-outline" style={{ fontSize: '0.9rem' }}>イベント</span>
        </button>
      </div>

      {/* ── Daily Login Modal ── */}
      {/* Debug Menu accessed via Console openDebug("puni") */}

      {/* ── Daily Login Modal ── */}
      {showDaily && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '80%', padding: '20px', textAlign: 'center', position: 'relative', animation: 'popIn 0.5s ease-out' }}>
            <button onClick={() => setShowDaily(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <Gift size={60} color="#ff2255" style={{ margin: '0 auto 10px', filter: 'drop-shadow(0 0 10px rgba(255,34,85,0.8))' }} />
            <h2 style={{ color: '#ffcc00', margin: '0 0 10px', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>ログインボーナス！</h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>今日も遊んでくれてありがとう！<br/>プレゼントを受け取ってね！</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,165,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>🔶</div>
                <div style={{ color: '#ffaa00', fontWeight: 'bold' }}>50 Ypt</div>
              </div>
              <div style={{ background: 'rgba(100,200,100,0.2)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>💰</div>
                <div style={{ color: '#88dd88', fontWeight: 'bold' }}>100 コイン</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={claimDaily} style={{ width: '100%', padding: '12px' }}>
              受け取る
            </button>
          </div>
        </div>
      )}

      {/* ── Tutorial Modal ── */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {/* ── Team Warning Modal ── */}
      {showTeamWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(40,15,20,0.95), rgba(20,10,25,0.95))', border: '2px solid #ff2255', borderRadius: '20px', boxShadow: '0 0 20px rgba(255,34,85,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ color: '#ff2255', margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 900 }}>妖怪が不足しています！</h3>
            <p style={{ fontSize: '0.85rem', color: '#eee', marginBottom: '20px', lineHeight: 1.6 }}>
              ステージをプレイするには<br />
              <strong style={{ color: '#ffcc00', fontSize: '1rem' }}>5体の妖怪</strong>をチームに編成する必要があります。<br />
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>（現在: {team.length} / 5 体）</span>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }} onClick={() => setShowTeamWarning(false)}>
                閉じる
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', backgroundColor: '#ff2255', borderColor: '#ff2255' }} onClick={() => navigate('/team')}>
                チーム編成へ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
