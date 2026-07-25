export type TefSection = 'A' | 'B';

export interface TefExercise {
  id: string;
  section: TefSection;
  title: string;
  prompt: string;
  task: string;
  minWords: number;
  durationMinutes: number;
  checklist: string[];
}

export interface WritingStats {
  characters: number;
  sentences: number;
  paragraphs: number;
  words: number;
}

export type GrammarHintLevel = 'info' | 'warning';

export interface GrammarHint {
  id: string;
  level: GrammarHintLevel;
  title: string;
  detail: string;
}

export interface ImageTaskInput {
  fileName: string;
  section: TefSection;
  text: string;
  timestamp: number;
}

const wordPattern = /[\p{L}\p{M}\p{N}]+(?:[’'-][\p{L}\p{M}\p{N}]+)*/gu;

const tefExercises: TefExercise[] = [
  {
    id: 'a-neighborhood-market',
    section: 'A',
    title: 'Section A · Continuer un fait divers',
    prompt:
      'Un nouveau marché solidaire a ouvert samedi matin dans le quartier Saint-Roch. Dès les premières heures, de nombreux habitants sont venus découvrir les stands installés par des producteurs locaux.',
    task: 'Rédigez la suite de cet article en ajoutant des faits nouveaux, des détails concrets et une conclusion logique.',
    minWords: 80,
    durationMinutes: 25,
    checklist: [
      'Ajouter des informations nouvelles',
      'Garder un ton journalistique',
      'Rester clair et chronologique',
    ],
  },
  {
    id: 'a-train-delay',
    section: 'A',
    title: 'Section A · Continuer un article',
    prompt:
      'Hier soir, un train régional est resté bloqué pendant près de deux heures entre deux gares. Les passagers ont rapidement partagé leurs témoignages sur les réseaux sociaux.',
    task: 'Imaginez la suite de l’article: réactions, causes possibles, mesures prises et fin de l’incident.',
    minWords: 80,
    durationMinutes: 25,
    checklist: [
      'Décrire ce qui s’est passé ensuite',
      'Mentionner des témoins ou responsables',
      'Éviter de répéter le texte de départ',
    ],
  },
  {
    id: 'b-remote-work',
    section: 'B',
    title: 'Section B · Donner son opinion',
    prompt:
      '“Le télétravail devrait devenir obligatoire plusieurs jours par semaine dans toutes les entreprises.”',
    task: 'Répondez à cette affirmation. Exprimez votre point de vue et justifiez-le avec des arguments et des exemples.',
    minWords: 200,
    durationMinutes: 35,
    checklist: [
      'Présenter clairement votre position',
      'Développer au moins trois arguments',
      'Utiliser des connecteurs logiques',
    ],
  },
  {
    id: 'b-public-transport',
    section: 'B',
    title: 'Section B · Argumenter',
    prompt:
      '“Pour réduire la pollution, les transports en commun devraient être gratuits dans les grandes villes.”',
    task: 'Dites si vous êtes d’accord ou non, puis développez une argumentation structurée.',
    minWords: 200,
    durationMinutes: 35,
    checklist: [
      'Introduire le sujet sans détour',
      'Nuancer votre opinion',
      'Conclure avec une idée forte',
    ],
  },
];

export const getTefExercises = (): TefExercise[] => tefExercises;

export const cleanTaskText = (text: string): string => {
  return text
    .replace(/\r\n?/gu, '\n')
    .replace(/[ \t]+\n/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .replace(/[ \t]{2,}/gu, ' ')
    .trim();
};

const getImageTaskTitle = (fileName: string, section: TefSection): string => {
  const baseName = fileName
    .replace(/\.[^.]+$/u, '')
    .replace(/[-_]+/gu, ' ')
    .trim();
  const readableName = baseName.length > 0 ? baseName : 'image importée';

  return `Section ${section} · ${readableName}`;
};

const getDefaultTask = (section: TefSection): string => {
  if (section === 'A') {
    return 'Rédigez la suite de cette tâche TEF en respectant les informations extraites de l’image.';
  }

  return 'Répondez à cette tâche TEF en exprimant votre opinion avec des arguments et des exemples.';
};

const getDefaultChecklist = (section: TefSection): string[] => {
  if (section === 'A') {
    return [
      'Respecter les faits de départ',
      'Ajouter des informations nouvelles',
      'Garder un ton clair et journalistique',
    ];
  }

  return [
    'Présenter une opinion claire',
    'Développer des arguments',
    'Conclure avec une réponse nette',
  ];
};

export const createExerciseFromImageTask = ({
  fileName,
  section,
  text,
  timestamp,
}: ImageTaskInput): TefExercise => {
  const minWords = section === 'A' ? 80 : 200;

  return {
    id: `image-${String(timestamp)}`,
    section,
    title: getImageTaskTitle(fileName, section),
    prompt: cleanTaskText(text),
    task: getDefaultTask(section),
    minWords,
    durationMinutes: section === 'A' ? 25 : 35,
    checklist: getDefaultChecklist(section),
  };
};

export const countFrenchWords = (text: string): number => {
  return text.match(wordPattern)?.length ?? 0;
};

export const getWritingStats = (text: string): WritingStats => {
  const trimmed = text.trim();

  return {
    characters: text.length,
    paragraphs: trimmed.length === 0 ? 0 : trimmed.split(/\n{2,}/u).length,
    sentences: trimmed.length === 0 ? 0 : trimmed.split(/[.!?…]+(?:\s|$)/u).filter(Boolean).length,
    words: countFrenchWords(text),
  };
};

export const getProgressLabel = (words: number, minWords: number): string => {
  if (words >= minWords) {
    return 'Objectif atteint';
  }

  const remaining = minWords - words;
  return `${String(remaining)} mot${remaining === 1 ? '' : 's'} restant${remaining === 1 ? '' : 's'}`;
};

export const analyzeFrenchWriting = (
  text: string,
  exercise: TefExercise,
  grammarEnabled: boolean,
): GrammarHint[] => {
  if (!grammarEnabled || text.trim().length === 0) {
    return [];
  }

  const hints: GrammarHint[] = [];
  const stats = getWritingStats(text);

  if (stats.words < exercise.minWords) {
    hints.push({
      id: 'word-target',
      level: 'warning',
      title: 'Longueur TEF',
      detail: `Cette section demande au moins ${String(exercise.minWords)} mots.`,
    });
  }

  if (/[^\s][;:!?»]/u.test(text) || /«[^\s]/u.test(text)) {
    hints.push({
      id: 'french-spacing',
      level: 'info',
      title: 'Ponctuation française',
      detail: 'Vérifiez les espaces avant :, ;, ? et !, ainsi qu’après «.',
    });
  }

  if (/\b([\p{L}\p{M}]{2,})\s+\1\b/iu.test(text)) {
    hints.push({
      id: 'repeated-word',
      level: 'warning',
      title: 'Mot répété',
      detail: 'Un mot semble répété deux fois de suite.',
    });
  }

  if (/(?:^|[.!?]\s+)[a-zàâçéèêëîïôûùüÿñæœ]/u.test(text)) {
    hints.push({
      id: 'capitalization',
      level: 'info',
      title: 'Majuscule',
      detail: 'Une phrase semble commencer par une minuscule.',
    });
  }

  if (/\b(?:je|me|te|se|de|le|la|ne|que|ce)\s+[aeiouhàâéèêëîïôùûü]/iu.test(text)) {
    hints.push({
      id: 'elision',
      level: 'info',
      title: 'Élision possible',
      detail: 'Devant une voyelle ou h muet, vérifiez si une forme comme j’, l’ ou qu’ est attendue.',
    });
  }

  if (exercise.section === 'B' && stats.words >= 60 && !/\b(?:car|donc|cependant|toutefois|ainsi|d'abord|ensuite|enfin|par conséquent|en revanche)\b/iu.test(text)) {
    hints.push({
      id: 'connectors',
      level: 'info',
      title: 'Connecteurs logiques',
      detail: 'Ajoutez des liens comme cependant, ensuite, ainsi ou par conséquent pour renforcer l’argumentation.',
    });
  }

  if (exercise.section === 'A' && /\bje\b|\bnous\b/iu.test(text)) {
    hints.push({
      id: 'journalistic-tone',
      level: 'info',
      title: 'Ton journalistique',
      detail: 'Pour la Section A, un style neutre fonctionne souvent mieux qu’un récit personnel.',
    });
  }

  return hints;
};
