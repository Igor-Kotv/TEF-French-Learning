import { describe, expect, it } from 'vitest';

import {
  analyzeFrenchWriting,
  createExerciseFromImageTask,
  countFrenchWords,
  getProgressLabel,
  getTefExercises,
  getWritingStats,
} from './tefWriting';

describe('TEF writing helpers', () => {
  it('counts French contractions and hyphenated words as single words', () => {
    expect(countFrenchWords("Aujourd'hui, l'école est ouverte à Saint-Roch.")).toBe(6);
  });

  it('reports writing stats from the text', () => {
    expect(getWritingStats('Bonjour. Je prépare le TEF.\n\nC’est utile.')).toMatchObject({
      paragraphs: 2,
      sentences: 3,
      words: 7,
    });
  });

  it('creates a TEF target progress label', () => {
    expect(getProgressLabel(79, 80)).toBe('1 mot restant');
    expect(getProgressLabel(80, 80)).toBe('Objectif atteint');
  });

  it('respects the grammar check toggle', () => {
    const [exercise] = getTefExercises();
    if (!exercise) {
      throw new Error('Expected at least one TEF exercise');
    }

    expect(analyzeFrenchWriting('je aime le le TEF!', exercise, false)).toEqual([]);
    expect(analyzeFrenchWriting('je aime le le TEF!', exercise, true).length).toBeGreaterThan(0);
  });

  it('turns OCR text into a TEF image exercise', () => {
    expect(
      createExerciseFromImageTask({
        fileName: 'tef-section-b.png',
        section: 'B',
        text: '  Les transports gratuits?\n\n\nDonnez votre opinion.  ',
        timestamp: 123,
      }),
    ).toMatchObject({
      durationMinutes: 35,
      id: 'image-123',
      minWords: 200,
      prompt: 'Les transports gratuits?\n\nDonnez votre opinion.',
      section: 'B',
      title: 'Section B · tef section b',
    });
  });
});
