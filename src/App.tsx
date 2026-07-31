import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGame } from './store/GameContext';
import { formatJapaneseNumber } from './utils/format';

import TitleScreen from './screens/TitleScreen';
import Home from './screens/Home';
import Gacha from './screens/Gacha';
import TeamBuilder from './screens/TeamBuilder';
import StageSelect from './screens/StageSelect';
import GameScene from './screens/GameScene';
import Collection from './screens/Collection';
import EventHome from './screens/EventHome';
import { EventMap } from './screens/EventMap';
import MissionList from './screens/MissionList';
import ScoreAttack from './screens/ScoreAttack';
import { DebugConsoleScreen } from './screens/NyankoDebugScene';
import { SerialCodeModal } from './components/SerialCodeModal';
import { Plus } from 'lucide-react';

const App = () => {
  const { loading, money, yPoints, summerMedals } = useGame();
  const [isSerialModalOpen, setIsSerialModalOpen] = React.useState(false);

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <div className="app-container">
      {/* Global Header (hidden on title screen and game scene) */}
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/stage/:stageId" element={<GameScene />} />
        <Route path="/game/:stageId" element={<GameScene />} />
        <Route path="/debug" element={<DebugConsoleScreen />} />
        <Route path="/debug-nyanko" element={<DebugConsoleScreen />} />
        <Route path="*" element={
          <>
              <div className="header" style={{ padding: '8px 10px', gap: '3px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  {/* Spirit (Stamina) */}
                  <div className="currency-badge" style={{ padding: '3px 8px 3px 22px', fontSize: '0.85rem', marginLeft: '5px' }}>
                    <div className="currency-icon spirit-icon" style={{ width: '22px', height: '22px', left: '-5px' }}>+1</div>
                    <span>99</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'end' }}>
                  <div className="currency-badge" style={{ padding: '3px 8px 3px 22px', fontSize: '0.85rem', marginLeft: '5px' }}>
                    <div className="currency-icon money-icon" style={{ width: '22px', height: '22px', left: '-5px' }}>y</div>
                    <span>{formatJapaneseNumber(money)}</span>
                  </div>
                  <div className="currency-badge" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px 3px 22px', fontSize: '0.85rem', marginLeft: '5px' }}>
                    <div className="currency-icon y-point-icon" style={{ width: '22px', height: '22px', left: '-5px' }}>y</div>
                    <span>{formatJapaneseNumber(yPoints)}</span>
                    <button
                      onClick={() => setIsSerialModalOpen(true)}
                      style={{
                        marginLeft: '2px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        padding: 0
                      }}
                      title="シリアルコード入力"
                    >
                      <Plus size={10} strokeWidth={4} />
                    </button>
                  </div>
                  {/* Summer Medals */}
                  <div className="currency-badge" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px 3px 22px', fontSize: '0.85rem', marginLeft: '5px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderColor: '#0284c7', color: '#fff' }}>
                    <div className="currency-icon" style={{ width: '22px', height: '22px', left: '-5px', background: 'linear-gradient(135deg, #fde047, #ca8a04)', border: '1px solid #fff', fontSize: '0.8rem', color: '#000' }}>🏝️</div>
                    <span style={{ fontWeight: '900' }}>{formatJapaneseNumber(summerMedals || 0)}</span>
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
              <Route path="/event/map" element={<EventMap />} />
              <Route path="/missions" element={<MissionList />} />
              <Route path="/score_attack" element={<ScoreAttack />} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
