import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { loadAnswers, saveAnswers, type AnswersByExerciseId } from './answers';
import { ChecklistPanel } from './components/ChecklistPanel/ChecklistPanel';
import { ExerciseSelector } from './components/ExerciseSelector/ExerciseSelector';
import { ExportPanel } from './components/ExportPanel/ExportPanel';
import { GrammarPanel } from './components/GrammarPanel/GrammarPanel';
import { ModePanel } from './components/ModePanel/ModePanel';
import { PromptPanel } from './components/PromptPanel/PromptPanel';
import { StatsPanel } from './components/StatsPanel/StatsPanel';
import { TipsPanel } from './components/TipsPanel/TipsPanel';
import { TopBar } from './components/TopBar/TopBar';
import { WritingPanel } from './components/WritingPanel/WritingPanel';
import { connectorGroups } from './connectors';
import { loadImportedExercises, saveImportedExercises } from './importedExercises';
import { downloadAnswerPdf, type AnswerExportItem } from './pdfExport';
import { formatTimer, type PracticeMode } from './practiceMode';
import {
  analyzeFrenchWriting,
  getProgressLabel,
  getTefExercises,
  getWritingStats,
  type TefExercise,
} from './tefWriting';

const baseExercises = getTefExercises();

export const App = (): ReactElement | null => {
  const [answers, setAnswers] = useState<AnswersByExerciseId>(loadAnswers);
  const [importedExercises, setImportedExercises] = useState<TefExercise[]>(loadImportedExercises);
  const [selectedExerciseId, setSelectedExerciseId] = useState(baseExercises[0]?.id ?? '');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('training');
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const exercises = useMemo(() => [...baseExercises, ...importedExercises], [importedExercises]);
  const selectedExercise = useMemo(
    () => exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0],
    [exercises, selectedExerciseId],
  );

  const text = selectedExercise ? answers[selectedExercise.id] ?? '' : '';
  const isTestMode = practiceMode === 'test';
  const grammarEnabled = practiceMode === 'training';
  const testDurationSeconds = selectedExercise ? selectedExercise.durationMinutes * 60 : 0;
  const stats = useMemo(() => getWritingStats(text), [text]);
  const hints = useMemo(
    () => (selectedExercise ? analyzeFrenchWriting(text, selectedExercise, grammarEnabled) : []),
    [grammarEnabled, selectedExercise, text],
  );
  const writingProgress = selectedExercise
    ? Math.min(100, Math.round((stats.words / selectedExercise.minWords) * 100))
    : 0;
  const timerProgress =
    testDurationSeconds > 0 ? Math.max(0, Math.round((secondsRemaining / testDurationSeconds) * 100)) : 0;
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
  const selectedExerciseIsCustom = selectedExercise
    ? importedExercises.some((exercise) => exercise.id === selectedExercise.id)
    : false;

  useEffect(() => {
    setSecondsRemaining(testDurationSeconds);
  }, [practiceMode, selectedExercise?.id, testDurationSeconds]);

  useEffect(() => {
    if (!isTestMode || secondsRemaining <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTestMode, secondsRemaining]);

  const handleExerciseCreate = (importedExercise: TefExercise): void => {
    const nextImportedExercises = [importedExercise, ...importedExercises];

    setImportedExercises(nextImportedExercises);
    saveImportedExercises(nextImportedExercises);
    setSelectedExerciseId(importedExercise.id);
  };

  const handleExerciseDelete = (exerciseId: string): void => {
    const nextImportedExercises = importedExercises.filter((exercise) => exercise.id !== exerciseId);
    const { [exerciseId]: _deletedAnswer, ...nextAnswers } = answers;

    setImportedExercises(nextImportedExercises);
    saveImportedExercises(nextImportedExercises);
    setAnswers(nextAnswers);
    saveAnswers(nextAnswers);
    setSelectedExerciseId(baseExercises[0]?.id ?? nextImportedExercises[0]?.id ?? '');
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

    downloadAnswerPdf([{ answer: text, exercise: selectedExercise }], selectedExercise.title);
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
        <TopBar grammarEnabled={grammarEnabled} mode={practiceMode} onModeChange={setPracticeMode} />
        <ExerciseSelector
          exercises={exercises}
          selectedExerciseId={selectedExercise.id}
          selectedExerciseIsCustom={selectedExerciseIsCustom}
          onExerciseChange={setSelectedExerciseId}
          onExerciseCreate={handleExerciseCreate}
          onExerciseDelete={handleExerciseDelete}
        />
        <PromptPanel exercise={selectedExercise} />
        <WritingPanel
          grammarEnabled={grammarEnabled}
          isTestMode={isTestMode}
          progress={writingProgress}
          progressLabel={getProgressLabel(stats.words, selectedExercise.minWords)}
          secondsRemainingLabel={formatTimer(secondsRemaining)}
          stats={stats}
          text={text}
          onTextChange={handleAnswerChange}
        />
      </section>

      <aside className="side-panel" aria-label="Aide TEF">
        <ModePanel
          isTestMode={isTestMode}
          secondsRemainingLabel={formatTimer(secondsRemaining)}
          timerProgress={timerProgress}
        />
        {!isTestMode ? <TipsPanel groups={connectorGroups} /> : null}
        <StatsPanel exercise={selectedExercise} stats={stats} />
        <ExportPanel
          answeredCount={answeredExportItems.length}
          canExportAnsweredSections={canExportAnsweredSections}
          canExportCurrent={canExportCurrent}
          onExportAnswered={handleExportAnsweredPdf}
          onExportCurrent={handleExportCurrentPdf}
        />
        <ChecklistPanel items={selectedExercise.checklist} />
        <GrammarPanel grammarEnabled={grammarEnabled} hints={hints} />
      </aside>
    </main>
  );
};
