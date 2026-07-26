export type AnswersByExerciseId = Record<string, string>;

const answersStorageKey = 'tef-writing.answers';

const isAnswersRecord = (value: unknown): value is AnswersByExerciseId => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((item) => typeof item === 'string')
  );
};

export const loadAnswers = (): AnswersByExerciseId => {
  const stored = window.localStorage.getItem(answersStorageKey);

  if (!stored) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return isAnswersRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveAnswers = (answers: AnswersByExerciseId): void => {
  window.localStorage.setItem(answersStorageKey, JSON.stringify(answers));
};
