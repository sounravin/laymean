import React from 'react';
import { FRAME_TEMPLATES, FrameTemplate } from './AvatarWithFrame';
import AvatarWithFrame from './AvatarWithFrame';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../i18n';

interface FrameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrameId?: string;
  onSelectFrame: (frameId: string) => void;
  borrowerName: string;
  photoUrl?: string;
}

export default function FrameSelectorModal({
  isOpen,
  onClose,
  currentFrameId = '',
  onSelectFrame,
  borrowerName,
  photoUrl,
}: FrameSelectorModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-800 text-lg leading-tight">
              {language === 'kh' ? 'ជ្រើសរើសស៊ុមប្រវត្តិរូប (Avatar Frame)' : 'Choose Profile Frame'}
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {language === 'kh' ? 'ស៊ុមមានចលនាពិសេសសម្រាប់គណនី ' : 'Special animated frame for '}
              <span className="text-blue-600">{borrowerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with active preview */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Live Preview Box */}
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
            {/* Ambient Background Glow matching the active frame */}
            {currentFrameId && currentFrameId !== 'none' && (
              <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-r ${
                FRAME_TEMPLATES.find(f => f.id === currentFrameId)?.color || 'from-blue-500 to-purple-500'
              } opacity-10 blur-xl animate-pulse`} />
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
              <AvatarWithFrame
                photoUrl={photoUrl}
                name={borrowerName}
                frameId={currentFrameId || 'none'}
                size="lg"
              />
              <div className="text-center">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'kh' ? 'ទិដ្ឋភាពបង្ហាញសាកល្បង (Live Preview)' : 'Live Preview'}
                </span>
                <span className="text-sm font-extrabold text-slate-700">
                  {currentFrameId && currentFrameId !== 'none'
                    ? (language === 'kh'
                        ? FRAME_TEMPLATES.find(f => f.id === currentFrameId)?.nameKh
                        : FRAME_TEMPLATES.find(f => f.id === currentFrameId)?.nameEn)
                    : (language === 'kh' ? 'គ្មានស៊ុមប្រវត្តិរូបទេ' : 'No Frame Selected')}
                </span>
              </div>
            </div>
          </div>

          {/* List of Templates */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              {language === 'kh' ? 'ម៉ូដស៊ុមដែលមាន (Available Templates)' : 'Available Templates'}
            </h4>

            {/* Standard "No Frame" Option */}
            <button
              onClick={() => onSelectFrame('')}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                !currentFrameId || currentFrameId === 'none'
                  ? 'border-blue-500 bg-blue-50/40 text-blue-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full border border-slate-300 border-dashed bg-slate-100/50 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                <h5 className="text-xs font-black text-slate-800">
                  {language === 'kh' ? 'បិទស៊ុម / គ្មានស៊ុម (No Frame)' : 'Disable / No Frame'}
                </h5>
                <p className="text-[11px] text-slate-400 font-bold leading-tight mt-0.5">
                  {language === 'kh' ? 'បង្ហាញតែរូបថតធម្មតាដោយគ្មានស៊ុមតុបតែង' : 'Show only standard profile photo without frames'}
                </p>
              </div>
              {(!currentFrameId || currentFrameId === 'none') && (
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </button>

            {/* Templates loop */}
            {FRAME_TEMPLATES.map((tmpl) => {
              const isSelected = currentFrameId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => onSelectFrame(tmpl.id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 text-blue-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="shrink-0 relative">
                    <AvatarWithFrame
                      photoUrl={photoUrl}
                      name={borrowerName}
                      frameId={tmpl.id}
                      size="sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${tmpl.color}`} />
                      <span>{language === 'kh' ? tmpl.nameKh : tmpl.nameEn}</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 font-bold leading-tight mt-1 truncate">
                      {language === 'kh' ? tmpl.descriptionKh : tmpl.descriptionEn}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-600 font-black rounded-xl text-xs transition duration-150 cursor-pointer shadow-sm text-center"
          >
            {language === 'kh' ? 'រួចរាល់ / បិទ' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
