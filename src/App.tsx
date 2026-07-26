import {
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  Loader2,
  Timer,
  Type,
} from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type ReactElement } from 'react';

import { loadAnswers, saveAnswers, type AnswersByExerciseId } from './answers';
import { loadImportedExercises, saveImportedExercises } from './importedExercises';
import { extractTextFromTaskImage, type OcrProgress } from './ocr';
import { downloadAnswerPdf, type AnswerExportItem } from './pdfExport';
import {
  analyzeFrenchWriting,
  createExerciseFromImageTask,
  getProgressLabel,
  getTefExercises,
  getWritingStats,
  type TefExercise,
  type TefSection,
} from './tefWriting';

const baseExercises = getTefExercises();

const sectionLabel = (exercise: TefExercise): string =>
  exercise.section === 'A' ? 'Section A · 80+ mots' : 'Section B · 200+ mots';

type OcrStatus = 'idle' | 'reading' | 'ready' | 'error';

export const App = (): ReactElement | null => {
  const [answers, setAnswers] = useState<AnswersByExerciseId>(loadAnswers);
  const [importedExercises, setImportedExercises] = useState<TefExercise[]>(loadImportedExercises);
  const [selectedExerciseId, setSelectedExerciseId] = useState(baseExercises[0]?.id ?? '');
  const [grammarEnabled, setGrammarEnabled] = useState(true);
  const [imageFileName, setImageFileName] = useState('');
  const [imageSection, setImageSection] = useState<TefSection>('A');
  const [ocrError, setOcrError] = useState('');
  const [ocrProgress, setOcrProgress] = useState<OcrProgress>({ progress: 0, status: '' });
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrText, setOcrText] = useState('');

  const exercises = useMemo(() => [...baseExercises, ...importedExercises], [importedExercises]);

  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0],
    [exercises, selectedExerciseId],
  );
  const text = selectedExercise ? answers[selectedExercise.id] ?? '' : '';

  const stats = useMemo(() => getWritingStats(text), [text]);
  const hints = useMemo(
    () => (selectedExercise ? analyzeFrenchWriting(text, selectedExercise, grammarEnabled) : []),
    [grammarEnabled, selectedExercise, text],
  );
  const progress = selectedExercise
    ? Math.min(100, Math.round((stats.words / selectedExercise.minWords) * 100))
    : 0;
  const canAddImageTask = ocrStatus === 'ready' && ocrText.trim().length > 0;
  const answeredExportItems = useMemo<AnswerExportItem[]>(() => {
    return exercises
      .filter((exercise) => answers[exercise.id]?.trim())
      .sort((first, second) => first.section.localeCompare(second.section))
      .map((exercise) => ({
        answer: answers[exercise.id] ?? '',
        exercise,
      }));
  }, [answers, exercises]);
  const canExportCurrent = text.trim().length > 0;
  const canExportAnsweredSections = answeredExportItems.length > 0;

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

  const handleAddImageTask = (): void => {
    if (!canAddImageTask) {
      return;
    }

    const importedExercise = createExerciseFromImageTask({
      fileName: imageFileName,
      section: imageSection,
      text: ocrText,
      timestamp: Date.now(),
    });
    const nextImportedExercises = [importedExercise, ...importedExercises];

    setImportedExercises(nextImportedExercises);
    saveImportedExercises(nextImportedExercises);
    setSelectedExerciseId(importedExercise.id);
    setOcrStatus('idle');
    setOcrText('');
    setOcrProgress({ progress: 0, status: '' });
    setOcrError('');
  };

  const handleAnswerChange = (nextText: string): void => {
    if (!selectedExercise) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [selectedExercise.id]: nextText,
    };

    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
  };

  const handleExportCurrentPdf = (): void => {
    if (!selectedExercise || !canExportCurrent) {
      return;
    }

    downloadAnswerPdf(
      [
        {
          answer: text,
          exercise: selectedExercise,
        },
      ],
      selectedExercise.title,
    );
  };

  const handleExportAnsweredPdf = (): void => {
    if (!canExportAnsweredSections) {
      return;
    }

    downloadAnswerPdf(answeredExportItems, 'TEF réponses Section A et B');
  };

  if (!selectedExercise) {
    return null;
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="TEF writing practice">
        <header className="topbar">
          <div>
            <p className="eyebrow">TEF Expression écrite</p>
            <h1>Entraînement d’écriture</h1>
          </div>
          <button
            className="grammar-toggle"
            type="button"
            aria-pressed={grammarEnabled}
            onClick={() => {
              setGrammarEnabled((enabled) => !enabled);
            }}
          >
            {grammarEnabled ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
            <span>{grammarEnabled ? 'Grammaire activée' : 'Grammaire désactivée'}</span>
          </button>
        </header>

        <div className="exercise-bar">
          <label className="select-label" htmlFor="exercise">
            <ClipboardList size={18} aria-hidden="true" />
            <span>Exercice</span>
          </label>
          <div className="select-wrap">
            <select
              id="exercise"
              value={selectedExercise.id}
              onChange={(event) => {
                setSelectedExerciseId(event.target.value);
              }}
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        </div>

        <section className="prompt-panel" aria-labelledby="prompt-title">
          <div className="prompt-heading">
            <span>{sectionLabel(selectedExercise)}</span>
            <span>
              <Timer size={16} aria-hidden="true" />
              {String(selectedExercise.durationMinutes)} min
            </span>
          </div>
          <h2 id="prompt-title">{selectedExercise.title}</h2>
          <p className="prompt-text">{selectedExercise.prompt}</p>
          <p className="task-text">{selectedExercise.task}</p>
        </section>

        <section className="writing-panel" aria-label="Zone de rédaction">
          <div className="writing-toolbar">
            <div className="metric">
              <Type size={18} aria-hidden="true" />
              <strong>{stats.words}</strong>
              <span>mots</span>
            </div>
            <div className="target">
              <span>{getProgressLabel(stats.words, selectedExercise.minWords)}</span>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${String(progress)}%` }} />
              </div>
            </div>
          </div>

          <textarea
            aria-label="Votre texte en français"
            placeholder="Rédigez votre réponse ici..."
            spellCheck={grammarEnabled}
            value={text}
            onChange={(event) => {
              handleAnswerChange(event.target.value);
            }}
          />
        </section>
      </section>

      <aside className="side-panel" aria-label="Aide TEF">
        <section className="image-import-panel">
          <h2>Image de tâche</h2>
          <div className="import-row">
            <label className="file-button">
              {ocrStatus === 'reading' ? (
                <Loader2 className="spin" size={17} aria-hidden="true" />
              ) : (
                <ImagePlus size={17} aria-hidden="true" />
              )}
              <span>{ocrStatus === 'reading' ? 'Lecture...' : 'Charger'}</span>
              <input
                accept="image/*"
                capture="environment"
                disabled={ocrStatus === 'reading'}
                type="file"
                onChange={handleTaskImageChange}
              />
            </label>

            <div className="section-select-wrap">
              <select
                aria-label="Section TEF pour l’image"
                disabled={ocrStatus === 'reading'}
                value={imageSection}
                onChange={(event) => {
                  setImageSection(event.target.value as TefSection);
                }}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>

          {ocrStatus === 'reading' ? (
            <div className="ocr-progress" aria-live="polite">
              <span>{ocrProgress.status || 'OCR'}</span>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${String(ocrProgress.progress)}%` }} />
              </div>
            </div>
          ) : null}

          {ocrError.length > 0 ? <p className="import-error">{ocrError}</p> : null}

          {ocrText.length > 0 ? (
            <>
              <textarea
                className="ocr-preview"
                aria-label="Texte extrait de l’image"
                value={ocrText}
                onChange={(event) => {
                  setOcrText(event.target.value);
                }}
              />
              <button
                className="add-task-button"
                disabled={!canAddImageTask}
                type="button"
                onClick={handleAddImageTask}
              >
                Ajouter à la liste
              </button>
            </>
          ) : null}
        </section>

        <section>
          <h2>Repères</h2>
          <dl className="stats-grid">
            <div>
              <dt>Mots minimum</dt>
              <dd>{selectedExercise.minWords}</dd>
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

        <section className="export-panel">
          <h2>Export PDF</h2>
          <button
            className="export-button"
            disabled={!canExportCurrent}
            type="button"
            onClick={handleExportCurrentPdf}
          >
            <FileText size={17} aria-hidden="true" />
            <span>Tâche actuelle</span>
          </button>
          <button
            className="export-button secondary"
            disabled={!canExportAnsweredSections}
            type="button"
            onClick={handleExportAnsweredPdf}
          >
            <Download size={17} aria-hidden="true" />
            <span>Réponses A+B</span>
          </button>
          <p className="export-note">
            {canExportAnsweredSections
              ? `${String(answeredExportItems.length)} réponse${
                  answeredExportItems.length === 1 ? '' : 's'
                } prête${answeredExportItems.length === 1 ? '' : 's'} à exporter.`
              : 'Rédigez une réponse pour activer l’export.'}
          </p>
        </section>

        <section>
          <h2>Checklist</h2>
          <ul className="checklist">
            {selectedExercise.checklist.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Grammaire</h2>
          {grammarEnabled ? (
            hints.length > 0 ? (
              <ul className="hints">
                {hints.map((hint) => (
                  <li key={hint.id} className={hint.level}>
                    <strong>{hint.title}</strong>
                    <span>{hint.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">Aucun signal pour le moment.</p>
            )
          ) : (
            <p className="empty-state">La vérification est désactivée.</p>
          )}
        </section>
      </aside>
    </main>
  );
};
