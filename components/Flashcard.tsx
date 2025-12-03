import React from 'react';
import { motion } from 'framer-motion';
import { VocabCard, CardFace } from '../types';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  card: VocabCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  
  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="relative w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000 mx-auto"
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' } as any}
      >
        {/* Front Face (Kanji) */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden border border-stone-100"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs rounded-full font-medium">
              Click to Flip
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-7xl md:text-8xl font-bold text-stone-800 font-jp mb-4 text-center">
              {card.kanji}
            </h2>
            {/* Show Kana hint if Kanji is complex? Maybe optional. Keeping clean for now. */}
            {card.tags && (
              <div className="flex gap-2 flex-wrap justify-center mt-4">
                {card.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Face (Details) */}
        <div 
          className="absolute inset-0 w-full h-full bg-stone-900 text-stone-50 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={(e) => playAudio(e, card.kanji)}
              className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors"
              title="Play Audio"
            >
              <Volume2 size={18} className="text-rose-400" />
            </button>
          </div>

          <div className="text-center space-y-6 w-full">
            <div>
              <p className="text-stone-400 text-sm font-medium tracking-widest uppercase mb-1">Reading</p>
              <h3 className="text-3xl font-jp text-rose-300 font-medium">{card.kana}</h3>
              <p className="text-stone-500 text-sm mt-1 font-mono">{card.romaji}</p>
            </div>

            <div className="w-12 h-0.5 bg-stone-700 mx-auto" />

            <div>
              <p className="text-stone-400 text-sm font-medium tracking-widest uppercase mb-1">Meaning</p>
              <h4 className="text-2xl font-bold">{card.english}</h4>
            </div>

            {card.exampleSentence && (
              <div className="bg-stone-800/50 p-4 rounded-xl mt-4 text-left w-full">
                <p className="text-lg font-jp mb-1">{card.exampleSentence}</p>
                <p className="text-sm text-stone-400">{card.exampleTranslation}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};