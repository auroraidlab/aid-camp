import React, { useState, useRef, useEffect } from 'react';
import { StoryTemplateId, TemplateCustomization, WalkRecord, InstagramProfile } from '../types';
import { renderStoryToCanvas, downloadCanvasAsPng } from '../utils/canvasRenderer';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Palette, 
  Layout, 
  Save, 
  ArrowLeft, 
  MessageSquare,
  Instagram,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface StoryVisualStudioProps {
  initialRecord: WalkRecord;
  onSaveRecord: (updatedRecord: WalkRecord, openReactionModalImmediately?: boolean) => void;
  onBack: () => void;
  instagramProfile?: InstagramProfile;
  onOpenInstagramModal?: () => void;
}

const TEMPLATES: { id: StoryTemplateId; name: string; desc: string; tag: string }[] = [
  {
    id: 'templateA',
    name: 'Template A : Minimalist',
    desc: '풀 블리드 사진 중심과 미니멀한 타이포그래피',
    tag: '사진 중심 & 감성',
  },
  {
    id: 'templateB',
    name: 'Template B : Editorial',
    desc: '대형 문장과 아키텍처 그리드 라인',
    tag: '공간 전문가 쿼트',
  },
  {
    id: 'templateC',
    name: 'Template C : Magazine',
    desc: '관찰 인덱스와 공간 키워드 디자인 매거진',
    tag: '아카이브 & 매거진',
  },
];

const THEMES: { id: TemplateCustomization['colorScheme']; name: string; color: string }[] = [
  { id: 'warm-sand', name: 'Warm Sand', color: '#F5F2EB' },
  { id: 'raw-concrete', name: 'Raw Concrete', color: '#EBECEE' },
  { id: 'deep-noir', name: 'Deep Noir', color: '#141416' },
  { id: 'sage-green', name: 'Sage Green', color: '#EFF3EF' },
  { id: 'terracotta', name: 'Terracotta', color: '#F9F3EF' },
];

export const StoryVisualStudio: React.FC<StoryVisualStudioProps> = ({
  initialRecord,
  onSaveRecord,
  onBack,
  instagramProfile,
  onOpenInstagramModal,
}) => {
  const [template, setTemplate] = useState<StoryTemplateId>(initialRecord.selectedTemplate || 'templateB');
  const [copyText, setCopyText] = useState<string>(initialRecord.selectedCopyText);
  const [customization, setCustomization] = useState<TemplateCustomization>(
    initialRecord.templateCustomization || {
      colorScheme: 'warm-sand',
      fontPairing: 'modern-serif',
      showDate: true,
      showLocation: true,
      showKeywords: true,
      showAuthorBadge: true,
      authorHandle: instagramProfile?.username || '@duweon_choo',
    }
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [hasCopiedCaption, setHasCopiedCaption] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync author handle from instagram profile if present
  useEffect(() => {
    if (instagramProfile?.username && !customization.authorHandle) {
      setCustomization((prev) => ({
        ...prev,
        authorHandle: instagramProfile.username,
      }));
    }
  }, [instagramProfile]);

  // Redraw preview whenever settings change
  useEffect(() => {
    let isCancelled = false;
    const redraw = async () => {
      if (!canvasRef.current) return;
      try {
        await renderStoryToCanvas(
          {
            record: initialRecord,
            template,
            copyText,
            customization,
          },
          canvasRef.current
        );
      } catch (err) {
        console.error('Error rendering story canvas', err);
      }
    };

    redraw();
    return () => {
      isCancelled = true;
    };
  }, [initialRecord, template, copyText, customization]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsGeneratingImage(true);
    try {
      const filename = `Story_${initialRecord.location || 'Walk'}_${initialRecord.date}_duweon_choo.png`;
      downloadCanvasAsPng(canvasRef.current, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const currentHandle = customization.authorHandle || instagramProfile?.username || '@duweon_choo';

  const handleCopyInstagramCaption = () => {
    const hashtags = (initialRecord.spatialAnalysis?.keywords || [])
      .map((k) => (k.startsWith('#') ? k : `#${k}`))
      .join(' ');
    
    const caption = `[산책의 시선]
${copyText}

📍 ${initialRecord.location || '도시의 골목'}
🗓 ${initialRecord.date.replace(/-/g, '.')}
📸 by ${currentHandle} (https://instagram.com/${currentHandle.replace('@', '')})

${hashtags} #산책의시선 #공간기록 #공간디자인 #영감아카이브 #duweon_choo`;

    navigator.clipboard.writeText(caption);
    setHasCopiedCaption(true);
    setTimeout(() => setHasCopiedCaption(false), 2500);
  };

  const handleOpenInstagramStory = () => {
    handleCopyInstagramCaption();
    handleDownload();
    const handleClean = currentHandle.replace('@', '');
    window.open(`https://www.instagram.com/${handleClean}/`, '_blank');
  };

  const handleSave = (openReactionImmediately: boolean = false) => {
    const updated: WalkRecord = {
      ...initialRecord,
      selectedTemplate: template,
      selectedCopyText: copyText,
      templateCustomization: customization,
      updatedAt: new Date().toISOString(),
    };
    onSaveRecord(updated, openReactionImmediately);
    setHasSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>문장 선택으로 돌아가기</span>
        </button>
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1 rounded-full bg-[#F0EFED] text-[#1A1A1A]/70">
          Step 03 • 9:16 Visual Story Studio
        </span>
      </div>

      <div className="text-center mb-10">
        <h2 className="font-serif-kr text-3xl sm:text-4xl font-normal text-[#1A1A1A] mb-3">
          Instagram Story 9:16 비주얼 카드 완성
        </h2>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60 max-w-lg mx-auto leading-relaxed">
          원하는 디자인 템플릿과 무드를 선택하고, 고화질 이미지 다운로드 및 기록 저장을 진행하세요.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 9:16 Live Canvas Preview with Clean Minimalist Phone Frame */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white p-3.5 rounded-[44px] shadow-2xl border border-[#E5E2DD] relative">
            {/* Phone Speaker notch indicator */}
            <div className="w-20 h-3 bg-[#F0EFED] rounded-full mx-auto mb-2.5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#1A1A1A]/20 mr-1.5" />
              <div className="w-6 h-1 rounded-full bg-[#1A1A1A]/10" />
            </div>

            {/* 9:16 Canvas Box */}
            <div className="relative rounded-[32px] overflow-hidden aspect-9/16 bg-black shadow-inner border border-black/5">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#1A1A1A]/40 mt-3.5 text-center font-medium">
            실제 Instagram Story(1080×1920) 해상도 규격으로 렌더링됩니다.
          </p>
        </div>

        {/* Right Column: Controls, Template Selector, Color Theme & Export */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Template Selection */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1A1A1A] flex items-center gap-2 mb-3.5">
              <Layout className="w-3.5 h-3.5 text-[#1A1A1A]" />
              디자인 템플릿 선택 (3가지)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    template === t.id
                      ? 'border-[#1A1A1A] bg-[#F9F8F6] shadow-xs ring-1 ring-[#1A1A1A]'
                      : 'border-[#E5E2DD] hover:border-[#1A1A1A]/40 bg-white'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block mb-1">
                      {t.tag}
                    </span>
                    <span className="text-xs font-bold text-[#1A1A1A] block mb-1">
                      {t.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/60 leading-snug">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Mood */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1A1A1A] flex items-center gap-2 mb-3.5">
              <Palette className="w-3.5 h-3.5 text-[#1A1A1A]" />
              배경 색조 & 무드 톤
            </h3>

            <div className="flex flex-wrap gap-2">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() =>
                    setCustomization((prev) => ({ ...prev, colorScheme: th.id }))
                  }
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-medium ${
                    customization.colorScheme === th.id
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xs'
                      : 'border-[#E5E2DD] bg-[#F9F8F6] text-[#1A1A1A]/80 hover:bg-[#F0EFED]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: th.color }}
                  />
                  <span>{th.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sentence Edit in Story */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs">
            <label className="text-xs font-bold tracking-[0.15em] uppercase text-[#1A1A1A] block mb-2.5">
              스토리에 삽입할 문장 실시간 수정
            </label>
            <textarea
              rows={2}
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] text-xs sm:text-sm font-serif-kr leading-relaxed text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
            />
          </div>

          {/* Connected Instagram Attribution & Watermark Controls */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      연동된 계정: {currentHandle}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      연동됨
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A1A1A]/50">
                    스토리 하단에 <span className="font-semibold text-[#1A1A1A]">ARCHIVED BY {currentHandle.toUpperCase()}</span> 서명이 각인됩니다.
                  </p>
                </div>
              </div>

              {onOpenInstagramModal && (
                <button
                  type="button"
                  onClick={onOpenInstagramModal}
                  className="text-xs text-[#1A1A1A]/70 hover:text-[#1A1A1A] underline font-medium"
                >
                  계정 관리
                </button>
              )}
            </div>
          </div>

          {/* Export & Save Action Hub */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-0.5">
                  Publish & Export
                </span>
                <h4 className="text-base font-bold text-[#1A1A1A]">인스타그램 스토리 공유 & 영감 아카이빙</h4>
              </div>
              <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {/* Download High Res Image */}
              <button
                onClick={handleDownload}
                disabled={isGeneratingImage}
                className="py-3.5 px-3 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333333] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>9:16 이미지 저장</span>
              </button>

              {/* Copy Caption */}
              <button
                onClick={handleCopyInstagramCaption}
                className="py-3.5 px-3 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border border-[#E5E2DD] transition-all"
              >
                {hasCopiedCaption ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>캡션 복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>인스타 캡션 복사</span>
                  </>
                )}
              </button>

              {/* Open Instagram with @duweon_choo */}
              <button
                onClick={handleOpenInstagramStory}
                className="py-3.5 px-3 rounded-full bg-[#F9F8F6] hover:bg-[#F0EFED] text-[#1A1A1A] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border border-[#E5E2DD] transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>인스타로 이동</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[#E5E2DD] flex flex-col sm:flex-row gap-3">
              {/* Save To Archive */}
              <button
                onClick={() => handleSave(false)}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>영감 아카이브에 저장</span>
              </button>

              {/* Save and Immediately Open Reaction Form */}
              <button
                onClick={() => handleSave(true)}
                className="py-3.5 px-5 rounded-full bg-[#F9F8F6] hover:bg-[#F0EFED] text-[#1A1A1A] font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all border border-[#E5E2DD]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>게시 후 반응 기록하기</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

