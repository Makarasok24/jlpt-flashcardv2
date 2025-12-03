import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { generateVocabulary } from '../services/geminiService';
import { VocabCard, GeneratorParams, Folder } from '../types';
import { DIFFICULTY_LEVELS } from '../constants';

interface GeneratorProps {
  folders: Folder[];
  activeFolderId: string;
  onGenerate: (cards: VocabCard[]) => void;
  onClose: () => void;
}

export const Generator: React.FC<GeneratorProps> = ({ folders, activeFolderId, onGenerate, onClose }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[0]);
  const [count, setCount] = useState(5);
  const [targetFolderId, setTargetFolderId] = useState(activeFolderId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: GeneratorParams = { 
          topic, 
          difficulty, 
          count, 
          folderId: targetFolderId 
      };
      // Note: generateVocabulary doesn't strictly need folderId for API, but we assign it after
      const newCards = await generateVocabulary(params);
      
      // Assign folder ID to generated cards
      const cardsWithFolder = newCards.map(c => ({ ...c, folderId: targetFolderId }));
      
      onGenerate(cardsWithFolder);
      onClose();
    } catch (err) {
      setError("Failed to generate content. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <div className="bg-rose-50 p-6 border-b border-rose-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-rose-600">
            <Sparkles size={24} />
            <h2 className="text-xl font-bold">AI Deck Generator</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Target Folder
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              What do you want to learn?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Cooking, Office, Anime phrases..."
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Proficiency Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Number of Cards: <span className="font-bold text-rose-600">{count}</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all
              ${isLoading || !topic.trim() ? 'bg-stone-300 cursor-not-allowed shadow-none' : 'bg-rose-500 hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Deck
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};