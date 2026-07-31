import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertCircle, Gift } from 'lucide-react';
import { useGame } from '../store/GameContext';

interface SerialCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SerialCodeModal: React.FC<SerialCodeModalProps> = ({ isOpen, onClose }) => {
  const { redeemSerialCode } = useGame();
  const [inputCode, setInputCode] = useState('');
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    rewardsSummary?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = redeemSerialCode(inputCode.trim());
    setResult(res);
    if (res.success) {
      setInputCode('');
    }
  };

  const handleClose = () => {
    setResult(null);
    setInputCode('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)',
        overflow: 'hidden',
        position: 'relative',
        border: '3px solid #3b82f6'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={22} color="#fbbf24" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              シリアルコード入力
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#4b5563',
            marginBottom: '16px',
            lineHeight: '1.5',
            fontWeight: 500,
            textAlign: 'center'
          }}>
            シリアルコード（<code style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>PUNI-xxx</code> や <code style={{ background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>STAGE-SKIP-5</code> など）を入力すると、アイテム獲得や通常ステージスキップができます！
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (result) setResult(null);
                }}
                placeholder="PUNI-XXXXXX"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  letterSpacing: '1px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace, sans-serif'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!inputCode.trim()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: inputCode.trim()
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: inputCode.trim() ? 'pointer' : 'not-allowed',
                boxShadow: inputCode.trim() ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              入力して引き換える
            </button>
          </form>

          {/* Result Banner */}
          {result && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${result.success ? '#22c55e' : '#ef4444'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              animation: 'slideDown 0.2s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: result.success ? '#15803d' : '#b91c1c',
                fontWeight: 800,
                fontSize: '0.92rem'
              }}>
                {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{result.message}</span>
              </div>

              {result.success && result.rewardsSummary && (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px'
                }}>
                  <Gift size={16} color="#22c55e" />
                  <span>{result.rewardsSummary}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
