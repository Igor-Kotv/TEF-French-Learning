import type Tesseract from 'tesseract.js';

export interface OcrProgress {
  progress: number;
  status: string;
}

interface TesseractLoggerMessage {
  progress: number;
  status: string;
}

type TesseractModule = typeof Tesseract;
type TesseractImport = TesseractModule & {
  default?: TesseractModule;
};

const getLanguageOptions = (): Partial<Tesseract.WorkerOptions> => {
  if (window.location.protocol === 'file:') {
    return {};
  }

  return {
    langPath: getAssetPath('ocr/lang'),
  };
};

const getAssetPath = (path: string): string => {
  const base = import.meta.env.BASE_URL === '/' ? '' : `${import.meta.env.BASE_URL.replace(/\/$/u, '')}/`;
  return new URL(`${base}${path.replace(/^\//u, '')}`, window.location.href).href;
};

const normalizeOcrText = (text: string): string => {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+\n/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .replace(/[ \t]{2,}/gu, ' ')
    .trim();
};

export const extractTextFromTaskImage = async (
  image: File | Blob,
  onProgress: (progress: OcrProgress) => void,
): Promise<string> => {
  const tesseractImport = (await import('tesseract.js')) as unknown as TesseractImport;
  const tesseract = tesseractImport.default ?? tesseractImport;
  const worker = await tesseract.createWorker('fra', tesseract.OEM.LSTM_ONLY, {
    ...getLanguageOptions(),
    logger: (message: TesseractLoggerMessage) => {
      onProgress({
        progress: Math.round(message.progress * 100),
        status: message.status,
      });
    },
  });

  try {
    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: tesseract.PSM.AUTO,
    });

    const result = await worker.recognize(image);
    return normalizeOcrText(result.data.text);
  } finally {
    await worker.terminate();
  }
};
