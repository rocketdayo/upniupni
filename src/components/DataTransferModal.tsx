import React, { useState } from 'react';
import { X, Lock, Key, Copy, Check, ArrowRightLeft, ShieldCheck, AlertTriangle, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { encryptPlayerData, decryptPlayerData } from '../utils/cryptoTransfer';

interface DataTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataTransferModal: React.FC<DataTransferModalProps> = ({ isOpen, onClose }) => {
  const { exportRawPlayerData, importAllPlayerData } = useGame();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // エクスポート用ステート
  const [exportPassword, setExportPassword] = useState('');
  const [exportPasswordConfirm, setExportPasswordConfirm] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [encryptedCode, setEncryptedCode] = useState('');
  const [exportError, setExportError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // インポート用ステート
  const [importCode, setImportCode] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [showImportPassword, setShowImportPassword] = useState(false);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  // エクスポート（引き継ぎコード作成）処理
  const handleGenerateExportCode = async () => {
    setExportError('');
    if (!exportPassword || exportPassword.length < 4) {
      setExportError('パスワードは4文字以上で設定してください。');
      return;
    }
    if (exportPassword !== exportPasswordConfirm) {
      setExportError('パスワードと確認用パスワードが一致しません。');
      return;
    }

    try {
      setIsExporting(true);
      const rawData = exportRawPlayerData();
      const encrypted = await encryptPlayerData(rawData, exportPassword);
      setEncryptedCode(encrypted);
    } catch (err: any) {
      setExportError(err.message || 'コードの生成に失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  // コピー処理
  const handleCopy = () => {
    if (!encryptedCode) return;
    navigator.clipboard.writeText(encryptedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // インポート（復号検証）処理
  const handleVerifyImportCode = async () => {
    setImportError('');
    setPreviewData(null);
    if (!importCode.trim()) {
      setImportError('引き継ぎコードを入力してください。');
      return;
    }
    if (!importPassword) {
      setImportError('発行時に設定したパスワードを入力してください。');
      return;
    }

    try {
      setIsImporting(true);
      const data = await decryptPlayerData(importCode.trim(), importPassword);
      setPreviewData(data);
    } catch (err: any) {
      setImportError(err.message || '復号に失敗しました。');
    } finally {
      setIsImporting(false);
    }
  };

  // インポート確定処理
  const handleConfirmImport = () => {
    if (!previewData) return;
    try {
      importAllPlayerData(previewData);
      setImportSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setImportError('データの読み込み中にエラーが発生しました。');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.98), rgba(10, 15, 30, 0.98))',
        border: '2px solid #3b82f6',
        borderRadius: '20px',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
        position: 'relative',
        overflow: 'hidden'
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
            <ArrowRightLeft size={22} color="#60a5fa" />
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em' }}>
              データ引き継ぎ・移行
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

        {/* タブ切り替え */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <button
            onClick={() => { setActiveTab('export'); setImportSuccess(false); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === 'export' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === 'export' ? '#60a5fa' : '#94a3b8',
              borderBottom: activeTab === 'export' ? '3px solid #3b82f6' : 'none',
              fontWeight: 900,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Upload size={16} />
            <span>コード発行 (出力)</span>
          </button>
          <button
            onClick={() => { setActiveTab('import'); setImportSuccess(false); }}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === 'import' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === 'import' ? '#60a5fa' : '#94a3b8',
              borderBottom: activeTab === 'import' ? '3px solid #3b82f6' : 'none',
              fontWeight: 900,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>コード入力 (復元)</span>
          </button>
        </div>

        {/* メインコンテンツエリア */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'export' ? (
            /* 📤 コード発行タブ */
            <>
              {!encryptedCode ? (
                <>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontWeight: 900, color: '#60a5fa', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> 高度暗号化セキュリティシステム
                    </div>
                    データをあなた専用のパスワードで暗号化してコードを出力します。<br />
                    <span style={{ color: '#facc15', fontWeight: 800 }}>パスワードを知らない第三者がコードを入手しても、データを復号・閲覧することはできません。</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'block' }}>
                        暗号化用パスワード（4文字以上）
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showExportPassword ? 'text' : 'password'}
                          value={exportPassword}
                          onChange={e => setExportPassword(e.target.value)}
                          placeholder="ご自身で決めたパスワードを入力"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            borderRadius: '10px',
                            border: '1px solid #475569',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowExportPassword(!showExportPassword)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                          {showExportPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'block' }}>
                        パスワード（確認用）
                      </label>
                      <input
                        type={showExportPassword ? 'text' : 'password'}
                        value={exportPasswordConfirm}
                        onChange={e => setExportPasswordConfirm(e.target.value)}
                        placeholder="パスワードを再入力"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #475569',
                          background: '#0f172a',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {exportError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        ⚠️ {exportError}
                      </div>
                    )}

                    <button
                      onClick={handleGenerateExportCode}
                      disabled={isExporting}
                      style={{
                        marginTop: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Key size={18} />
                      <span>{isExporting ? '暗号化処理中...' : '暗号化コードを発行する'}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* 発行成功表示 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    color: '#4ade80',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <ShieldCheck size={20} /> 暗号化コードの発行が完了しました！
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'block' }}>
                      暗号化された引き継ぎコード文字列
                    </label>
                    <div style={{
                      background: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      padding: '10px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: '#60a5fa',
                      wordBreak: 'break-all',
                      lineHeight: 1.4
                    }}>
                      {encryptedCode}
                    </div>
                  </div>

                  <button
                    onClick={handleCopy}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: copied ? '#16a34a' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                      transition: 'background 0.2s'
                    }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'クリップボードにコピーしました！' : '暗号化コードをコピー'}</span>
                  </button>

                  <div style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '0.75rem',
                    color: '#fde047',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontWeight: 900, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> 【重要】引き継ぎ時の注意事項
                    </div>
                    ・引き継ぎ先で復号するには、設定した<strong>パスワード</strong>が必要です。<br />
                    ・パスワードは第三者に教えないでください。<br />
                    ・この暗号化コードとパスワードを大切に保存・メモしてください。
                  </div>

                  <button
                    onClick={() => { setEncryptedCode(''); setExportPassword(''); setExportPasswordConfirm(''); }}
                    style={{
                      background: 'none',
                      border: '1px solid #475569',
                      color: '#94a3b8',
                      padding: '8px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    別のパスワードで再発行する
                  </button>
                </div>
              )}
            </>
          ) : (
            /* 📥 コード入力（復元）タブ */
            <>
              {importSuccess ? (
                <div style={{
                  padding: '30px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '3rem' }}>🎉</div>
                  <h3 style={{ color: '#4ade80', margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>データ引き継ぎ成功！</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                    ゲームデータが正常に復元されました。<br />
                    画面を再読み込みします...
                  </p>
                </div>
              ) : !previewData ? (
                <>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    lineHeight: 1.5
                  }}>
                    発行時に取得した「暗号化コード」と「設定したパスワード」を入力してください。<br />
                    <span style={{ color: '#facc15', fontWeight: 800 }}>パスワードが一致しない場合、暗号解読は失敗し復元できません。</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'block' }}>
                        暗号化引き継ぎコード文字列
                      </label>
                      <textarea
                        value={importCode}
                        onChange={e => setImportCode(e.target.value)}
                        placeholder="PUNI_SAVE_V1:..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #475569',
                          background: '#0f172a',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginBottom: '6px', display: 'block' }}>
                        コード発行時に設定したパスワード
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showImportPassword ? 'text' : 'password'}
                          value={importPassword}
                          onChange={e => setImportPassword(e.target.value)}
                          placeholder="パスワードを入力"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            borderRadius: '10px',
                            border: '1px solid #475569',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowImportPassword(!showImportPassword)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        >
                          {showImportPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {importError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', lineHeight: 1.4 }}>
                        ⚠️ {importError}
                      </div>
                    )}

                    <button
                      onClick={handleVerifyImportCode}
                      disabled={isImporting}
                      style={{
                        marginTop: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        cursor: isImporting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Lock size={18} />
                      <span>{isImporting ? '復号検証中...' : '暗号化コードを復号・検証する'}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* 復号成功プレビュー表示 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#4ade80',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <ShieldCheck size={20} /> 本人確認＆復号に成功しました！
                  </div>

                  <div style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ fontWeight: 900, color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '4px' }}>
                      引き継ぎ対象データ概要
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>所持Yポイント:</span>
                      <strong style={{ color: '#facc15' }}>{(previewData.yPoints || 0).toLocaleString()} Ypt</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>所持yマネー:</span>
                      <strong style={{ color: '#4ade80' }}>{(previewData.money || 0).toLocaleString()} コイン</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>仲間ぷに数:</span>
                      <strong style={{ color: '#60a5fa' }}>{Object.keys(previewData.characters || {}).length} 体</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>クリアステージ数:</span>
                      <strong style={{ color: '#f472b6' }}>{(previewData.clearedStages || []).length} ステージ</strong>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: '#fca5a5'
                  }}>
                    ⚠️ 注意: 引き継ぎを実行すると、現在の端末のプレイデータは上記データで上書きされます。
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setPreviewData(null)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'none',
                        border: '1px solid #475569',
                        color: '#cbd5e1',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
                      }}
                    >
                      データを引き継ぐ (確定)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
