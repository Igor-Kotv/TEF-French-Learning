import { describe, expect, it } from 'vitest';

import { createAnswerPdfForTest } from './pdfExport';
import { getTefExercises } from './tefWriting';

const readBlobText = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(String(reader.result));
    });
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('Unable to read blob'));
    });
    reader.readAsText(blob);
  });
};

describe('PDF export', () => {
  it('creates a PDF blob with task and answer content', async () => {
    const [exercise] = getTefExercises();
    if (!exercise) {
      throw new Error('Expected at least one exercise');
    }

    const pdf = createAnswerPdfForTest([
      {
        answer: 'Ma réponse montre les faits importants.',
        exercise,
      },
    ]);
    const text = await readBlobText(pdf);

    expect(pdf.type).toBe('application/pdf');
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/BaseFont /Helvetica');
  });
});
