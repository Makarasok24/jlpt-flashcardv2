import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabCard } from '../types';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, BrainCircuit } from 'lucide-react';

interface QuizModeProps {
  cards: VocabCard[];
  onClose: () => void;
}

type QuizType = 'MEANING' | 'RECALL' | 'READING';

interface Question {
  id: string;
  card: VocabCard;
  type: QuizType;
  options: VocabCard[]; // 4 options
  correctOptionId: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({ cards, onClose }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Quiz
  useEffect(() => {
    if (cards.length < 4) return; // Need at least 4 cards for a good quiz
    generateQuiz();
  }, [cards]);

  const generateQuiz = () => {
    // Shuffle cards
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    // Take up to 10 cards for the quiz
    const quizDeck = shuffled.slice(0, 10);
    
    const newQuestions: Question[] = quizDeck.map((card, index) => {
      // Determine Question Type
      // If card has no Kanji (same as Kana), don't do Reading test
      const validTypes: QuizType[] = card.kanji === card.kana 
        ? ['MEANING', 'RECALL'] 
        : ['MEANING', 'RECALL', 'READING'];
      
      const type = validTypes[Math.floor(Math.random() * validTypes.length)];
      
      // Select Distractors (3 random other cards)
      const otherCards = cards.filter(c => c.id !== card.id);
      const distractors = otherCards.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // If not enough cards for distractors (edge case < 4 total cards), fill with duplicates or handle
      // But we checked cards.length >= 4 earlier.
      
      const options = [...distractors, card].sort(() => 0.5 - Math.random());

      return {
        id: `q-${index}`,
        card,
        type,
        options,
        correctOptionId: card.id
      };
    });

    setQuestions(newQuestions);
    setScore(0);
    setCurrentIndex(0);
    setGameState('intro');
    setSelectedOptionId(null);
  };

  const handleStart = () => {
    setGameState('playing');
  };

  const handleAnswer = (optionId: string) => {
    if (isProcessing || selectedOptionId) return;

    setSelectedOptionId(optionId);
    setIsProcessing(true);

    const isCorrect = optionId === questions[currentIndex].correctOptionId;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Auto advance
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOptionId(null);
        setIsProcessing(false);
      } else {
        setGameState('result');
        setIsProcessing(false);
      }
    }, 1500); // 1.5s delay to see feedback
  };

  // Helper to render question text based on type
  const renderQuestionText = (question: Question) => {
    switch (question.type) {
      case 'MEANING':
        return (
            <div className="text-center">
                <span className="text-sm text-stone-400 uppercase tracking-widest font-bold mb-2 block">What is the meaning of?</span>
                <h2 className="text-6xl font-bold text-stone-800 font-jp mb-2">{question.card.kanji}</h2>
                {question.card.kanji !== question.card.kana && (
                     <p className="text-xl text-stone-500 font-jp">{question.card.kana}</p>
                )}
            </div>
        );
      case 'RECALL':
        return (
            <div className="text-center">
                <span className="text-sm text-stone-400 uppercase tracking-widest font-bold mb-2 block">How do you write?</span>
                <h2 className="text-4xl font-bold text-stone-800 mb-2">{question.card.english}</h2>
            </div>
        );
      case 'READING':
        return (
            <div className="text-center">
                <span className="text-sm text-stone-400 uppercase tracking-widest font-bold mb-2 block">What is the reading for?</span>
                <h2 className="text-6xl font-bold text-stone-800 font-jp mb-2">{question.card.kanji}</h2>
            </div>
        );
    }
  };

  // Helper to render option text based on type
  const renderOptionText = (option: VocabCard, type: QuizType) => {
    switch (type) {
      case 'MEANING':
        return <span className="text-lg font-medium">{option.english}</span>;
      case 'RECALL':
        return (
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-jp">{option.kanji}</span>
                {option.kanji !== option.kana && <span className="text-xs text-stone-400">{option.kana}</span>}
            </div>
        );
      case 'READING':
        return <span className="text-xl font-bold font-jp">{option.kana}</span>;
    }
  };

  if (cards.length < 4) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <BrainCircuit size={48} className="text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-700 mb-2">Not Enough Cards</h2>
        <p className="text-stone-500 max-w-xs mb-6">
            You need at least 4 cards in this folder to start a quiz.
        </p>
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col h-full relative bg-stone-50">
      
      {/* HEADER */}
      <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200">
        <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors">
                <XCircle size={24} />
             </button>
             {gameState === 'playing' && (
                <div className="flex flex-col">
                    <span className="text-xs text-stone-400 font-bold uppercase">Question</span>
                    <span className="font-bold text-stone-800">{currentIndex + 1} / {questions.length}</span>
                </div>
             )}
        </div>
        {gameState === 'playing' && (
             <div className="font-mono font-bold text-indigo-600 text-lg">
                Score: {score}
             </div>
        )}
      </div>
      
      {/* GAME AREA */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
        
        {/* Intro Screen */}
        {gameState === 'intro' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-indigo-200 shadow-lg">
                    <BrainCircuit size={48} />
                </div>
                <h1 className="text-3xl font-bold text-stone-800 mb-3">Quiz Time!</h1>
                <p className="text-stone-500 mb-8">You will be tested on {questions.length} random cards from this folder.</p>
                <button 
                    onClick={handleStart}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                >
                    Start Quiz
                </button>
            </div>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="mb-6">
                    {score / questions.length > 0.7 ? (
                        <div className="text-green-500 mb-2">
                             <CheckCircle2 size={64} className="mx-auto" />
                        </div>
                    ) : (
                        <div className="text-amber-500 mb-2">
                             <BrainCircuit size={64} className="mx-auto" />
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-stone-600 mb-1">Quiz Complete!</h2>
                <div className="text-6xl font-bold text-stone-800 mb-2 font-mono">
                    {score}/{questions.length}
                </div>
                <p className="text-stone-500 mb-8">
                    {score === questions.length ? "Perfect score! Outstanding!" : 
                     score > questions.length / 2 ? "Good job! Keep practicing." : 
                     "Keep studying, you'll get there!"}
                </p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => generateQuiz()} // Restart
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
                    >
                        <RotateCcw size={20} />
                        Retry
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition-colors"
                    >
                        <Home size={20} />
                        Dashboard
                    </button>
                </div>
            </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && currentQuestion && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right duration-300">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Question Card */}
                <div className="flex-1 flex flex-col justify-center items-center min-h-[200px] mb-8">
                    {renderQuestionText(currentQuestion)}
                </div>

                {/* Answer Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {currentQuestion.options.map((option) => {
                        const isSelected = selectedOptionId === option.id;
                        const isCorrect = option.id === currentQuestion.correctOptionId;
                        const showCorrect = selectedOptionId !== null && isCorrect; // Highlight correct answer if any answer selected
                        
                        let btnClass = "bg-white hover:border-indigo-300 border-stone-200 text-stone-700"; // Default
                        
                        if (selectedOptionId) {
                            if (isSelected) {
                                btnClass = isCorrect 
                                    ? "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500" 
                                    : "bg-red-50 border-red-300 text-red-700 ring-2 ring-red-200";
                            } else if (isCorrect) {
                                btnClass = "bg-green-50 border-green-400 text-green-800";
                            } else {
                                btnClass = "bg-stone-50 border-stone-100 text-stone-300 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={option.id}
                                disabled={!!selectedOptionId}
                                onClick={() => handleAnswer(option.id)}
                                className={`
                                    relative p-6 rounded-2xl border-2 shadow-sm text-center transition-all duration-200
                                    flex flex-col items-center justify-center min-h-[100px]
                                    ${btnClass}
                                    ${!selectedOptionId && "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"}
                                `}
                            >
                                {renderOptionText(option, currentQuestion.type)}
                                
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        {isCorrect ? <CheckCircle2 size={20} className="text-green-600"/> : <XCircle size={20} className="text-red-500"/>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {selectedOptionId && (
                   <div className="h-8 flex justify-center items-center text-sm font-medium text-stone-400 animate-pulse">
                        Next question coming up...
                   </div> 
                )}
            </div>
        )}
      </div>
    </div>
  );
};
