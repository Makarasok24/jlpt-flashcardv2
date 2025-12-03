import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Plus, List, ArrowLeft, ArrowRight, RotateCcw, Camera, Settings, Home } from 'lucide-react';

import { VocabCard, AppMode, Folder } from './types';
import { INITIAL_DECK, INITIAL_FOLDERS, DEFAULT_FOLDER_ID } from './constants';
import { Flashcard } from './components/Flashcard';
import { Generator } from './components/Generator';
import { ManualInput } from './components/ManualInput';
import { ListMode } from './components/ListMode';
import { ImageCapture } from './components/ImageCapture';
import { FolderList } from './components/FolderList';
import { QuizMode } from './components/QuizMode';

export default function App() {
  // --- Data State ---
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('nihongo-flash-folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [cards, setCards] = useState<VocabCard[]>(() => {
    const saved = localStorage.getItem('nihongo-flash-cards');
    let loadedCards = saved ? JSON.parse(saved) : INITIAL_DECK;
    // Migration: Ensure all cards have a folderId
    return loadedCards.map((c: any) => ({
        ...c,
        folderId: c.folderId || DEFAULT_FOLDER_ID
    }));
  });

  // --- View State ---
  const [appMode, setAppMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // --- Study State ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Modal State ---
  const [showGenerator, setShowGenerator] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [showListMode, setShowListMode] = useState(false);

  // --- Computed ---
  const activeFolder = folders.find(f => f.id === activeFolderId);
  
  // Filter cards based on active folder, or show all for testing if needed (though usually we scope to folder)
  const filteredCards = activeFolderId 
    ? cards.filter(c => c.folderId === activeFolderId) 
    : [];

  const currentCard = filteredCards[currentIndex];
  const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('nihongo-flash-cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('nihongo-flash-folders', JSON.stringify(folders));
  }, [folders]);

  // --- Handlers: Navigation ---
  const goHome = () => {
    setAppMode(AppMode.DASHBOARD);
    setActiveFolderId(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setAppMode(AppMode.STUDY);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleStartQuiz = (folderId: string) => {
    setActiveFolderId(folderId);
    setAppMode(AppMode.QUIZ);
  };

  // --- Handlers: Data Management ---
  const handleCreateFolder = (name: string, theme: Folder['theme']) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      theme,
      createdAt: Date.now()
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleDeleteFolder = (folderId: string) => {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      // Also delete cards in that folder
      setCards(prev => prev.filter(c => c.folderId !== folderId));
      
      if (activeFolderId === folderId) {
          goHome();
      }
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (currentIndex >= filteredCards.length - 1) {
      setCurrentIndex(Math.max(0, filteredCards.length - 2));
    }
  };

  const handleToggleMastered = (id: string) => {
    setCards(prev => prev.map(c => 
      c.id === id ? { ...c, mastered: !c.mastered } : c
    ));
  };

  const handleAddCard = (newCard: VocabCard) => {
    setCards(prev => [newCard, ...prev]);
  };

  const handleGenerateCards = (newCards: VocabCard[]) => {
    setCards(prev => [...newCards, ...prev]);
    // If we are studying the folder we just generated into, reset to show new cards
    if (newCards.length > 0 && newCards[0].folderId === activeFolderId) {
        setCurrentIndex(0);
    }
  };

  // --- Handlers: Study Interaction ---
  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleReset = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(0), 150);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-800 font-sans">
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-stone-200">
        <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
          <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            日
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">Nihongo Flash</h1>
        </div>

        <div className="flex gap-2">
           {appMode !== AppMode.DASHBOARD && (
             <button onClick={goHome} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
               <Home size={20} />
             </button>
           )}
           
           <div className="h-6 w-px bg-stone-200 my-auto mx-1"></div>

           <button 
            onClick={() => setShowImageCapture(true)}
            className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Scan Image"
          >
            <Camera size={20} />
          </button>
          <button 
            onClick={() => setShowGenerator(true)}
            className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
            title="Generate with AI"
          >
            <Sparkles size={20} />
          </button>
          <button 
            onClick={() => setShowManualInput(true)}
            className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
            title="Add Manually"
          >
            <Plus size={20} />
          </button>
          
          {appMode === AppMode.STUDY && (
            <button 
                onClick={() => setShowListMode(true)}
                className="ml-2 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-200 flex items-center gap-2"
            >
                <List size={16} />
                <span className="hidden sm:inline">Deck</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* DASHBOARD VIEW */}
        {appMode === AppMode.DASHBOARD && (
            <FolderList 
                folders={folders}
                cards={cards}
                onSelectFolder={handleSelectFolder}
                onStartQuiz={handleStartQuiz}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
            />
        )}

        {/* QUIZ VIEW */}
        {appMode === AppMode.QUIZ && activeFolderId && (
            <QuizMode 
                cards={filteredCards}
                onClose={goHome}
            />
        )}

        {/* STUDY VIEW */}
        {appMode === AppMode.STUDY && (
            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 relative">
                
                {/* Folder Header */}
                <div className="mb-6 text-center">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Studying</span>
                    <h2 className="text-xl font-bold text-stone-800">{activeFolder?.name}</h2>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-stone-200 rounded-full mb-8 overflow-hidden">
                    <div 
                    className="h-full bg-rose-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Card Area */}
                <div className="flex-1 flex flex-col justify-center relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                    {filteredCards.length > 0 ? (
                        <motion.div
                        key={currentCard.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                        >
                        <Flashcard 
                            card={currentCard}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                        />
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 text-stone-400 w-full bg-white rounded-3xl border border-stone-100 shadow-sm">
                            <p className="mb-4">This folder is empty.</p>
                            <button 
                                onClick={() => setShowGenerator(true)}
                                className="text-rose-500 font-bold hover:underline"
                            >
                                Generate some cards?
                            </button>
                        </div>
                    )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                {filteredCards.length > 0 && (
                    <div className="flex items-center justify-between mt-8 mb-4 px-4">
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-white shadow-lg shadow-stone-100 text-stone-800 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-110 active:scale-95 border border-stone-50"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <button 
                        onClick={handleReset}
                        className="p-3 text-stone-400 hover:text-stone-600 transition-colors"
                        title="Reset Deck"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button 
                        onClick={handleNext}
                        disabled={currentIndex === filteredCards.length - 1}
                        className="p-4 rounded-full bg-stone-900 shadow-lg shadow-stone-300 text-white disabled:opacity-30 disabled:shadow-none transition-all hover:scale-110 active:scale-95"
                    >
                        <ArrowRight size={24} />
                    </button>
                    </div>
                )}
                
                <div className="text-center text-xs text-stone-400 font-medium">
                    {filteredCards.length > 0 ? `${currentIndex + 1} / ${filteredCards.length}` : '0 / 0'}
                </div>
            </div>
        )}
      </main>

      {/* Modals */}
      {showGenerator && (
        <Generator 
          folders={folders}
          activeFolderId={activeFolderId || DEFAULT_FOLDER_ID}
          onGenerate={handleGenerateCards} 
          onClose={() => setShowGenerator(false)} 
        />
      )}

      {showManualInput && (
        <ManualInput 
          folders={folders}
          activeFolderId={activeFolderId || DEFAULT_FOLDER_ID}
          onAdd={handleAddCard} 
          onClose={() => setShowManualInput(false)} 
        />
      )}

      {showImageCapture && (
        <ImageCapture
          folders={folders}
          activeFolderId={activeFolderId || DEFAULT_FOLDER_ID}
          onGenerate={handleGenerateCards}
          onClose={() => setShowImageCapture(false)}
        />
      )}

      {showListMode && activeFolderId && (
        <ListMode 
          cards={filteredCards}
          onDelete={handleDeleteCard}
          onToggleMastered={handleToggleMastered}
          onClose={() => setShowListMode(false)}
        />
      )}

    </div>
  );
}