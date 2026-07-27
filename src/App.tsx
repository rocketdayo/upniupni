import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGame } from './store/GameContext';

import TitleScreen from './screens/TitleScreen';
import Home from './screens/Home';
import Gacha from './screens/Gacha';
import TeamBuilder from './screens/TeamBuilder';
import StageSelect from './screens/StageSelect';
import GameScene from './screens/GameScene';
import Collection from './screens/Collection';
import EventHome from './screens/EventHome';
import MissionList from './screens/MissionList';
import { DebugConsoleScreen } from './screens/NyankoDebugScene';
import { SerialCodeModal } from './components/SerialCodeModal';
import { Plus } from 'lucide-react';

const App = () => {
  const { loading, money, yPoints } = useGame();
  const navigate = useNavigate();
  const [isSerialModalOpen, setIsSerialModalOpen] = React.useState(false);

  React.useEffect(() => {
    console.log(
      '%c[開発者ツール] デバッグ画面を開くにはコンソールで openDebug("puni") または debug("nyanko") を実行してください。',
      'color: #00ccff; font-weight: bold; font-size: 13px;'
    );

    (window as any).openDebug = (code?: string) => {
      const validCodes = ['puni', 'nyanko', 'debug', 'cheat', 'yokai'];
      if (code && typeof code === 'string' && validCodes.includes(code.trim().toLowerCase())) {
        sessionStorage.setItem('debug_unlocked', 'true');
        console.log('%c[DEBUG] デバッグモード認証成功！デバッグ画面を開きます...', 'color: #00ff88; font-weight: bold; font-size: 14px;');
        navigate('/debug');
        return '✅ 認証成功！デバッグ画面を開きます。';
      } else {
        console.warn('[DEBUG] 認証失敗: 合言葉を指定してください (例: openDebug("puni") または openDebug("nyanko"))');
        return '❌ 認証失敗: 正しい合言葉を入力してください (例: openDebug("puni"))';
      }
    };
    (window as any).debug = (window as any).openDebug;
  }, [navigate]);

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <div className="app-container">
      {/* Global Header (hidden on title screen and game scene) */}
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/stage/:stageId" element={<GameScene />} />
        <Route path="/debug" element={<DebugConsoleScreen />} />
        <Route path="/debug-nyanko" element={<DebugConsoleScreen />} />
        <Route path="*" element={
          <>
              <div className="header">
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {/* Spirit (Stamina) */}
                  <div className="currency-badge">
                    <div className="currency-icon spirit-icon">+1</div>
                    <span style={{ fontSize: '0.9rem' }}>99</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <div className="currency-badge">
                    <div className="currency-icon money-icon">y</div>
                    {money}
                  </div>
                  <div className="currency-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div className="currency-icon y-point-icon">y</div>
                    <span>{yPoints}</span>
                    <button
                      onClick={() => setIsSerialModalOpen(true)}
                      style={{
                        marginLeft: '3px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        padding: 0
                      }}
                      title="シリアルコード入力"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            <SerialCodeModal isOpen={isSerialModalOpen} onClose={() => setIsSerialModalOpen(false)} />
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/gacha" element={<Gacha />} />
              <Route path="/team" element={<TeamBuilder />} />
              <Route path="/stages" element={<StageSelect />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/event" element={<EventHome />} />
              <Route path="/missions" element={<MissionList />} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
