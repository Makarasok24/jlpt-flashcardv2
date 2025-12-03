import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { VocabCard, Folder } from '../types';

interface ManualInputProps {
  folders: Folder[];
  activeFolderId: string;
  onAdd: (card: VocabCard) => void;
  onClose: () => void;
}

export const ManualInput: React.FC<ManualInputProps> = ({ folders, activeFolderId, onAdd, onClose }) => {
  const [targetFolderId, setTargetFolderId] = useState(activeFolderId);
  const [form, setForm] = useState<Partial<VocabCard>>({
    kanji: '',
    kana: '',
    romaji: '',
    english: '',
    exampleSentence: '',
    exampleTranslation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kanji || !form.english) return;

    const newCard: VocabCard = {
      id: crypto.randomUUID(),
      folderId: targetFolderId,
      kanji: form.kanji!,
      kana: form.kana || '',
      romaji: form.romaji || '',
      english: form.english!,
      exampleSentence: form.exampleSentence,
      exampleTranslation: form.exampleTranslation,
      tags: ['Manual'],
      mastered: false
    };

    onAdd(newCard);
    onClose();
  };

  const handleChange = (field: keyof VocabCard, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Plus size={20} className="text-emerald-500" />
            Add New Card
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
           <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Save to Folder</label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase">Kanji / Word</label>
              <input 
                required
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 飛行機"
                value={form.kanji}
                onChange={e => handleChange('kanji', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Kana (Reading)</label>
              <input 
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. ひこうき"
                value={form.kana}
                onChange={e => handleChange('kana', e.target.value)}
              />
            </div>
             <div>
              <label className="text-xs font-semibold text-stone-500 uppercase">Romaji</label>
              <input 
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. hikouki"
                value={form.romaji}
                onChange={e => handleChange('romaji', e.target.value)}
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase">English Meaning</label>
              <input 
                required
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Airplane"
                value={form.english}
                onChange={e => handleChange('english', e.target.value)}
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-dashed">
                <p className="text-xs text-stone-400 mb-2">Optional Examples</p>
                <div className="space-y-3">
                   <input 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    placeholder="Japanese sentence"
                    value={form.exampleSentence}
                    onChange={e => handleChange('exampleSentence', e.target.value)}
                  />
                   <input 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    placeholder="Translation"
                    value={form.exampleTranslation}
                    onChange={e => handleChange('exampleTranslation', e.target.value)}
                  />
                </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};