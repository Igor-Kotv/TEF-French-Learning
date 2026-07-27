import { Timer } from 'lucide-react';
import type { ReactElement } from 'react';

import type { TefExercise } from '../../tefWriting';
import './PromptPanel.scss';

interface PromptPanelProps {
  exercise: TefExercise;
}

const sectionLabel = (exercise: TefExercise): string =>
  exercise.section === 'A' ? 'Section A · 80+ mots' : 'Section B · 200+ mots';

export const PromptPanel = ({ exercise }: PromptPanelProps): ReactElement => {
  return (
    <section className="prompt-panel" aria-labelledby="prompt-title">
      <div className="prompt-panel__heading">
        <span>{sectionLabel(exercise)}</span>
        <span>
          <Timer size={16} aria-hidden="true" />
          {String(exercise.durationMinutes)} min
        </span>
      </div>
      <h2 id="prompt-title">{exercise.title}</h2>
      <p className="prompt-panel__prompt">{exercise.prompt}</p>
      <p className="prompt-panel__task">{exercise.task}</p>
    </section>
  );
};
