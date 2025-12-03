import { VocabCard, Folder } from './types';

export const DEFAULT_FOLDER_ID = 'default-folder';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: DEFAULT_FOLDER_ID,
    name: 'General Vocabulary',
    description: 'My starting collection',
    theme: 'rose',
    createdAt: Date.now()
  }
];

export const INITIAL_DECK: VocabCard[] = [
  {
    id: '1',
    folderId: DEFAULT_FOLDER_ID,
    kanji: '猫',
    kana: 'ねこ',
    romaji: 'neko',
    english: 'Cat',
    exampleSentence: '猫が好きです。',
    exampleTranslation: 'I like cats.',
    tags: ['Animal', 'N5']
  },
  {
    id: '2',
    folderId: DEFAULT_FOLDER_ID,
    kanji: '食べる',
    kana: 'たべる',
    romaji: 'taberu',
    english: 'To eat',
    exampleSentence: '寿司を食べたい。',
    exampleTranslation: 'I want to eat sushi.',
    tags: ['Verb', 'N5']
  },
  {
    id: '3',
    folderId: DEFAULT_FOLDER_ID,
    kanji: '桜',
    kana: 'さくら',
    romaji: 'sakura',
    english: 'Cherry Blossom',
    exampleSentence: '桜がきれいです。',
    exampleTranslation: 'The cherry blossoms are beautiful.',
    tags: ['Nature', 'Season']
  }
];

export const DIFFICULTY_LEVELS = [
  'N5 (Beginner)',
  'N4 (Basic)',
  'N3 (Intermediate)',
  'N2 (Advanced)',
  'N1 (Expert)',
  'Travel',
  'Business',
  'Casual Slang'
];

export const FOLDER_THEMES = {
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  stone: 'bg-stone-200 text-stone-800 border-stone-300',
};