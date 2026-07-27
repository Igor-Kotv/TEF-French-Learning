import { Timer, Type } from 'lucide-react';
import type { ReactElement } from 'react';

import type { WritingStats } from '../../tefWriting';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './WritingPanel.scss';

interface WritingPanelProps {
  grammarEnabled: boolean;
  isTestMode: boolean;
  progress: number;
  progressLabel: string;
  secondsRemainingLabel: string;
  stats: WritingStats;
  text: string;
  onTextChange: (text: string) => void;
}

export const WritingPanel = ({
  grammarEnabled,
  isTestMode,
  progress,
  progressLabel,
  secondsRemainingLabel,
  stats,
  text,
  onTextChange,
}: WritingPanelProps): ReactElement => {
  return (
    <section className="writing-panel" aria-label="Zone de rédaction">
      <div className="writing-panel__toolbar">
        <div className="writing-panel__metric">
          <Type size={18} aria-hidden="true" />
          <strong>{stats.words}</strong>
          <span>mots</span>
        </div>
        <div className="writing-panel__target">
          <span>{progressLabel}</span>
          <ProgressBar value={progress} />
        </div>
        {isTestMode ? (
          <div className="writing-panel__timer" aria-live="polite">
            <Timer size={17} aria-hidden="true" />
            <span>{secondsRemainingLabel}</span>
          </div>
        ) : null}
      </div>

      <textarea
        aria-label="Votre texte en français"
        placeholder="Rédigez votre réponse ici..."
        spellCheck={grammarEnabled}
        value={text}
        onChange={(event) => {
          onTextChange(event.target.value);
        }}
      />
    </section>
  );
};
