import { Eye, EyeOff } from 'lucide-react';
import type { ReactElement } from 'react';

import type { PracticeMode } from '../../practiceMode';
import './TopBar.scss';

interface TopBarProps {
  grammarEnabled: boolean;
  mode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
}

export const TopBar = ({ grammarEnabled, mode, onModeChange }: TopBarProps): ReactElement => {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">TEF Expression écrite</p>
        <h1>Entraînement d’écriture</h1>
      </div>
      <div className="topbar__controls">
        <div className="mode-switch" aria-label="Mode de pratique" role="group">
          <button
            className={mode === 'training' ? 'active' : ''}
            type="button"
            onClick={() => {
              onModeChange('training');
            }}
          >
            Training
          </button>
          <button
            className={mode === 'test' ? 'active' : ''}
            type="button"
            onClick={() => {
              onModeChange('test');
            }}
          >
            Test
          </button>
        </div>
        <div className="grammar-status" aria-live="polite">
          {grammarEnabled ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          <span>{grammarEnabled ? 'Grammaire activée' : 'Grammaire désactivée'}</span>
        </div>
      </div>
    </header>
  );
};
