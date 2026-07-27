import type { ReactElement } from 'react';

import type { ConnectorGroup } from '../../connectors';
import './TipsPanel.scss';

interface TipsPanelProps {
  groups: ConnectorGroup[];
}

export const TipsPanel = ({ groups }: TipsPanelProps): ReactElement => {
  return (
    <section className="tips-panel">
      <h2>Connecteurs utiles</h2>
      <div className="tips-panel__groups">
        {groups.map((group) => (
          <div className="tips-panel__group" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
