import { Download, FileText } from 'lucide-react';
import type { ReactElement } from 'react';

import './ExportPanel.scss';

interface ExportPanelProps {
  answeredCount: number;
  canExportAnsweredSections: boolean;
  canExportCurrent: boolean;
  onExportAnswered: () => void;
  onExportCurrent: () => void;
}

export const ExportPanel = ({
  answeredCount,
  canExportAnsweredSections,
  canExportCurrent,
  onExportAnswered,
  onExportCurrent,
}: ExportPanelProps): ReactElement => {
  return (
    <section className="export-panel">
      <h2>Export PDF</h2>
      <button className="export-panel__button" disabled={!canExportCurrent} type="button" onClick={onExportCurrent}>
        <FileText size={17} aria-hidden="true" />
        <span>Tâche actuelle</span>
      </button>
      <button
        className="export-panel__button export-panel__button--secondary"
        disabled={!canExportAnsweredSections}
        type="button"
        onClick={onExportAnswered}
      >
        <Download size={17} aria-hidden="true" />
        <span>Réponses A+B</span>
      </button>
      <p className="export-panel__note">
        {canExportAnsweredSections
          ? `${String(answeredCount)} réponse${answeredCount === 1 ? '' : 's'} prête${
              answeredCount === 1 ? '' : 's'
            } à exporter.`
          : 'Rédigez une réponse pour activer l’export.'}
      </p>
    </section>
  );
};
