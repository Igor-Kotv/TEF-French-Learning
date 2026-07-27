import type { ReactElement } from 'react';

import type { GrammarHint } from '../../tefWriting';
import './GrammarPanel.scss';

interface GrammarPanelProps {
  grammarEnabled: boolean;
  hints: GrammarHint[];
}

export const GrammarPanel = ({ grammarEnabled, hints }: GrammarPanelProps): ReactElement => {
  return (
    <section className="grammar-panel">
      <h2>Grammaire</h2>
      {grammarEnabled ? (
        hints.length > 0 ? (
          <ul className="grammar-panel__hints">
            {hints.map((hint) => (
              <li key={hint.id} className={hint.level}>
                <strong>{hint.title}</strong>
                <span>{hint.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="grammar-panel__empty">Aucun signal pour le moment.</p>
        )
      ) : (
        <p className="grammar-panel__empty">La vérification est désactivée.</p>
      )}
    </section>
  );
};
