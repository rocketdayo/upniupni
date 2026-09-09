import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Crown, ShoppingBag, HelpCircle, Flame } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CHARACTERS } from '../data/characters';
import type { Character } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { BleachRingShopModal } from '../components/BleachRingShopModal';

export const GodAscensionScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    characters,
    items,
    bleachRings = 0,
    ascendToZZ
  } = useGame();

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedBaseCharId, setSelectedBaseCharId] = useState<string>('');
  const [isAscending, setIsAscending] = useState<boolean>(false);
  const [rouletteChar, setRouletteChar] = useState<Character | null>(null);
  const [ascensionSuccessChar, setAscensionSuccessChar] = useState<Character | null>(null);
  const [ascensionMessage, setAscensionMessage] = useState<string>('');
  const [isNewUnlock, setIsNewUnlock] = useState<boolean>(false);
  const [detailChar, setDetailChar] = useState<Character | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const ownedStones = items?.godAscensionStone || 0;

  // Owned Z' characters that can be sacrificed for ascension
  const ownedZPrimeChars = CHARACTERS.filter(c => c.rank === "Z'" && characters[c.id]);

  // All 13 ZZ characters obtainable via ascension
  const allZZChars = CHARACTERS.filter(c => c.rank === 'ZZ');

  // Handle Ascension
  const handleStartAscension = (baseId: string) => {
    if (isAscending) return;
    if (ownedStones < 1) {
      alert('『神昇の秘石』が不足しています（必要数: 1個）。入手方法をご確認ください。');
      return;
    }
    if (!characters[baseId]) {
      alert('進化元のベースキャラクターを所持していません。');
      return;
    }

    setIsAscending(true);
    let count = 0;
    const maxCount = 22;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * allZZChars.length);
      setRouletteChar(allZZChars[randomIdx]);
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        // Execute Ascension
        const res = ascendToZZ(baseId);
        setIsAscending(false);
        setRouletteChar(null);
        if (res.success && res.targetCharId) {
          const resultChar = CHARACTERS.find(c => c.id === res.targetCharId) || null;
          setAscensionSuccessChar(resultChar);
          setAscensionMessage(res.message);
          setIsNewUnlock(!!res.isNewUnlock);
        } else {
          alert(res.message);
        }
      }
    }, 70);
  };

  const selectedBaseChar = CHARACTERS.find(c => c.id === selectedBaseCharId);

  return (
    <div
      className="view-container"
      style={{
        background: 'radial-gradient(ellipse at top, #2e1065 0%, #0f172a 50%, #020617 100%)',
        color: '#ffffff',
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto'
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/home')}
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={18} /> ホーム
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Crown size={22} color="#ffd700" />
            <h1 style={{
              margin: 0,
              fontSize: '1.4rem',
              fontWeight: 950,
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8800 50%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
            }}>
              神昇の祭壇
            </h1>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: 800, letterSpacing: '0.05em' }}>
            Z' ➔ ZZ 神昇覚醒システム
          </span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '8px 10px',
            color: '#ffd700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}
        >
          <HelpCircle size={16} /> 入手案内
        </button>
      </div>

      {/* ── Status & Currency Bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid #ffd700',
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: '2rem',
            filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))',
            animation: 'pulse 2s infinite'
          }}>💎</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>所持 神昇の秘石</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 950, color: ownedStones > 0 ? '#ffd700' : '#ef4444' }}>
              {ownedStones} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>個</span>
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '1.8rem' }}>💍</div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>所持 BLEACHリング</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f0abfc' }}>
              {bleachRings.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>個</span>
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />

        <button
          onClick={() => setIsShopOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #9333ea, #d946ef)',
            border: '1px solid #f0abfc',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(217, 70, 239, 0.3)'
          }}
        >
          <ShoppingBag size={14} /> リング交換所
        </button>
      </div>

      {/* ── How to Obtain Stones (Guide Card) ── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1.5px solid rgba(250, 204, 21, 0.4)',
        borderRadius: '16px',
        padding: '12px 14px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="#ffd700" />
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047' }}>
            『神昇の秘石』 獲得ルート（3系統対応）
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Route 1: Bleach Map */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f0abfc' }}>
                ⚔️ 虚圏特設マップ（天蓋・崩玉次元）
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                ステージ6〜8のボス初クリア報酬で秘石ドロップ！（最大4個）
              </div>
            </div>
            <button
              onClick={() => navigate('/event/bleach')}
              style={{
                background: '#7e22ce',
                border: '1px solid #d946ef',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              マップへ
            </button>
          </div>

          {/* Route 2: Score Attack */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
                🏆 スコアアタック（週間＆累計スコア報酬）
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                10兆/1000兆pt到達、または日曜週間集計の上位入賞で獲得！
              </div>
            </div>
            <button
              onClick={() => navigate('/score_attack')}
              style={{
                background: '#0369a1',
                border: '1px solid #38bdf8',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              スコアタへ
            </button>
          </div>

          {/* Route 3: Bleach Ring Shop */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffd700' }}>
                💍 BLEACHリング交換所（限定個数）
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                虚圏マップで集めたリングで秘石を即時交換可能！（限定3個）
              </div>
            </div>
            <button
              onClick={() => setIsShopOpen(true)}
              style={{
                background: '#ca8a04',
                border: '1px solid #ffd700',
                color: '#000',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              交換所を開く
            </button>
          </div>
        </div>
      </div>

      {/* ── Ascension Ritual Section ── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '2px solid #a855f7',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Flame size={20} color="#f59e0b" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#fef08a' }}>
            神昇の儀式：進化元 Z' キャラクター選択
          </h2>
        </div>

        <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
          手持ちの Z' キャラクター1体と『神昇の秘石 1個』を捧げることで、全13体の最高峰 <strong>ZZキャラクター</strong> の中からランダムで1体が神昇覚醒します！
          <br />
          <span style={{ color: '#38bdf8' }}>※ 技レベル・限界突破・スキルLvは継承・強化されます。</span>
        </p>

        {/* Owned Z' List */}
        {ownedZPrimeChars.length === 0 ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px dashed #f87171',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>⚠️</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fca5a5' }}>
              神昇進化元の Z' キャラクターを所持していません
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
              BLEACH特設ガシャや虚圏特設マップで Z'（十刃・護廷十三隊）を仲間にしよう！
            </div>
            <button
              className="btn"
              onClick={() => navigate('/gacha')}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(135deg, #d946ef, #a855f7)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 900,
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ガシャ画面へ
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
              所持中の Z' キャラクター（タップして選択）:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {ownedZPrimeChars.map(char => {
                const isSelected = selectedBaseCharId === char.id;
                const save = characters[char.id];
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedBaseCharId(char.id)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(217, 70, 239, 0.4) 100%)'
                        : 'rgba(15, 23, 42, 0.7)',
                      border: isSelected ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <CharacterAvatar character={char} size={44} showRankBadge={true} />
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      color: isSelected ? '#ffd700' : '#fff',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}>
                      {char.name}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      Lv.{save?.level || 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Base Char & Stone Requirements Card */}
        {selectedBaseChar && (
          <div style={{
            marginTop: '16px',
            background: 'rgba(0,0,0,0.4)',
            border: '1.5px solid #ffd700',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CharacterAvatar character={selectedBaseChar} size={48} showRankBadge={true} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#fef08a', fontWeight: 800 }}>選択中のベースキャラ:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#fff' }}>{selectedBaseChar.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  攻撃: {selectedBaseChar.baseAtk} / HP: {selectedBaseChar.baseHp}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>必要秘石: 1個</div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: ownedStones >= 1 ? '#86efac' : '#f87171'
                }}>
                  {ownedStones >= 1 ? '所持数充足 (OK)' : '秘石が足りません'}
                </div>
              </div>

              <button
                disabled={isAscending || ownedStones < 1}
                onClick={() => handleStartAscension(selectedBaseChar.id)}
                style={{
                  background: ownedStones >= 1
                    ? 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #dc2626 100%)'
                    : '#475569',
                  border: ownedStones >= 1 ? '2px solid #fff' : 'none',
                  color: ownedStones >= 1 ? '#000' : '#94a3b8',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 950,
                  cursor: ownedStones >= 1 ? 'pointer' : 'not-allowed',
                  boxShadow: ownedStones >= 1 ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Crown size={18} />
                <span>神昇覚醒を開始！</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── All 13 ZZ Obtainable Characters Preview ── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1.5px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '16px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={18} color="#ffd700" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#fde047' }}>
              神昇対象：最高峰 ZZキャラクター一覧（全13体・均等確率）
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            所持: <strong style={{ color: '#ffd700' }}>{allZZChars.filter(c => characters[c.id]).length}</strong> / 13体
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allZZChars.map(zzChar => {
            const isOwned = !!characters[zzChar.id];
            const zzSave = characters[zzChar.id];

            return (
              <div
                key={zzChar.id}
                onClick={() => setDetailChar(zzChar)}
                style={{
                  background: isOwned
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'rgba(15, 23, 42, 0.6)',
                  border: isOwned ? '1.5px solid #ffd700' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: isOwned ? '0 0 10px rgba(255, 215, 0, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                  <CharacterAvatar character={zzChar} size={44} showRankBadge={true} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.65rem', background: '#ffd700', color: '#000', padding: '0 4px', borderRadius: '4px', fontWeight: 900 }}>
                        ZZ
                      </span>
                      <span style={{
                        fontSize: '0.88rem',
                        color: isOwned ? '#ffd700' : '#e2e8f0',
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {zzChar.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {zzChar.skill?.name || '神域必殺技'} (威力 {zzChar.skill?.power || 4500})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                  {isOwned ? (
                    <span style={{
                      background: 'rgba(0, 255, 204, 0.2)',
                      border: '1px solid #00ffcc',
                      color: '#00ffcc',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}>
                      解放済 (Lv.{zzSave?.level || 1} / 凸{zzSave?.limitBreak || 0})
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#64748b', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '8px' }}>
                      降臨待機中
                    </span>
                  )}
                  <span style={{ fontSize: '0.65rem', color: '#ffd700' }}>詳細 ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ascension Roulette Animated Overlay ── */}
      {isAscending && rouletteChar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{
            fontSize: '1.2rem',
            color: '#ffd700',
            fontWeight: 950,
            marginBottom: '16px',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            animation: 'pulse 0.5s infinite'
          }}>
            ⚡ 神域の扉が開放中… ⚡
          </div>

          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '6px solid #ffd700',
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.9), inset 0 0 30px rgba(255, 215, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, #4c1d95 0%, #0f172a 100%)',
            transform: 'scale(1.1)',
            transition: 'transform 0.1s ease'
          }}>
            <CharacterAvatar character={rouletteChar} size={110} showRankBadge={true} />
          </div>

          <div style={{
            marginTop: '20px',
            fontSize: '1.3rem',
            fontWeight: 950,
            color: '#ffffff',
            textShadow: '0 0 15px rgba(255,255,255,0.8)'
          }}>
            {rouletteChar.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f0abfc', marginTop: '6px', fontWeight: 800 }}>
            ZZキャラクター抽選中…
          </div>
        </div>
      )}

      {/* ── Ascension Result Success Modal ── */}
      {ascensionSuccessChar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '3px solid #ffd700',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👑✨</div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '1.5rem',
              fontWeight: 950,
              color: '#ffd700',
              textShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
            }}>
              {isNewUnlock ? '新ZZキャラクター神昇覚醒！' : '限界突破・神昇完了！'}
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '16px' }}>
              神域の力を得て、新たなZZキャラクターが降臨しました！
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1.5px solid #ffd700',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <CharacterAvatar character={ascensionSuccessChar} size={90} showRankBadge={true} />
              <div>
                <span style={{ background: '#ffd700', color: '#000', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 950 }}>
                  ZZ
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#ffffff', marginTop: '4px' }}>
                  {ascensionSuccessChar.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#fef08a', marginTop: '2px' }}>
                  必殺技: {ascensionSuccessChar.skill?.name || '神域必殺技'}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              lineHeight: '1.5',
              marginBottom: '16px',
              whiteSpace: 'pre-line'
            }}>
              {ascensionMessage}
            </div>

            <button
              onClick={() => {
                setAscensionSuccessChar(null);
                setAscensionMessage('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 950,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ── ZZ Character Detail Modal ── */}
      {detailChar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div style={{
            background: '#0f172a',
            border: '2px solid #ffd700',
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '380px',
            width: '100%',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <CharacterAvatar character={detailChar} size={64} showRankBadge={true} />
              <div>
                <span style={{ background: '#ffd700', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900 }}>
                  ZZ
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 900 }}>{detailChar.name}</h3>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>種族: {detailChar.tribe}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>最大攻撃力</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f43f5e' }}>{detailChar.baseAtk.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>最大HP</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#22c55e' }}>{detailChar.baseHp.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', padding: '10px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 900 }}>
                ⚡ 神域必殺技: {detailChar.skill?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                {detailChar.skill?.description}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#fde047', marginTop: '4px', fontWeight: 800 }}>
                威力: {detailChar.skill?.power}
              </div>
            </div>

            <button
              onClick={() => setDetailChar(null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ── Bleach Ring Shop Modal ── */}
      <BleachRingShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
    </div>
  );
};
