import React, { useRef, useEffect, useState } from 'react';
import { WalkRecord, InstagramProfile } from '../types';
import { renderStoryToCanvas, downloadCanvasAsPng } from '../utils/canvasRenderer';
import { InstagramEmbedViewer } from './InstagramEmbedViewer';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Layers, 
  Trash2, 
  Plus,
  Instagram,
  ExternalLink,
  Smartphone,
  Eye
} from 'lucide-react';

interface WalkDetailModalProps {
  record: WalkRecord;
  onClose: () => void;
  onOpenReactionModal: (record: WalkRecord) => void;
  onDeleteRecord: (id: string) => void;
  instagramProfile?: InstagramProfile;
  onUpdateRecordPhoto?: (recordId: string, newImageUrl: string) => void;
}

export const WalkDetailModal: React.FC<WalkDetailModalProps> = ({
  record,
  onClose,
  onOpenReactionModal,
  onDeleteRecord,
  instagramProfile,
  onUpdateRecordPhoto,
}) => {
  const [viewMode, setViewMode] = useState<'story' | 'instagram'>('story');
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authorHandle = record.templateCustomization?.authorHandle || instagramProfile?.username || '@duweon_choo';
  const postUrl = record.instagramPostUrl || (record.instagramShortcode ? `https://www.instagram.com/p/${record.instagramShortcode}/` : `https://www.instagram.com/duweon_choo/`);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateRecordPhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUpdateRecordPhoto(record.id, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const draw = async () => {
      if (!canvasRef.current || viewMode !== 'story') return;
      try {
        await renderStoryToCanvas(
          {
            record,
            template: record.selectedTemplate || 'templateB',
            copyText: record.selectedCopyText,
            customization: {
              ...record.templateCustomization,
              authorHandle,
            },
          },
          canvasRef.current
        );
      } catch (e) {
        console.error(e);
      }
    };
    draw();
  }, [record, authorHandle, viewMode]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(
      canvasRef.current,
      `Story_${record.location || 'Walk'}_${record.date}_duweon_choo.png`
    );
  };

  const handleCopyCaption = () => {
    const hashtags = (record.spatialAnalysis?.keywords || []).join(' ');
    const text = `[산책의 시선]
${record.selectedCopyText}

📍 ${record.location}
🗓 ${record.date}
📸 by ${authorHandle} (https://instagram.com/${authorHandle.replace('@', '')})

${hashtags} #산책의시선 #공간영감 #스토리아카이브 #duweon_choo`;

    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-[#F9F8F6] rounded-2xl border border-[#E5E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex p-0.5 rounded-lg bg-[#F0EFED] border border-[#E5E2DD]">
              <button
                onClick={() => setViewMode('story')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                  viewMode === 'story'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 스토리 뷰</span>
              </button>
              <button
                onClick={() => setViewMode('instagram')}
                className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                  viewMode === 'instagram'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>실제 인스타 게시물</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#1A1A1A]/60">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {record.date.replace(/-/g, '.')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-[#1A1A1A]">
                <MapPin className="w-3.5 h-3.5" />
                {record.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#1A1A1A]/70 hover:text-[#1A1A1A] px-3 py-1.5 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] hidden md:flex items-center gap-1 transition-colors"
            >
              <Instagram className="w-3 h-3 text-pink-600" />
              <span>원본 인스타</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <button
              onClick={() => onDeleteRecord(record.id)}
              className="text-[#1A1A1A]/40 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="기록 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] flex items-center justify-center text-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Visual Canvas / Instagram Embed */}
            <div className="md:col-span-5 flex flex-col items-center">
              {viewMode === 'story' ? (
                <>
                  <div className="w-full max-w-[280px] bg-white p-2.5 rounded-[32px] shadow-xl border border-[#E5E2DD]">
                    <div className="relative rounded-[24px] overflow-hidden aspect-9/16 bg-black">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 w-full max-w-[280px] mt-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#333333] text-white rounded-full text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>다운로드</span>
                    </button>
                    <button
                      onClick={handleCopyCaption}
                      className="py-2.5 px-3 bg-white hover:bg-[#F0EFED] text-[#1A1A1A] border border-[#E5E2DD] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="캡션 복사"
                    >
                      {hasCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{hasCopied ? '복사됨' : '캡션 복사'}</span>
                    </button>
                  </div>

                  {/* Real Instagram Photo Upload & Swap */}
                  {onUpdateRecordPhoto && (
                    <div className="w-full max-w-[280px] mt-2.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] text-xs font-medium flex items-center justify-center gap-1.5 border border-[#E5E2DD] transition-colors"
                      >
                        <Instagram className="w-3 h-3 text-[#1A1A1A]/70" />
                        <span>실제 인스타 사진으로 교체하기</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full max-w-[320px]">
                  <InstagramEmbedViewer
                    url={record.instagramPostUrl}
                    shortcode={record.instagramShortcode || 'DF9abc12345'}
                  />
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setViewMode('story')}
                      className="text-xs text-[#1A1A1A] font-bold hover:underline"
                    >
                      ← 9:16 공간 스토리 뷰로 돌아가기
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details, AI Analysis, Quotes, Reactions */}
            <div className="md:col-span-7 space-y-5">
              
              {/* User Original Memo */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E2DD]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40 block mb-1">
                  산책자의 관찰 메모 (인스타그램 캡션)
                </span>
                <p className="font-serif-kr text-xs sm:text-sm text-[#1A1A1A]/80 italic leading-relaxed">
                  "{record.note}"
                </p>
              </div>

              {/* Selected Story Copy */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E2DD]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40 block mb-1">
                  스토리 적용 문장
                </span>
                <blockquote className="font-serif-kr text-sm sm:text-base font-normal text-[#1A1A1A] leading-relaxed">
                  "{record.selectedCopyText}"
                </blockquote>

                {/* Spatial Keywords Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#F0EFED]">
                  {(record.spatialAnalysis?.keywords || []).map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0EFED] text-[#1A1A1A]/80 border border-[#E5E2DD]"
                    >
                      {kw.startsWith('#') ? kw : `#${kw}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Spatial Interpretation Breakdown */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E2DD] space-y-2.5 text-xs leading-relaxed">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  공간 디자인적 해석
                </h4>

                <div className="grid grid-cols-1 gap-2 text-[#1A1A1A]/70">
                  <div>
                    <span className="font-bold text-[#1A1A1A]">분위기: </span>
                    {record.spatialAnalysis?.mood}
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A]">빛과 그림자: </span>
                    {record.spatialAnalysis?.lightAndShadow}
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A]">소재와 색채: </span>
                    {record.spatialAnalysis?.materialsAndColors}
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1A1A]">건축적 디테일: </span>
                    {record.spatialAnalysis?.architecturalFeature}
                  </div>
                </div>
              </div>

              {/* Audience Reactions Section */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E2DD] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    사람들의 반응 ({record.reactions?.length || 0})
                  </h4>
                  <button
                    onClick={() => onOpenReactionModal(record)}
                    className="text-xs font-bold text-[#1A1A1A] hover:opacity-70 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>반응 추가</span>
                  </button>
                </div>

                {(!record.reactions || record.reactions.length === 0) ? (
                  <p className="text-xs text-[#1A1A1A]/40 py-2">
                    아직 등록된 반응이 없습니다. 스토리를 본 사람들의 피드백을 기록해보세요.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {record.reactions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-3 rounded-xl bg-[#F9F8F6] border border-[#E5E2DD] text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#1A1A1A] bg-[#E5E2DD] px-2 py-0.5 rounded-full text-[10px]">
                            {rx.type}
                          </span>
                          <span className="text-[10px] text-[#1A1A1A]/40">{rx.createdAt}</span>
                        </div>
                        <p className="text-[#1A1A1A] font-medium">"{rx.content}"</p>
                        {rx.author && (
                          <span className="text-[10px] text-[#1A1A1A]/60 block mt-1">
                            by {rx.author}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E2DD] bg-white flex justify-between items-center">
          <button
            onClick={() => onOpenReactionModal(record)}
            className="px-4 py-2 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#E5E2DD]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>반응 기록 관리</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1A1A1A] text-white text-xs font-bold tracking-wider hover:bg-[#333333] transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};


