import React, { useState } from 'react';
import { X, Settings, ArrowRightLeft, Gift, HelpCircle, Newspaper, Copy, Check, Shield } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { DataTransferModal } from './DataTransferModal';
import { SerialCodeModal } from './SerialCodeModal';
import { TutorialModal } from './TutorialModal';
import { NewsModal } from './NewsModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { uid } = useGame();

  const [isDataTransferOpen, setIsDataTransferOpen] = useState(false);
  const [isSerialOpen, setIsSerialOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  const [copiedUid, setCopiedUid] = useState(false);

  if (!isOpen) return null;

  const displayUid = uid || 'PUNI-LOCAL-PLAYER';

  const handleCopyUid = () => {
    navigator.clipboard.writeText(displayUid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        background: 'rgba(0, 0, 0, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, rgba(24, 24, 32, 0.98), rgba(12, 12, 18, 0.98))',
          border: '2px solid #6366f1',
          borderRadius: '20px',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* ヘッダー */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={22} color="#818cf8" />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>
                設定メニュー
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* メニューオプション一覧 */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* 1. データ引き継ぎ (移行) ボタン */}
            <button
              onClick={() => setIsDataTransferOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
                border: '2px solid #3b82f6',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                transition: 'transform 0.1s'
              }}
            >
              <div style={{
                background: '#2563eb',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ArrowRightLeft size={22} color="#ffffff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>データ引き継ぎ・移行</span>
                  <Shield size={14} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                  暗号化コードとパスワードで安全にデータを引継ぎ
                </div>
              </div>
            </button>

            {/* 2. シリアルコード入力 */}
            <button
              onClick={() => setIsSerialOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Gift size={20} color="#ffffff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fde047' }}>
                  シリアルコード入力
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                  あいことばを入力して限定プレゼントを獲得
                </div>
              </div>
            </button>

            {/* 3. 遊び方 */}
            <button
              onClick={() => setIsTutorialOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HelpCircle size={20} color="#ffffff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#34d399' }}>
                  遊び方・ヘルプ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                  パズルのルールやひっさつ技の仕様を確認
                </div>
              </div>
            </button>

            {/* 4. ニュース・お知らせ */}
            <button
              onClick={() => setIsNewsOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Newspaper size={20} color="#ffffff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f472b6' }}>
                  ニュース・アプデ情報
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
                  最新の更新内容やイベント告知の一覧
                </div>
              </div>
            </button>

            {/* プレイヤーID表示 */}
            <div style={{
              background: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '6px'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800 }}>PLAYER ID (UID)</div>
                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 800, marginTop: '2px' }}>
                  {displayUid}
                </div>
              </div>
              <button
                onClick={handleCopyUid}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#e2e8f0',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                {copiedUid ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copiedUid ? '完了' : 'コピー'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* モーダル群 */}
      <DataTransferModal isOpen={isDataTransferOpen} onClose={() => setIsDataTransferOpen(false)} />
      <SerialCodeModal isOpen={isSerialOpen} onClose={() => setIsSerialOpen(false)} />
      {isTutorialOpen && <TutorialModal onClose={() => setIsTutorialOpen(false)} />}
      {isNewsOpen && <NewsModal onClose={() => setIsNewsOpen(false)} />}
    </>
  );
};
