import React from 'react';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { VocabCard } from '../types';

interface ListModeProps {
  cards: VocabCard[];
  onDelete: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onClose: () => void;
}

export const ListMode: React.FC<ListModeProps> = ({ cards, onDelete, onToggleMastered, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 bg-stone-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-stone-800">My Deck <span className="text-stone-400 text-sm ml-2 font-normal">({cards.length} cards)</span></h2>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Back to Study
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {cards.length === 0 ? (
             <div className="text-center py-20 text-stone-400">
                <p>No cards yet. Use the generator or add one manually!</p>
             </div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                <button 
                  onClick={() => onToggleMastered(card.id)}
                  className={`flex-shrink-0 transition-colors ${card.mastered ? 'text-green-500' : 'text-stone-300 hover:text-stone-400'}`}
                >
                  {card.mastered ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-jp font-bold text-stone-800">{card.kanji}</span>
                    <span className="text-sm text-stone-500 font-jp">{card.kana}</span>
                  </div>
                  <p className="text-stone-600 truncate">{card.english}</p>
                </div>

                <div className="flex items-center gap-2">
                   {card.tags && card.tags.slice(0, 1).map(t => (
                       <span key={t} className="hidden sm:inline-block px-2 py-1 bg-stone-100 text-stone-500 text-xs rounded">{t}</span>
                   ))}
                   <button 
                    onClick={() => onDelete(card.id)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
