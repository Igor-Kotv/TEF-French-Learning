import type { ReactElement } from 'react';

import './ProgressBar.scss';

interface ProgressBarProps {
  value: number;
}

export const ProgressBar = ({ value }: ProgressBarProps): ReactElement => {
  return (
    <div className="progress-bar" aria-hidden="true">
      <div className="progress-bar__fill" style={{ width: `${String(value)}%` }} />
    </div>
  );
};
