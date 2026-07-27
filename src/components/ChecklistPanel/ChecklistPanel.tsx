import { Check } from 'lucide-react';
import type { ReactElement } from 'react';

import './ChecklistPanel.scss';

interface ChecklistPanelProps {
  items: string[];
}

export const ChecklistPanel = ({ items }: ChecklistPanelProps): ReactElement => {
  return (
    <section className="checklist-panel">
      <h2>Checklist</h2>
      <ul className="checklist-panel__list">
        {items.map((item) => (
          <li key={item}>
            <Check size={16} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
