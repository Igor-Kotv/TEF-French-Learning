import { Check, Lock } from 'lucide-react';
import type { ReactElement } from 'react';

import { ProgressBar } from '../ProgressBar/ProgressBar';
import './ModePanel.scss';

interface ModePanelProps {
  isTestMode: boolean;
  secondsRemainingLabel: string;
  timerProgress: number;
}

export const ModePanel = ({ isTestMode, secondsRemainingLabel, timerProgress }: ModePanelProps): ReactElement => {
  return (
    <section className={isTestMode ? 'mode-panel mode-panel--test' : 'mode-panel'}>
      <h2>{isTestMode ? 'Mode Test' : 'Mode Training'}</h2>
      {isTestMode ? (
        <>
          <div className="mode-panel__timer">{secondsRemainingLabel}</div>
          <ProgressBar value={timerProgress} />
          <p className="mode-panel__note">
            <Lock size={15} aria-hidden="true" />
            <span>Conseils et grammaire désactivés.</span>
          </p>
        </>
      ) : (
        <p className="mode-panel__note">
          <Check size={15} aria-hidden="true" />
          <span>Conseils et grammaire activés.</span>
        </p>
      )}
    </section>
  );
};
