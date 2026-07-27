import { ChevronDown, FilePenLine, ImagePlus, Loader2, X } from 'lucide-react';
import { useState, type ChangeEvent, type ReactElement } from 'react';

import { extractTextFromTaskImage, type OcrProgress } from '../../ocr';
import {
  createExerciseFromImageTask,
  createExerciseFromManualTask,
  type TefExercise,
  type TefSection,
} from '../../tefWriting';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './TaskCreatorModal.scss';

type CreatorMode = 'manual' | 'image';
type OcrStatus = 'idle' | 'reading' | 'ready' | 'error';

interface TaskCreatorModalProps {
  onClose: () => void;
  onCreateTask: (exercise: TefExercise) => void;
}

export const TaskCreatorModal = ({ onClose, onCreateTask }: TaskCreatorModalProps): ReactElement => {
  const [creatorMode, setCreatorMode] = useState<CreatorMode>('manual');
  const [section, setSection] = useState<TefSection>('A');
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualTask, setManualTask] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [ocrProgress, setOcrProgress] = useState<OcrProgress>({ progress: 0, status: '' });
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrText, setOcrText] = useState('');

  const canCreateManualTask = manualPrompt.trim().length > 0 && manualTask.trim().length > 0;
  const canCreateImageTask = ocrStatus === 'ready' && ocrText.trim().length > 0;

  const handleTaskImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setImageFileName(file.name);
    setOcrError('');
    setOcrProgress({ progress: 0, status: 'starting' });
    setOcrStatus('reading');
    setOcrText('');

    void extractTextFromTaskImage(file, setOcrProgress)
      .then((extractedText) => {
        if (extractedText.length === 0) {
          setOcrError('Aucun texte détecté dans cette image.');
          setOcrStatus('error');
          return;
        }

        setOcrText(extractedText);
        setOcrStatus('ready');
      })
      .catch((error: unknown) => {
        setOcrError(error instanceof Error ? error.message : 'Impossible de lire cette image.');
        setOcrStatus('error');
      });
  };

  const handleCreateManualTask = (): void => {
    if (!canCreateManualTask) {
      return;
    }

    onCreateTask(
      createExerciseFromManualTask({
        prompt: manualPrompt,
        section,
        task: manualTask,
        timestamp: Date.now(),
        title: manualTitle,
      }),
    );
    onClose();
  };

  const handleCreateImageTask = (): void => {
    if (!canCreateImageTask) {
      return;
    }

    onCreateTask(
      createExerciseFromImageTask({
        fileName: imageFileName,
        section,
        text: ocrText,
        timestamp: Date.now(),
      }),
    );
    onClose();
  };

  return (
    <div className="task-creator-modal" role="presentation">
      <section className="task-creator-modal__dialog" aria-label="Ajouter une tâche" role="dialog" aria-modal="true">
        <header className="task-creator-modal__header">
          <div>
            <p className="eyebrow">Nouvelle tâche</p>
            <h2>Ajouter un exercice</h2>
          </div>
          <button className="task-creator-modal__icon-button" type="button" aria-label="Fermer" onClick={onClose}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="task-creator-modal__toolbar">
          <div className="task-creator-modal__tabs" aria-label="Type de création">
            <button
              className={creatorMode === 'manual' ? 'task-creator-modal__tab is-active' : 'task-creator-modal__tab'}
              type="button"
              onClick={() => {
                setCreatorMode('manual');
              }}
            >
              <FilePenLine size={17} aria-hidden="true" />
              <span>Créer</span>
            </button>
            <button
              className={creatorMode === 'image' ? 'task-creator-modal__tab is-active' : 'task-creator-modal__tab'}
              type="button"
              onClick={() => {
                setCreatorMode('image');
              }}
            >
              <ImagePlus size={17} aria-hidden="true" />
              <span>Image</span>
            </button>
          </div>

          <div className="task-creator-modal__select">
            <select
              aria-label="Section TEF"
              disabled={ocrStatus === 'reading'}
              value={section}
              onChange={(event) => {
                setSection(event.target.value as TefSection);
              }}
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </div>

        {creatorMode === 'manual' ? (
          <div className="task-creator-modal__form">
            <label>
              <span>Titre</span>
              <input
                placeholder="Section A · Nouvel article"
                type="text"
                value={manualTitle}
                onChange={(event) => {
                  setManualTitle(event.target.value);
                }}
              />
            </label>
            <label>
              <span>Sujet</span>
              <textarea
                value={manualPrompt}
                onChange={(event) => {
                  setManualPrompt(event.target.value);
                }}
              />
            </label>
            <label>
              <span>Consigne</span>
              <textarea
                value={manualTask}
                onChange={(event) => {
                  setManualTask(event.target.value);
                }}
              />
            </label>
            <button
              className="task-creator-modal__primary"
              disabled={!canCreateManualTask}
              type="button"
              onClick={handleCreateManualTask}
            >
              Ajouter à la liste
            </button>
          </div>
        ) : (
          <div className="task-creator-modal__form">
            <label className="task-creator-modal__file-button">
              {ocrStatus === 'reading' ? (
                <Loader2 className="task-creator-modal__spin" size={18} aria-hidden="true" />
              ) : (
                <ImagePlus size={18} aria-hidden="true" />
              )}
              <span>{ocrStatus === 'reading' ? 'Lecture...' : 'Charger une image'}</span>
              <input
                accept="image/*"
                capture="environment"
                disabled={ocrStatus === 'reading'}
                type="file"
                onChange={handleTaskImageChange}
              />
            </label>

            {ocrStatus === 'reading' ? (
              <div className="task-creator-modal__progress" aria-live="polite">
                <span>{ocrProgress.status || 'OCR'}</span>
                <ProgressBar value={ocrProgress.progress} />
              </div>
            ) : null}

            {ocrError.length > 0 ? <p className="task-creator-modal__error">{ocrError}</p> : null}

            <label>
              <span>Texte extrait</span>
              <textarea
                value={ocrText}
                onChange={(event) => {
                  setOcrText(event.target.value);
                }}
              />
            </label>
            <button
              className="task-creator-modal__primary"
              disabled={!canCreateImageTask}
              type="button"
              onClick={handleCreateImageTask}
            >
              Ajouter à la liste
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
