import React, { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Plus, Play, BrainCircuit, Trash2, Edit2 } from 'lucide-react';
import { Folder, VocabCard } from '../types';
import { FOLDER_THEMES } from '../constants';

interface FolderListProps {
  folders: Folder[];
  cards: VocabCard[];
  onSelectFolder: (folderId: string) => void;
  onStartQuiz: (folderId: string) => void;
  onCreateFolder: (name: string, theme: Folder['theme']) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const FolderList: React.FC<FolderListProps> = ({ 
  folders, 
  cards, 
  onSelectFolder, 
  onStartQuiz,
  onCreateFolder,
  onDeleteFolder
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderTheme, setNewFolderTheme] = useState<Folder['theme']>('rose');

  const getCardCount = (folderId: string) => cards.filter(c => c.folderId === folderId).length;
  const getMasteredCount = (folderId: string) => cards.filter(c => c.folderId === folderId && c.mastered).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName, newFolderTheme);
      setNewFolderName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">My Library</h2>
          <p className="text-stone-500 mt-1">Select a deck to study or take a quiz</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
        >
          <Plus size={20} />
          <span>New Folder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map(folder => {
          const cardCount = getCardCount(folder.id);
          const masteredCount = getMasteredCount(folder.id);
          const progress = cardCount > 0 ? (masteredCount / cardCount) * 100 : 0;
          const themeStyle = FOLDER_THEMES[folder.theme];

          return (
            <div key={folder.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative flex flex-col h-56">
              <div className={`p-4 border-b ${themeStyle.replace('bg-', 'border-').split(' ')[2]} bg-opacity-30 flex justify-between items-start`}>
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${themeStyle}`}>
                     <FolderIcon size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-stone-800 truncate max-w-[150px]">{folder.name}</h3>
                     <p className="text-xs text-stone-500">{cardCount} Cards</p>
                   </div>
                 </div>
                 
                 {/* Optional: Add Dropdown menu for Edit/Delete here if needed */}
                 {folder.id !== 'default-folder' && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete this folder and all its cards?')) onDeleteFolder(folder.id);
                        }}
                        className="text-stone-300 hover:text-red-400 p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                 )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>Mastery</span>
                      <span>{Math.round(progress)}%</span>
                   </div>
                   <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${themeStyle.split(' ')[0].replace('100', '400')}`} style={{ width: `${progress}%` }} />
                   </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => onSelectFolder(folder.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium rounded-lg transition-colors"
                  >
                    <Play size={16} />
                    Study
                  </button>
                  <button 
                    onClick={() => onStartQuiz(folder.id)}
                    disabled={cardCount === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BrainCircuit size={16} />
                    Quiz
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Create New Folder</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Folder Name</label>
                  <input 
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="e.g., JLPT N5 Verbs"
                    className="w-full p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">Color Theme</label>
                  <div className="flex gap-3">
                    {(['rose', 'emerald', 'blue', 'amber', 'purple', 'stone'] as const).map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setNewFolderTheme(color)}
                            className={`w-8 h-8 rounded-full border-2 ${newFolderTheme === color ? 'border-stone-800 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: `var(--color-${color}-200)` }} 
                        >
                            <div className={`w-full h-full rounded-full bg-${color}-400`}></div>
                        </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-stone-500 font-medium hover:bg-stone-50 rounded-lg">Cancel</button>
                   <button type="submit" disabled={!newFolderName.trim()} className="flex-1 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50">Create</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};