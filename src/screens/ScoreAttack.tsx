import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../store/GameContext';
import { ArrowLeft, Trophy, Play, Award, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Gift, X } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  score: number;
  title: string;
  isPlayer?: boolean;
}

interface RewardInfo {
  rankRange: string;
  tierName: string;
  badgeColor: string;
  rewards: string[];
}

interface ScoreRewardInfo {
  scoreReq: string;
  rewards: string[];
}

const RANK_REWARDS: RewardInfo[] = [
  {
    rankRange: '1位',
    tierName: '神覇者 (ZZZ級)',
    badgeColor: '#f59e0b',
    rewards: ['Yポイント x10,000', '神ひっさつの秘伝書 x5', '超限界突破の書 x3', '特別称号「神覇者」']
  },
  {
    rankRange: '2位 ～ 3位',
    tierName: '超神エリート (ZZ級)',
    badgeColor: '#ef4444',
    rewards: ['Yポイント x5,000', '神ひっさつの秘伝書 x3', '超限界突破の書 x1']
  },
  {
    rankRange: '4位 ～ 5位',
    tierName: '超マスター (Z級)',
    badgeColor: '#a855f7',
    rewards: ['Yポイント x3,000', 'ひっさつの秘伝書 x3', '大けいけんちだま x10']
  },
  {
    rankRange: '6位 ～ 8位',
    tierName: 'エキスパート (SSS級)',
    badgeColor: '#3b82f6',
    rewards: ['Yポイント x1,500', 'ひっさつの秘伝書 x2', '大けいけんちだま x5']
  },
  {
    rankRange: '9位 ～ 10位',
    tierName: 'チャレンジャー (SS級)',
    badgeColor: '#10b981',
    rewards: ['Yポイント x800', 'ひっさつの秘伝書 x1', '小けいけんちだま x5']
  },
  {
    rankRange: '11位以下（記録あり）',
    tierName: '参加賞',
    badgeColor: '#6b7280',
    rewards: ['Yポイント x300', '小けいけんちだま x3']
  }
];

const SCORE_MILESTONE_REWARDS: ScoreRewardInfo[] = [
  { scoreReq: '10万 pt', rewards: ['Yポイント x100'] },
  { scoreReq: '100万 pt', rewards: ['Yポイント x300', '小けいけんちだま x1'] },
  { scoreReq: '1億 pt', rewards: ['Yポイント x500', 'ひっさつの秘伝書 x1'] },
  { scoreReq: '1000億 pt', rewards: ['Yポイント x1,000', '神ひっさつの秘伝書 x1'] },
  { scoreReq: '10兆 pt', rewards: ['Yポイント x3,000', '神ひっさつの秘伝書 x2'] },
  { scoreReq: '1000兆 pt', rewards: ['Yポイント x5,000', '超限界突破の書 x1'] },
];

const formatLargeScore = (score: number) => {
  if (score <= 0) return '0 pt';
  if (score >= 1e16) {
    const kyo = (score / 1e16).toFixed(2);
    return `${kyo}京 pt`;
  }
  if (score >= 1e12) {
    const cho = (score / 1e12).toFixed(2);
    return `${cho}兆 pt`;
  }
  if (score >= 1e8) {
    const oku = (score / 1e8).toFixed(1);
    return `${oku}億 pt`;
  }
  if (score >= 1e4) {
    const man = (score / 1e4).toFixed(0);
    return `${man}万 pt`;
  }
  return `${score.toLocaleString()} pt`;
};

const ScoreAttack: React.FC = () => {
  const navigate = useNavigate();
  const { scoreAttackHighScore, selectedTitle = '新米妖怪レーサー' } = useGame();
  const playerHighScore = scoreAttackHighScore || 0;
  const [showRules, setShowRules] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardTab, setRewardTab] = useState<'rank' | 'score'>('rank');

  // Top tier Yokai themed rivals with trillion+ scores
  const baseRivals: LeaderboardEntry[] = [
    { name: '👑 暴走エンマ様ガチ勢', score: 5000000000000000, title: 'ZZZ級', isPlayer: false }, // 5000兆
    { name: '⚔️ 創世神極み', score: 2500000000000000, title: 'ZZZ級', isPlayer: false }, // 2500兆
    { name: '🐉 覇邪の邪龍神推し', score: 1200000000000000, title: 'ZZ級', isPlayer: false }, // 1200兆
    { name: '🌌 冥王神ハデス乱舞', score: 800000000000000, title: 'ZZ級', isPlayer: false }, // 800兆
    { name: '❄️ 極ふぶき姫極限カンスト', score: 350000000000000, title: 'Z級', isPlayer: false }, // 350兆
    { name: '⚡ アルティメット龍神', score: 100000000000000, title: 'Z級', isPlayer: false }, // 100兆
    { name: '🔥 阿修羅王連撃', score: 10000000000000, title: 'Z級', isPlayer: false }, // 10兆
    { name: '🍫 ジバニャン神伝承', score: 1000000000000, title: 'SSS級', isPlayer: false }, // 1兆
    { name: '🐍 覚醒オロチ一門', score: 100000000000, title: 'SSS級', isPlayer: false }, // 1000億
    { name: '👻 ウィスパー奇跡の一撃', score: 1000000000, title: 'SS級', isPlayer: false }, // 10億
  ];

  // Merge player score and sort
  const allLeaderboard: LeaderboardEntry[] = [
    ...baseRivals,
    { name: `👤 【${selectedTitle}】 あなた`, score: playerHighScore, title: 'あなた', isPlayer: true }
  ].sort((a, b) => b.score - a.score);

  // Find player index to calculate tier and display badge
  const playerRank = allLeaderboard.findIndex(x => x.isPlayer) + 1;

  // Reward tier calculation based on rank
  let tierName = '未参戦';
  let tierColor = '#888';
  let rewardText = 'スコアタに参戦して上位報酬をゲットしよう！';

  if (playerHighScore > 0) {
    if (playerRank === 1) {
      tierName = '神覇者 (Tier ZZZ)';
      tierColor = '#f59e0b';
      rewardText = '毎週 Yポイントx10,000、神ひっさつの秘伝書x5、超限界突破の書x3';
    } else if (playerRank <= 3) {
      tierName = '超神エリート (Tier ZZ)';
      tierColor = '#ef4444';
      rewardText = '毎週 Yポイントx5,000、神ひっさつの秘伝書x3';
    } else if (playerRank <= 5) {
      tierName = '超マスター (Tier Z)';
      tierColor = '#a855f7';
      rewardText = '毎週 Yポイントx3,000、ひっさつの秘伝書x3';
    } else if (playerRank <= 8) {
      tierName = 'エキスパート (Tier SSS)';
      tierColor = '#3b82f6';
      rewardText = '毎週 Yポイントx1,500、ひっさつの秘伝書x2';
    } else {
      tierName = 'チャレンジャー (Tier SS)';
      tierColor = '#10b981';
      rewardText = '毎週 Yポイントx800、ひっさつの秘伝書x1';
    }
  }

  return (
    <div className="view-container" style={{
      padding: '16px',
      background: 'linear-gradient(180deg, #1e1b4b 0%, #090514 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#fff'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, letterSpacing: '0.05em', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={22} color="#ffd700" /> スコアアタック
          </h1>
        </div>

        {/* Reward List Button */}
        <button
          onClick={() => setShowRewardsModal(true)}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
          }}
        >
          <Gift size={16} /> 報酬一覧
        </button>
      </div>

      {/* Main Scoring Card */}
      <div className="glass-panel" style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '2px solid #eab308',
        borderRadius: '20px',
        padding: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '14px',
        boxShadow: '0 8px 24px rgba(234, 179, 8, 0.15)'
      }}>
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'radial-gradient(circle, rgba(234,179,8,0.2) 0%, transparent 70%)', filter: 'blur(10px)' }} />

        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          YOUR HIGH SCORE
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 950, color: '#00ffcc', fontFamily: 'monospace', textShadow: '0 0 12px rgba(0,255,200,0.4)', margin: '0 0 4px 0', wordBreak: 'break-all' }}>
          {formatLargeScore(playerHighScore)}
        </div>
        {playerHighScore > 0 && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '8px' }}>
            ({playerHighScore.toLocaleString()} pt)
          </div>
        )}

        {playerHighScore > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>順位:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: tierColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={15} /> {playerRank}位 / {tierName}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 'bold' }}>
            ⚠️ まだスコアタに参戦していません
          </div>
        )}
      </div>

      {/* Tier rewards description */}
      {playerHighScore > 0 && (
        <div style={{
          background: 'rgba(124, 58, 237, 0.15)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Sparkles size={20} color="#a855f7" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 'bold' }}>今期の予想報酬:</div>
            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 800 }}>{rewardText}</div>
          </div>
        </div>
      )}

      {/* Leaderboard Section Header */}
      <h2 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f3f4f6', margin: '0 0 8px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Trophy size={16} color="#fbbf24" /> 全サーバ・リアルタイムランキング
      </h2>
      
      {/* Expanded Leaderboard Box */}
      <div style={{
        background: 'rgba(15, 12, 30, 0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px',
        padding: '8px',
        flex: '1 1 auto',
        minHeight: '200px',
        marginBottom: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {allLeaderboard.map((user, idx) => {
          const rank = idx + 1;
          const isMe = user.isPlayer;

          let rankBg = isMe ? 'linear-gradient(90deg, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0.08) 100%)' : 'rgba(255,255,255,0.02)';
          if (rank === 1 && !isMe) rankBg = 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(255,215,0,0.05) 100%)';

          let medalEmoji = '';
          if (rank === 1) medalEmoji = '🥇';
          else if (rank === 2) medalEmoji = '🥈';
          else if (rank === 3) medalEmoji = '🥉';

          return (
            <div
              key={user.name + idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                background: rankBg,
                border: isMe ? '1.5px solid #eab308' : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  width: '28px',
                  textAlign: 'center',
                  color: rank <= 3 ? '#fbbf24' : '#9ca3af',
                  flexShrink: 0
                }}>
                  {medalEmoji || `${rank}`}
                </span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: isMe ? 900 : 700,
                    color: isMe ? '#fbbf24' : '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: rank <= 3 ? '#fef08a' : '#9ca3af', fontWeight: 'bold' }}>
                    {user.title}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', flexShrink: 0, paddingLeft: '8px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: isMe ? '#00ffcc' : (rank <= 3 ? '#fef08a' : '#e2e8f0') }}>
                  {formatLargeScore(user.score)}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#888' }}>
                  {user.score.toLocaleString()} pt
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion Rules Block */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '10px 14px',
        marginBottom: '12px'
      }}>
        <button
          onClick={() => setShowRules(!showRules)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#fbbf24',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={15} /> スコアアタックのルール・仕様
          </span>
          {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showRules && (
          <ul style={{ fontSize: '0.75rem', color: '#d1d5db', paddingLeft: '18px', margin: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>制限時間は<strong>60秒</strong>！</li>
            <li>ボスは<strong>実質無限のHP</strong>を誇る超強敵。</li>
            <li>敵に与えたダメージ量に応じて最終スコアが算出されます。</li>
            <li>必殺技発動中、及びフィーバー中はタイマー進行が一時停止！</li>
            <li>毎週日曜日に集計・リセットされ、豪華報酬が配布されます！</li>
          </ul>
        )}
      </div>

      {/* Launch Button */}
      <button
        onClick={() => navigate('/game/score_attack')}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
          border: 'none',
          borderRadius: '16px',
          padding: '14px',
          fontWeight: 950,
          fontSize: '1.05rem',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(234,179,8,0.35)',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <Play size={20} fill="#000" /> 出撃！スコアタ特設ステージ
      </button>

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #1f1a3a 0%, #0d0a1a 100%)',
            border: '2px solid #a855f7',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(168,85,247,0.4)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(168,85,247,0.15)'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={20} color="#a855f7" /> スコアタ報酬一覧
              </div>
              <button
                onClick={() => setShowRewardsModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={() => setRewardTab('rank')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: rewardTab === 'rank' ? 'rgba(168,85,247,0.25)' : 'transparent',
                  border: 'none',
                  borderBottom: rewardTab === 'rank' ? '2px solid #a855f7' : '2px solid transparent',
                  color: rewardTab === 'rank' ? '#fff' : '#9ca3af',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                👑 ランキング順位報酬
              </button>
              <button
                onClick={() => setRewardTab('score')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: rewardTab === 'score' ? 'rgba(168,85,247,0.25)' : 'transparent',
                  border: 'none',
                  borderBottom: rewardTab === 'score' ? '2px solid #a855f7' : '2px solid transparent',
                  color: rewardTab === 'score' ? '#fff' : '#9ca3af',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🎯 スコア達成報酬
              </button>
            </div>

            {/* Modal Content List */}
            <div style={{ padding: '14px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rewardTab === 'rank' ? (
                RANK_REWARDS.map((info, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>
                        {info.rankRange}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        color: info.badgeColor,
                        background: 'rgba(0,0,0,0.4)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        border: `1px solid ${info.badgeColor}`
                      }}>
                        {info.tierName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {info.rewards.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            fontSize: '0.75rem',
                            color: '#e2e8f0',
                            background: 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.3)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                        >
                          🎁 {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                SCORE_MILESTONE_REWARDS.map((info, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047' }}>
                        {info.scoreReq} 達成
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {info.rewards.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            fontSize: '0.75rem',
                            color: '#e2e8f0',
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                        >
                          ✨ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setShowRewardsModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreAttack;

