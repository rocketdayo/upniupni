import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  Coins,
  Users,
  Package,
  Sliders,
  CheckCircle2,
  Lock,
  Terminal,
  KeyRound,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';
import { useGame } from '../store/GameContext';
import { CHARACTERS, getCharacterMaxLevel } from '../data/characters';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { generateSerialCode } from '../utils/serialCode';

export const DebugConsoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    money,
    yPoints,
    characters,
    clearedStages,
    addMoney,
    addYPoints,
    unlockCharacter,
    unlockAllCharacters,
    unlockAllStages,
    addMaxItems,
  } = useGame();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 初期読み込み時の認証判定
  useEffect(() => {
    const unlocked = sessionStorage.getItem('debug_unlocked') === 'true';
    if (unlocked) {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlockWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['puni', 'nyanko', 'debug', 'cheat', 'yokai'];
    if (validCodes.includes(passcode.trim().toLowerCase())) {
      sessionStorage.setItem('debug_unlocked', 'true');
      setIsUnlocked(true);
      setErrorMsg(null);
      showToast('デバッグモードの認証に成功しました！');
    } else {
      setErrorMsg('合言葉が違います。デベロッパーツール(Console)で openDebug("puni") を実行するか正しい合言葉を入力してください。');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // カスタム加算フォーム用
  const [customMoney, setCustomMoney] = useState<number>(100000);
  const [selectedCharId, setSelectedCharId] = useState<string>(CHARACTERS[0].id);

  // シリアルコード生成フォーム用
  const [genTitle, setGenTitle] = useState<string>('特別プレゼント');
  const [genYPoints, setGenYPoints] = useState<number>(5000);
  const [genMoney, setGenMoney] = useState<number>(10000);
  const [genExpSmall, setGenExpSmall] = useState<number>(3);
  const [genExpLarge, setGenExpLarge] = useState<number>(1);
  const [genSkillBook, setGenSkillBook] = useState<number>(1);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCreateCode = () => {
    const code = generateSerialCode({
      title: genTitle,
      yPoints: genYPoints,
      money: genMoney,
      items: {
        expSmall: genExpSmall,
        expLarge: genExpLarge,
        skillBook: genSkillBook,
      },
    });
    setGeneratedCode(code);
    setCopied(false);
    showToast('暗号化シリアルコードを生成しました！');
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    showToast('シリアルコードをクリップボードにコピーしました！');
    setTimeout(() => setCopied(false), 2000);
  };

  // ロック中（未認証）画面
  if (!isUnlocked) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        background: 'linear-gradient(135deg, #0f0c20, #1a102f)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(25, 20, 45, 0.95)',
          border: '2px solid #ff2255',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(255, 34, 85, 0.3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 34, 85, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ff2255'
          }}>
            <Lock size={32} color="#ff2255" />
          </div>

          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#ffcc00' }}>
              デバッグコンソール保護中
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: 1.5 }}>
              この画面は開発者専用ツールです。<br />
              デベロッパーツールで特定のコマンドを実行するか、合言葉を入力して解除してください。
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '12px',
            borderRadius: '8px',
            borderLeft: '4px solid #00ccff',
            textAlign: 'left',
            width: '100%',
            fontSize: '0.75rem',
            color: '#00ccff',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              <Terminal size={14} /> デベロッパーツール (Console) のコマンド:
            </div>
            <code style={{ background: '#111', padding: '6px 8px', borderRadius: '4px', color: '#00ff88', fontFamily: 'monospace' }}>
              openDebug("puni")
            </code>
          </div>

          <form onSubmit={handleUnlockWithPasscode} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="合言葉を入力..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#111',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ff2255',
                  borderColor: '#ff5588'
                }}
              >
                <KeyRound size={16} /> 解除
              </button>
            </div>

            {errorMsg && (
              <div style={{ fontSize: '0.75rem', color: '#ff4444', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> {errorMsg}
              </div>
            )}
          </form>

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/home')}
            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // 選択されたキャラの定義を取得
  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];
  const maxLvForSelectedChar = getCharacterMaxLevel(selectedChar.rank, 5);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      background: '#12121e',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '30px'
    }}>
      {/* ヘッダー */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
        background: '#1a1a2e',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #333'
      }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => navigate('/home')}
        >
          <ArrowLeft size={16} /> ホームへ戻る
        </button>

        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={20} color="#ffcc00" />
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffcc00' }}>
            開発者用デバッグメニュー
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 'bold' }}>
          🔓 認証済み
        </div>
      </div>

      {/* 通知トースト */}
      {toastMsg && (
        <div style={{
          background: '#00cc66',
          color: '#fff',
          textAlign: 'center',
          padding: '8px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>

        {/* 1. 現在のステータス概要 */}
        <div style={{
          background: '#1f1f38',
          border: '1px solid #3d3d66',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#00ccff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={18} /> 現在のセーブデータ状況
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ background: '#141428', padding: '8px 10px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa' }}>Yマネー:</span> <b style={{ color: '#ffcc00' }}>${money.toLocaleString()}</b>
            </div>
            <div style={{ background: '#141428', padding: '8px 10px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa' }}>Yポイント:</span> <b style={{ color: '#ffaa00' }}>{yPoints.toLocaleString()} pt</b>
            </div>
            <div style={{ background: '#141428', padding: '8px 10px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa' }}>所持妖怪:</span> <b style={{ color: '#00ff88' }}>{Object.keys(characters).length} / {CHARACTERS.length} 体</b>
            </div>
            <div style={{ background: '#141428', padding: '8px 10px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa' }}>クリアステージ:</span> <b style={{ color: '#00ccff' }}>{clearedStages.length} 個</b>
            </div>
          </div>
        </div>

        {/* 2. マネー・通貨デバッグ */}
        <div style={{
          background: '#1f1f38',
          border: '1px solid #ffcc00',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ffcc00', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={18} /> 通貨（マネー・Yポイント）操作
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                addMoney(100000);
                showToast('Yマネー +100,000 付与しました');
              }}
              style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#00aa55', borderColor: '#00cc66' }}
            >
              💵 Yマネー +100,000
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                addYPoints(50000);
                showToast('Yポイント +50,000 付与しました');
              }}
              style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#ff8800', borderColor: '#ffaa00' }}
            >
              🌟 Yポイント +50,000
            </button>
          </div>

          {/* 自由入力設定 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #333', paddingTop: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                value={customMoney}
                onChange={e => setCustomMoney(Number(e.target.value))}
                style={{ flex: 1, padding: '8px', background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                placeholder="数値指定"
              />
              <button
                className="btn btn-secondary"
                onClick={() => {
                  addMoney(customMoney);
                  showToast(`Yマネー +${customMoney.toLocaleString()} 付与しました`);
                }}
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              >
                マネー加算
              </button>
            </div>
          </div>
        </div>

        {/* 3. キャラクター一括解放＆個別の取得 */}
        <div style={{
          background: '#1f1f38',
          border: '1px solid #ff2255',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ff5588', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} /> 妖怪キャラクター解放＆レベル上限解放
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              unlockAllCharacters();
              showToast('全妖怪の解放＆各Rankの最大レベル（SS:Lv.110, S:Lv.100等）適用！');
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ff2255',
              borderColor: '#ff5588',
              fontSize: '0.88rem',
              fontWeight: 900,
              marginBottom: '12px'
            }}
          >
            ✨ 全妖怪を一括解放＆限界突破5・最大レベル化
          </button>

          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '6px' }}>個別キャラ選択＆最大強化解放:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#141428', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* キャラ画像プレビュー */}
              <CharacterAvatar character={selectedChar} size={44} />

              <select
                value={selectedCharId}
                onChange={e => setSelectedCharId(e.target.value)}
                style={{
                  flex: 1,
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '0.8rem'
                }}
              >
                {CHARACTERS.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.rank}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#ffcc00' }}>
              適用レベル: <b>Lv.{maxLvForSelectedChar} (限界突破5上限)</b>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => {
                unlockCharacter(selectedCharId);
                showToast(`${selectedChar.name} を解放＆最大上限(Lv.${maxLvForSelectedChar})まで育成しました！`);
              }}
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            >
              この妖怪を最大育成で解放
            </button>
          </div>
        </div>

        {/* 4. ステージ・アイテム解放 */}
        <div style={{
          background: '#1f1f38',
          border: '1px solid #00ccff',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#00ccff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={18} /> ステージ＆育成アイテム
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                unlockAllStages();
                showToast('全ステージをクリア開放しました');
              }}
              style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#0088ff', borderColor: '#00aaff' }}
            >
              🔓 全ステージクリア開放
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                addMaxItems();
                showToast('育成アイテム（経験値玉・秘伝書）を各99個付与しました');
              }}
              style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#00aaff', borderColor: '#33ccff' }}
            >
              🧪 育成アイテム 各99個
            </button>
          </div>
        </div>

        {/* 5. シリアルコード生成ツール */}
        <div style={{
          background: '#1f1f38',
          border: '1px solid #fbbf24',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fbbf24', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={18} /> 暗号化シリアルコード生成ツール
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: '#aaa' }}>コードタイトル（任意）:</label>
              <input
                type="text"
                value={genTitle}
                onChange={e => setGenTitle(e.target.value)}
                style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                placeholder="例: 豪華ログイン特典"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#ffaa00' }}>🌟 Yポイント:</label>
                <input
                  type="number"
                  value={genYPoints}
                  onChange={e => setGenYPoints(Number(e.target.value))}
                  style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#00cc66' }}>💵 yマネー:</label>
                <input
                  type="number"
                  value={genMoney}
                  onChange={e => setGenMoney(Number(e.target.value))}
                  style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#aaa' }}>小けいけんち:</label>
                <input
                  type="number"
                  value={genExpSmall}
                  onChange={e => setGenExpSmall(Number(e.target.value))}
                  style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#aaa' }}>大けいけんち:</label>
                <input
                  type="number"
                  value={genExpLarge}
                  onChange={e => setGenExpLarge(Number(e.target.value))}
                  style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#ff5588' }}>秘伝書:</label>
                <input
                  type="number"
                  value={genSkillBook}
                  onChange={e => setGenSkillBook(Number(e.target.value))}
                  style={{ background: '#111', border: '1px solid #555', color: '#fff', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <button
              onClick={handleCreateCode}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
              }}
            >
              🔑 暗号化シリアルコードを生成
            </button>

            {generatedCode && (
              <div style={{
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '10px',
                marginTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>生成されたコード（クリックしてコピー）:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#030712',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #1f2937'
                }}>
                  <code style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    color: '#fbbf24',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}>
                    {generatedCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    style={{
                      background: copied ? '#22c55e' : '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? '完了' : 'コピー'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
