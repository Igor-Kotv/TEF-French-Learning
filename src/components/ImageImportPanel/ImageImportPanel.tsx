import { ChevronDown, ImagePlus, Loader2 } from 'lucide-react';
import type { ChangeEvent, ReactElement } from 'react';

import type { OcrProgress } from '../../ocr';
import type { TefSection } from '../../tefWriting';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './ImageImportPanel.scss';

type OcrStatus = 'idle' | 'reading' | 'ready' | 'error';

interface ImageImportPanelProps {
  canAddImageTask: boolean;
  error: string;
  ocrText: string;
  progress: OcrProgress;
  section: TefSection;
  status: OcrStatus;
  onAddTask: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOcrTextChange: (text: string) => void;
  onSectionChange: (section: TefSection) => void;
}

export const ImageImportPanel = ({
  canAddImageTask,
  error,
  ocrText,
  progress,
  section,
  status,
  onAddTask,
  onImageChange,
  onOcrTextChange,
  onSectionChange,
}: ImageImportPanelProps): ReactElement => {
  return (
    <section className="image-import-panel">
      <h2>Image de tâche</h2>
      <div className="image-import-panel__row">
        <label className="image-import-panel__file-button">
          {status === 'reading' ? (
            <Loader2 className="image-import-panel__spin" size={17} aria-hidden="true" />
          ) : (
            <ImagePlus size={17} aria-hidden="true" />
          )}
          <span>{status === 'reading' ? 'Lecture...' : 'Charger'}</span>
          <input accept="image/*" capture="environment" disabled={status === 'reading'} type="file" onChange={onImageChange} />
        </label>

        <div className="image-import-panel__section-select">
          <select
            aria-label="Section TEF pour l’image"
            disabled={status === 'reading'}
            value={section}
            onChange={(event) => {
              onSectionChange(event.target.value as TefSection);
            }}
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>

      {status === 'reading' ? (
        <div className="image-import-panel__progress" aria-live="polite">
          <span>{progress.status || 'OCR'}</span>
          <ProgressBar value={progress.progress} />
        </div>
      ) : null}

      {error.length > 0 ? <p className="image-import-panel__error">{error}</p> : null}

      {ocrText.length > 0 ? (
        <>
          <textarea
            className="image-import-panel__preview"
            aria-label="Texte extrait de l’image"
            value={ocrText}
            onChange={(event) => {
              onOcrTextChange(event.target.value);
            }}
          />
          <button
            className="image-import-panel__add-button"
            disabled={!canAddImageTask}
            type="button"
            onClick={onAddTask}
          >
            Ajouter à la liste
          </button>
        </>
      ) : null}
    </section>
  );
};
