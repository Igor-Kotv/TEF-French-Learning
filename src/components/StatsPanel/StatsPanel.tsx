import type { ReactElement } from 'react';

import type { TefExercise, WritingStats } from '../../tefWriting';
import './StatsPanel.scss';

interface StatsPanelProps {
  exercise: TefExercise;
  stats: WritingStats;
}

export const StatsPanel = ({ exercise, stats }: StatsPanelProps): ReactElement => {
  return (
    <section className="stats-panel">
      <h2>Repères</h2>
      <dl className="stats-panel__grid">
        <div>
          <dt>Mots minimum</dt>
          <dd>{exercise.minWords}</dd>
        </div>
        <div>
          <dt>Phrases</dt>
          <dd>{stats.sentences}</dd>
        </div>
        <div>
          <dt>Paragraphes</dt>
          <dd>{stats.paragraphs}</dd>
        </div>
        <div>
          <dt>Caractères</dt>
          <dd>{stats.characters}</dd>
        </div>
      </dl>
    </section>
  );
};
