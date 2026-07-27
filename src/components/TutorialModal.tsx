import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Shield, Play } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: 'ぷにぷにへようこそ！',
    subtitle: 'パズルをつないで大ダメージ！',
    icon: '🔮',
    description: '画面上の妖怪ぷにを指でなぞってつなげよう！大きくつなげてタップして消すと、敵妖怪に大ダメージを与えられるぞ！',
    color: '#ff7700',
  },
  {
    title: 'チーム編成＆ひっさつわざ',
    subtitle: '5体の妖怪でチームを組もう！',
    icon: '⚔️',
    description: 'チームには必ず5体の妖怪をセットしよう！パズル中にでかぷにを消すと「わざゲージ」が溜まり、アイコンタップで強力なひっさつわざが発動！',
    color: '#2288ff',
  },
  {
    title: '妖怪ガシャ＆イベント',
    subtitle: '最強チームを目指そう！',
    icon: '🌟',
    description: 'ステージクリアで入手したYポイントでガシャを回そう！SSランクのレア妖怪をゲットして、イベントマップなどの強敵に挑もう！',
    color: '#ff2255',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('tutorial_completed', 'true');
    onClose();
  };

  const step = STEPS[currentStep];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', padding: '24px', position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(20,20,35,0.95), rgba(40,20,50,0.95))', border: `2px solid ${step.color}`, boxShadow: `0 0 25px ${step.color}66` }}>
        
        {/* Header / Skip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '0.8rem', background: step.color, color: 'white', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold' }}>
            STEP {currentStep + 1} / {STEPS.length}
          </div>
          <button
            onClick={handleComplete}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: '#ccc', borderRadius: '12px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            スキップ ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '10px', filter: `drop-shadow(0 0 10px ${step.color})` }}>
            {step.icon}
          </div>
          <h2 style={{ color: 'white', fontSize: '1.3rem', margin: '0 0 5px', fontWeight: 900 }}>
            {step.title}
          </h2>
          <div style={{ color: step.color, fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px' }}>
            {step.subtitle}
          </div>
          <p style={{ color: '#ddd', fontSize: '0.85rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
            {step.description}
          </p>
        </div>

        {/* Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                width: idx === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentStep ? step.color : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentStep > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handlePrev}
              style={{ flex: 1, padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ChevronLeft size={18} /> 前へ
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ flex: 2, padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: step.color, borderColor: step.color }}
          >
            {currentStep < STEPS.length - 1 ? (
              <>次へ <ChevronRight size={18} /></>
            ) : (
              <>はじめる！ <Sparkles size={18} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
