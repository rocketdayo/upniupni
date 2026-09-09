import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Gift, Calendar, Award } from 'lucide-react';
import { CURRENT_EVENTS } from '../data/events';
import { useGame } from '../store/GameContext';
import { getTodayDailyMissions } from '../data/dailyMissions';

const MissionList = () => {
  const navigate = useNavigate();
  const {
    missionProgress,
    completedMissions,
    claimMission,
    dailyMissionsProgress = {},
    dailyMissionsCompleted = [],
    claimDailyMission,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'daily' | 'event'>('daily');

  const eventMissions = CURRENT_EVENTS.flatMap(e =>
    e.missions.map(m => ({ ...m, eventTitle: e.title, eventEmoji: e.emoji }))
  );

  const todayDailyMissions = getTodayDailyMissions();

  const isDailyTab = activeTab === 'daily';
  const displayMissions = isDailyTab
    ? todayDailyMissions.map(m => ({ ...m, eventTitle: '毎日更新', eventEmoji: '📅' }))
    : eventMissions;

  return (
    <div className="view-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <button className="btn btn-secondary" onClick={() => { if (window.history.length > 2) { navigate(-1); } else { navigate('/home'); } }} style={{ padding: '8px 12px' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0 }}>📋 ミッション一覧</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <button
          className="btn"
          style={{
            flex: 1,
            padding: '10px',
            background: isDailyTab ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#334155',
            borderColor: isDailyTab ? '#10b981' : '#475569',
            color: 'white',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            boxShadow: isDailyTab ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
          }}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={16} />
          デイリー
        </button>
        <button
          className="btn"
          style={{
            flex: 1,
            padding: '10px',
            background: !isDailyTab ? 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)' : '#334155',
            borderColor: !isDailyTab ? '#ea580c' : '#475569',
            color: 'white',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            boxShadow: !isDailyTab ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'none',
          }}
          onClick={() => setActiveTab('event')}
        >
          <Award size={16} />
          イベント
        </button>
      </div>

      {/* Mission Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayMissions.map(mission => {
          const progress = isDailyTab
            ? (dailyMissionsProgress[mission.id] || 0)
            : (missionProgress[mission.id] || 0);

          const isClaimed = isDailyTab
            ? dailyMissionsCompleted.includes(mission.id)
            : completedMissions.includes(mission.id);

          const isComplete = progress >= mission.goal;
          const pct = Math.min(100, (progress / mission.goal) * 100);

          return (
            <div
              key={mission.id}
              className="glass-panel"
              style={{
                padding: '15px',
                opacity: isClaimed ? 0.6 : 1,
                border: isComplete && !isClaimed ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
                background: isComplete && !isClaimed ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0,0,0,0.4)',
              }}
            >
              {/* Mission Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#ffd700', marginBottom: '2px', fontWeight: 800 }}>
                    {mission.eventEmoji} {mission.eventTitle}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#fff' }}>{mission.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{mission.description}</div>
                </div>
                {isClaimed ? (
                  <div style={{ background: '#10b981', borderRadius: '20px', padding: '6px 12px', fontSize: '0.8rem', color: 'white', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <Check size={14} /> 受取済
                  </div>
                ) : isComplete ? (
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.85rem',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderColor: '#f59e0b',
                      animation: 'pulse 1.5s infinite',
                    }}
                    onClick={() => {
                      if (isDailyTab) {
                        claimDailyMission(mission.id);
                      } else {
                        claimMission(mission.id);
                      }
                    }}
                  >
                    <Gift size={14} style={{ marginRight: '4px' }} />
                    受け取る
                  </button>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', flexShrink: 0, fontWeight: 800 }}>
                    {progress}/{mission.goal}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: isClaimed ? '#10b981' : isComplete ? '#ffd700' : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Rewards */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {mission.rewardYPoints && (
                  <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                    🔶 {mission.rewardYPoints} Ypt
                  </div>
                )}
                {mission.rewardMoney && (
                  <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                    💰 {mission.rewardMoney}
                  </div>
                )}
                {mission.rewardItems?.expSmall && (
                  <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
                    🔮 経験値だま小×{mission.rewardItems.expSmall}
                  </div>
                )}
                {mission.rewardItems?.expLarge && (
                  <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#a78bfa', fontWeight: 700 }}>
                    ✨ 経験値だま大×{mission.rewardItems.expLarge}
                  </div>
                )}
                {mission.rewardItems?.skillBook && (
                  <div style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#facc15', fontWeight: 700 }}>
                    📖 秘伝書×{mission.rewardItems.skillBook}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MissionList;
