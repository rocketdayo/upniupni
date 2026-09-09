import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useGame, BLEACH_SHOP_ITEMS } from '../store/GameContext';

interface BleachRingShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BleachRingShopModal: React.FC<BleachRingShopModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    bleachRings = 0,
    yPoints = 0,
    bleachRingExchanges = {},
    exchangeBleachRing,
    convertYPointsToBleachRings,
    items
  } = useGame();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleExchange = (itemId: string) => {
    const res = exchangeBleachRing(itemId);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  const handleQuickConvert = (ypCost: number) => {
    const res = convertYPointsToBleachRings(ypCost);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #180929 0%, #0f172a 100%)',
          border: '2px solid #c084fc',
          boxShadow: '0 0 30px rgba(192, 132, 252, 0.4), inset 0 0 20px rgba(192, 132, 252, 0.1)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(192, 132, 252, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(59, 7, 100, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 8px #f43f5e)' }}>💍</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#f0abfc', letterSpacing: '0.05em' }}>
                BLEACHリング交換所
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#c084fc' }}>虚圏限定アイテム＆神昇の秘石</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status & Wallet */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💍</span>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>所持リング</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f0abfc' }}>
                {(bleachRings || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>個</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💎</span>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>神昇の秘石</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fde047' }}>
                {(items?.godAscensionStone || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>個</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔶</span>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>所持 YP</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#38bdf8' }}>
                {(yPoints || 0).toLocaleString()} <span style={{ fontSize: '0.75rem' }}>pt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Y-Points to Bleach Rings */}
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(88, 28, 135, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700 }}>
            YP両替:
          </span>
          <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleQuickConvert(5000)}
              style={{
                padding: '4px 8px',
                background: 'rgba(168, 85, 247, 0.25)',
                border: '1px solid #c084fc',
                borderRadius: '8px',
                color: '#f0abfc',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              5,000pt ➔ 1個 💍
            </button>
            <button
              onClick={() => handleQuickConvert(50000)}
              style={{
                padding: '4px 8px',
                background: 'rgba(217, 70, 239, 0.35)',
                border: '1px solid #d946ef',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              50,000pt ➔ 10個 💍
            </button>
          </div>
        </div>

        {/* Toast / Notification */}
        {notification && (
          <div
            style={{
              padding: '10px 16px',
              background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              borderBottom: `2px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {notification.type === 'success' ? <CheckCircle size={16} color="#22c55e" /> : <AlertCircle size={16} color="#ef4444" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {BLEACH_SHOP_ITEMS.map(item => {
            const purchasedCount = bleachRingExchanges[item.id] || 0;
            const isSoldOut = item.limit < 999 && purchasedCount >= item.limit;
            const canAfford = (bleachRings || 0) >= item.cost;
            const remaining = item.limit < 999 ? Math.max(0, item.limit - purchasedCount) : null;
            const isGodStone = item.id === 'godAscensionStone';

            return (
              <div
                key={item.id}
                style={{
                  background: isGodStone
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(147, 51, 234, 0.2) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isGodStone ? '2px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: isGodStone ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none',
                  opacity: isSoldOut ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '2rem',
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: isGodStone ? 'rgba(234, 179, 8, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      border: isGodStone ? '1px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: isGodStone ? '#fef08a' : '#ffffff' }}>
                        {item.name}
                      </span>
                      {remaining !== null && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: isSoldOut ? '#ef4444' : 'rgba(168, 85, 247, 0.3)',
                            color: isSoldOut ? '#ffffff' : '#f0abfc',
                            border: `1px solid ${isSoldOut ? '#ef4444' : '#a855f7'}`
                          }}
                        >
                          {isSoldOut ? '完売 (交換上限)' : `限定残り ${remaining}/${item.limit}個`}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                      {item.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 900, color: '#f0abfc' }}>
                    <span>💍</span>
                    <span>{item.cost}個</span>
                  </div>
                  <button
                    onClick={() => handleExchange(item.id)}
                    disabled={isSoldOut || !canAfford}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isSoldOut
                        ? 'rgba(255, 255, 255, 0.1)'
                        : canAfford
                        ? isGodStone
                          ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                          : 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: isSoldOut ? '#94a3b8' : canAfford ? (isGodStone ? '#000000' : '#ffffff') : '#64748b',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      cursor: isSoldOut || !canAfford ? 'not-allowed' : 'pointer',
                      boxShadow: canAfford && !isSoldOut ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {isSoldOut ? '上限達成' : canAfford ? '交換する' : 'リング不足'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Shortcut to God Ascension */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <button
            onClick={() => {
              onClose();
              navigate('/ascension');
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7e22ce 0%, #3b0764 100%)',
              border: '1px solid #ffd700',
              color: '#fef08a',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Crown size={16} color="#ffd700" />
            <span>神昇の祭壇へ進む</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
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
  );
};
