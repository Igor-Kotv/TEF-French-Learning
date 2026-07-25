import type { TefExercise, TefSection } from './tefWriting';

const importedExercisesStorageKey = 'tef-writing.imported-exercises';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isTefSection = (value: unknown): value is TefSection => {
  return value === 'A' || value === 'B';
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isStoredExercise = (value: unknown): value is TefExercise => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isTefSection(value.section) &&
    typeof value.title === 'string' &&
    typeof value.prompt === 'string' &&
    typeof value.task === 'string' &&
    typeof value.minWords === 'number' &&
    typeof value.durationMinutes === 'number' &&
    isStringArray(value.checklist)
  );
};

export const loadImportedExercises = (): TefExercise[] => {
  const stored = window.localStorage.getItem(importedExercisesStorageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isStoredExercise) : [];
  } catch {
    return [];
  }
};

export const saveImportedExercises = (exercises: TefExercise[]): void => {
  window.localStorage.setItem(importedExercisesStorageKey, JSON.stringify(exercises));
};
