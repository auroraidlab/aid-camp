import React, { useState } from 'react';
import { WalkRecord } from '../types';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ExternalLink,
  Instagram,
  RefreshCw
} from 'lucide-react';

interface PhotoManagerModalProps {
  records: WalkRecord[];
  onUpdateRecordPhoto: (recordId: string, newImageUrl: string) => void;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  records,
  onUpdateRecordPhoto,
  onClose,
  onShowToast,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && selectedRecordId) {
          onUpdateRecordPhoto(selectedRecordId, result);
          setPreviewImage(result);
          onShowToast(`📸 '${currentRecord?.location}' 스토리에 실제 인스타 사진이 적용되었습니다.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !selectedRecordId) return;
    onUpdateRecordPhoto(selectedRecordId, customUrl.trim());
    setPreviewImage(customUrl.trim());
    setCustomUrl('');
    onShowToast(`📸 '${currentRecord?.location}' 스토리에 사진 URL이 적용되었습니다.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#F9F8F6] rounded-2xl border border-[#E5E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-0.5">
                Real Story Photo Manager
              </span>
              <h3 className="font-serif-kr text-lg sm:text-xl font-normal text-[#1A1A1A]">
                실제 인스타그램 스토리 사진 등록 & 교체
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] flex items-center justify-center text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Bar */}
        <div className="bg-[#1A1A1A] text-white px-6 py-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
            <span>
              <strong>@duweon_choo</strong> 계정의 실제 인스타 스토리 원본 사진(폰/PC 파일)을 각 카드에 등록하세요.
            </span>
          </div>
          <a
            href="https://www.instagram.com/duweon_choo/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] underline text-white/80 hover:text-white flex items-center gap-1 shrink-0"
          >
            <span>내 인스타 바로가기</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: List of 8 Stories */}
            <div className="md:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40 block mb-1">
                사진을 바꿀 스토리 선택 ({records.length}개)
              </span>

              {records.map((rec) => {
                const isSelected = rec.id === selectedRecordId;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecordId(rec.id);
                      setPreviewImage(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white border-[#1A1A1A] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'bg-white/60 hover:bg-white border-[#E5E2DD]'
                    }`}
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[#E5E2DD]">
                      <img
                        src={rec.image}
                        alt={rec.location}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#1A1A1A]/50 font-medium mb-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{rec.date.replace(/-/g, '.')}</span>
                      </div>
                      <h4 className="font-bold text-xs text-[#1A1A1A] truncate">
                        {rec.location}
                      </h4>
                      <p className="text-[10px] text-[#1A1A1A]/60 truncate mt-0.5">
                        {rec.selectedCopyText}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Upload & Action for Selected Story */}
            <div className="md:col-span-7 space-y-4">
              {currentRecord && (
                <div className="bg-white rounded-xl p-5 border border-[#E5E2DD] shadow-xs space-y-4">
                  
                  {/* Selected Story Info */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0EFED]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EFED] text-[#1A1A1A]/80">
                          {currentRecord.date}
                        </span>
                        <h4 className="font-bold text-sm text-[#1A1A1A]">
                          {currentRecord.location}
                        </h4>
                      </div>
                      <p className="text-xs text-[#1A1A1A]/70 mt-1 line-clamp-2">
                        "{currentRecord.selectedCopyText}"
                      </p>
                    </div>
                  </div>

                  {/* Current Photo Preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-36 rounded-xl overflow-hidden bg-black shrink-0 border-2 border-[#1A1A1A]/10 shadow-sm relative">
                      <img
                        src={previewImage || currentRecord.image}
                        alt="Current preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                        9:16
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      <h5 className="font-bold text-xs text-[#1A1A1A]">
                        실제 인스타 사진 등록하기
                      </h5>
                      <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed">
                        스마트폰이나 PC에 저장된 원본 사진 파일을 업로드하면 9:16 스토리 캔버스에 즉시 반영됩니다.
                      </p>

                      {/* File Upload Button */}
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>내 기기에서 사진 파일 선택</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Alternative: Image URL Input */}
                  <div className="pt-3 border-t border-[#F0EFED] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40 block">
                      또는 이미지 웹 링크(URL) 직접 입력
                    </span>
                    <form onSubmit={handleUrlSubmit} className="flex gap-2">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://... 이미지 URL 붙여넣기"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E5E2DD] bg-[#F9F8F6] focus:bg-white focus:outline-hidden focus:border-[#1A1A1A]"
                      />
                      <button
                        type="submit"
                        disabled={!customUrl.trim()}
                        className="px-4 py-2 rounded-lg bg-[#F0EFED] hover:bg-[#E5E2DD] disabled:opacity-40 text-xs font-bold text-[#1A1A1A] transition-colors"
                      >
                        적용
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E2DD] flex items-center justify-between bg-white">
          <span className="text-xs text-[#1A1A1A]/50">
            등록된 사진은 로컬 스토리지에 안전하게 저장되며 스토리 다운로드 시에도 선명하게 렌더링됩니다.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1A1A1A] text-white text-xs font-bold hover:bg-[#333333] transition-colors"
          >
            완료
          </button>
        </div>

      </div>
    </div>
  );
};
