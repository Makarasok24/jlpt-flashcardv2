export interface Folder {
  id: string;
  name: string;
  description?: string;
  theme: 'rose' | 'emerald' | 'blue' | 'amber' | 'purple' | 'stone';
  createdAt: number;
}

export interface VocabCard {
  id: string;
  folderId: string;
  kanji: string;
  kana: string;
  romaji: string;
  english: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  tags?: string[];
  mastered?: boolean;
}

export enum CardFace {
  FRONT = 'FRONT',
  BACK = 'BACK'
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  QUIZ = 'QUIZ'
}

export interface GeneratorParams {
  topic: string;
  count: number;
  difficulty: string;
  folderId: string;
}

export interface QuizResult {
  correct: number;
  incorrect: number;
  total: number;
}