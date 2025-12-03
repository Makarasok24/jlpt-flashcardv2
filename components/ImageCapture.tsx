import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateVocabularyFromImage } from '../services/geminiService';
import { VocabCard, Folder } from '../types';

interface ImageCaptureProps {
  folders: Folder[];
  activeFolderId: string;
  onGenerate: (cards: VocabCard[]) => void;
  onClose: () => void;
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({ folders, activeFolderId, onGenerate, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [targetFolderId, setTargetFolderId] = useState(activeFolderId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Please use an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const newCards = await generateVocabularyFromImage(image);
      if (newCards.length === 0) {
        throw new Error("No vocabulary could be extracted from this image.");
      }
      // Assign folder ID
      const cardsWithFolder = newCards.map(c => ({ ...c, folderId: targetFolderId }));
      onGenerate(cardsWithFolder);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to extract vocabulary. Please ensure the image is clear and contains a list of words.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 text-indigo-700">
            <Camera size={24} />
            <h2 className="text-xl font-bold">Scan from Image</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Save to Folder
            </label>
            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {!image ? (
            <div 
              className="border-2 border-dashed border-stone-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-stone-500 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer min-h-[200px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-medium text-stone-700">Click to upload or take a photo</p>
                <p className="text-sm text-stone-400 mt-1">Supports JPG, PNG</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-auto max-h-[400px] object-contain mx-auto" 
                />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-center text-stone-400">
                Gemini will scan this image for vocabulary lists.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-100 flex-shrink-0 bg-stone-50">
          <button
            onClick={handleProcess}
            disabled={isLoading || !image}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
              ${isLoading || !image 
                ? 'bg-stone-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <ImageIcon size={20} />
                Extract Vocabulary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};