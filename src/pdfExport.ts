import { getWritingStats, type TefExercise } from './tefWriting';

export interface AnswerExportItem {
  answer: string;
  exercise: TefExercise;
}

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const contentWidth = pageWidth - margin * 2;

interface PdfLine {
  fontSize: number;
  text: string;
  x: number;
  y: number;
}

interface PdfPage {
  lines: PdfLine[];
}

const winAnsiFallbacks = new Map<string, number>([
  ['€', 0x80],
  ['Œ', 0x8c],
  ['œ', 0x9c],
  ['‘', 0x91],
  ['’', 0x92],
  ['“', 0x93],
  ['”', 0x94],
  ['•', 0x95],
  ['–', 0x96],
  ['—', 0x97],
  ['™', 0x99],
  ['…', 0x85],
]);

const encodeWinAnsiHex = (text: string): string => {
  return Array.from(text)
    .map((character) => {
      const code = character.charCodeAt(0);
      const fallback = winAnsiFallbacks.get(character);
      const byte = fallback ?? (code <= 0xff ? code : 0x3f);

      return byte.toString(16).padStart(2, '0').toUpperCase();
    })
    .join('');
};

const escapePdfText = (text: string): string => {
  return `<${encodeWinAnsiHex(text)}>`;
};

const estimateTextWidth = (text: string, fontSize: number): number => {
  return Array.from(text).reduce((width, character) => {
    if (character === ' ') {
      return width + fontSize * 0.28;
    }

    if (/[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸŒ]/u.test(character)) {
      return width + fontSize * 0.62;
    }

    if (/[il.,;:!?'’"]/u.test(character)) {
      return width + fontSize * 0.28;
    }

    return width + fontSize * 0.5;
  }, 0);
};

const wrapText = (text: string, fontSize: number, maxWidth: number): string[] => {
  const paragraphs = text.split(/\n/u);
  const lines: string[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/u).filter(Boolean);

    if (words.length === 0) {
      lines.push('');
      return;
    }

    let currentLine = '';
    words.forEach((word) => {
      const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;

      if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
        return;
      }

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = word;
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
};

const addLine = (pages: PdfPage[], text: string, fontSize: number, yState: { value: number }): void => {
  if (yState.value < margin) {
    pages.push({ lines: [] });
    yState.value = pageHeight - margin;
  }

  pages[pages.length - 1]?.lines.push({
    fontSize,
    text,
    x: margin,
    y: yState.value,
  });
  yState.value -= fontSize * 1.45;
};

const addWrappedText = (
  pages: PdfPage[],
  text: string,
  fontSize: number,
  yState: { value: number },
): void => {
  wrapText(text, fontSize, contentWidth).forEach((line) => {
    addLine(pages, line, fontSize, yState);
  });
};

const createPages = (items: AnswerExportItem[]): PdfPage[] => {
  const pages: PdfPage[] = [{ lines: [] }];
  const yState = { value: pageHeight - margin };

  addLine(pages, 'TEF Expression écrite', 18, yState);
  addLine(pages, `Export généré le ${new Date().toLocaleDateString('fr-CA')}`, 10, yState);
  yState.value -= 14;

  items.forEach((item, index) => {
    const stats = getWritingStats(item.answer);

    if (index > 0) {
      pages.push({ lines: [] });
      yState.value = pageHeight - margin;
    }

    addLine(pages, item.exercise.title, 15, yState);
    addLine(
      pages,
      `Section ${item.exercise.section} · ${String(item.exercise.durationMinutes)} min · objectif ${String(
        item.exercise.minWords,
      )} mots`,
      10,
      yState,
    );
    yState.value -= 8;
    addLine(pages, 'Définition de la tâche', 12, yState);
    addWrappedText(pages, item.exercise.prompt, 11, yState);
    addWrappedText(pages, item.exercise.task, 11, yState);
    yState.value -= 10;
    addLine(pages, `Réponse (${String(stats.words)} mots)`, 12, yState);
    addWrappedText(pages, item.answer.trim() || 'Aucune réponse rédigée.', 11, yState);
  });

  return pages;
};

const buildPdfContentStream = (page: PdfPage): string => {
  return page.lines
    .map((line) => {
      return `BT /F1 ${String(line.fontSize)} Tf 1 0 0 1 ${String(line.x)} ${String(line.y.toFixed(2))} Tm ${escapePdfText(
        line.text,
      )} Tj ET`;
    })
    .join('\n');
};

const createPdfBlob = (items: AnswerExportItem[]): Blob => {
  const pages = createPages(items);
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  const pageObjectIds: number[] = [];

  pages.forEach((page) => {
    const pageObjectId = objects.length + 1;
    const contentObjectId = objects.length + 2;
    const stream = buildPdfContentStream(page);

    pageObjectIds.push(pageObjectId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${String(pageWidth)} ${String(
        pageHeight,
      )}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${String(contentObjectId)} 0 R >>`,
    );
    objects.push(`<< /Length ${String(stream.length)} >>\nstream\n${stream}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${String(id)} 0 R`).join(' ')}] /Count ${String(
    pageObjectIds.length,
  )} >>`;

  const bodyParts = ['%PDF-1.4\n'];
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(bodyParts.join('').length);
    bodyParts.push(`${String(index + 1)} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = bodyParts.join('').length;
  bodyParts.push(`xref\n0 ${String(objects.length + 1)}\n`);
  bodyParts.push('0000000000 65535 f \n');
  offsets.slice(1).forEach((offset) => {
    bodyParts.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
  });
  bodyParts.push(
    `trailer\n<< /Size ${String(objects.length + 1)} /Root 1 0 R >>\nstartxref\n${String(xrefOffset)}\n%%EOF`,
  );

  return new Blob(bodyParts, { type: 'application/pdf' });
};

const getSafeFilePart = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/giu, '-')
    .replace(/^-|-$/gu, '')
    .toLowerCase()
    .slice(0, 48);
};

export const downloadAnswerPdf = (items: AnswerExportItem[], fileName: string): void => {
  const blob = createPdfBlob(items);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${getSafeFilePart(fileName) || 'tef-answer'}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};

export const createAnswerPdfForTest = (items: AnswerExportItem[]): Blob => {
  return createPdfBlob(items);
};
