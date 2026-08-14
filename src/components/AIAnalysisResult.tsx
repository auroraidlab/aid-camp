import React, { useState } from 'react';
import { SpatialAnalysis } from '../types';
import { Sparkles, Check, Edit3, ArrowRight, ArrowLeft, Layers, Compass, Feather } from 'lucide-react';

interface AIAnalysisResultProps {
  analysis: SpatialAnalysis;
  image: string;
  location: string;
  date: string;
  userNote: string;
  onProceedToStory: (selectedType: 'emotional' | 'expert' | 'storyShort', selectedText: string) => void;
  onBack: () => void;
}

export const AIAnalysisResult: React.FC<AIAnalysisResultProps> = ({
  analysis,
  image,
  location,
  date,
  userNote,
  onProceedToStory,
  onBack,
}) => {
  const [selectedType, setSelectedType] = useState<'emotional' | 'expert' | 'storyShort'>('expert');
  const [customTexts, setCustomTexts] = useState({
    emotional: analysis.copies.emotional,
    expert: analysis.copies.expert,
    storyShort: analysis.copies.storyShort,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleTextChange = (type: 'emotional' | 'expert' | 'storyShort', val: string) => {
    setCustomTexts((prev) => ({ ...prev, [type]: val }));
  };

  const copyOptions = [
    {
      type: 'emotional' as const,
      label: '① 감성적인 문장',
      sublabel: '순간의 온도와 서정적인 여백을 담은 문장',
      icon: Feather,
      text: customTexts.emotional,
    },
    {
      type: 'expert' as const,
      label: '② 공간전문가의 시선',
      sublabel: '물성, 빛, 비례와 건축적 디테일을 짚어낸 해석',
      icon: Compass,
      text: customTexts.expert,
    },
    {
      type: 'storyShort' as const,
      label: '③ Story용 짧은 문장',
      sublabel: '인스타그램 스토리에 직관적으로 읽히는 1줄 카피',
      icon: Sparkles,
      text: customTexts.storyShort,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>다시 입력하기</span>
        </button>
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1 rounded-full bg-[#F0EFED] text-[#1A1A1A]/70">
          Step 02 • Spatial Analysis & Copy
        </span>
      </div>

      <div className="text-center mb-10">
        <h2 className="font-serif-kr text-3xl sm:text-4xl font-normal text-[#1A1A1A] mb-3">
          AI 공간 분석 및 문장 제안
        </h2>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60 max-w-lg mx-auto leading-relaxed">
          산책자의 관찰 메모와 사진 속 공간적 요소를 해석했습니다. 스토리에 담을 문장을 선택해주세요.
        </p>
      </div>

      {/* Grid: Left photo preview + Spatial Keywords / Right: Detailed Analysis & Copies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8">
        
        {/* Left Column: Photo & Spatial Keywords */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E2DD] shadow-xs">
            <div className="relative rounded-xl overflow-hidden aspect-4/5 bg-[#1A1A1A] mb-4">
              <img
                src={image}
                alt="Walk Shot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">{date.replace(/-/g, '.')}</span>
                <span className="text-xs font-bold tracking-wide mt-0.5">{location}</span>
                <p className="text-xs text-white/90 italic line-clamp-2 mt-1 font-serif-kr">"{userNote}"</p>
              </div>
            </div>

            {/* Extracted Spatial Keywords */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-2.5">
                오늘의 핵심 공간 키워드
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#F0EFED] text-[#1A1A1A] border border-[#E5E2DD]"
                  >
                    {kw.startsWith('#') ? kw : `#${kw}`}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Spatial Feature Insights Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E2DD] shadow-xs space-y-4">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1A1A1A] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" />
              AI가 발견한 공간적 특징
            </h3>

            <div className="space-y-3.5 text-xs text-[#1A1A1A]/80 leading-relaxed divide-y divide-[#F0EFED]">
              <div className="pt-2.5 first:pt-0">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/50 block mb-0.5">분위기 & 무드</span>
                <p className="text-[#1A1A1A]">{analysis.mood}</p>
              </div>
              <div className="pt-2.5">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/50 block mb-0.5">빛과 그림자의 뉘앙스</span>
                <p className="text-[#1A1A1A]">{analysis.lightAndShadow}</p>
              </div>
              <div className="pt-2.5">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/50 block mb-0.5">소재와 색채</span>
                <p className="text-[#1A1A1A]">{analysis.materialsAndColors}</p>
              </div>
              <div className="pt-2.5">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/50 block mb-0.5">건축 및 공간적 관점</span>
                <p className="text-[#1A1A1A]">{analysis.architecturalFeature}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Copywriting Options */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E2DD] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#1A1A1A]/40 block mb-1">
                  Copy Selection
                </span>
                <h3 className="text-lg font-normal font-serif-kr text-[#1A1A1A]">
                  AI 생성 문장 선택
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 font-medium transition-all ${
                  isEditing
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#F9F8F6] text-[#1A1A1A]/80 border-[#E5E2DD] hover:bg-[#F0EFED]'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? '수정 완료' : '직접 수정하기'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {copyOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;

                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`relative cursor-pointer rounded-xl p-5 border transition-all ${
                      isSelected
                        ? 'border-[#1A1A1A] bg-[#F9F8F6] shadow-xs ring-1 ring-[#1A1A1A]'
                        : 'border-[#E5E2DD] hover:border-[#1A1A1A]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-[#F0EFED] text-[#1A1A1A]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold tracking-wide text-[#1A1A1A]">
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-[#1A1A1A]/50 block">
                            {opt.sublabel}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white'
                            : 'border border-[#E5E2DD]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={opt.text}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleTextChange(opt.type, e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#E5E2DD] bg-white text-xs sm:text-sm font-serif-kr leading-relaxed text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    ) : (
                      <blockquote className="font-serif-kr text-sm sm:text-base text-[#1A1A1A] leading-relaxed pl-3.5 border-l border-[#1A1A1A]/40 my-2">
                        "{opt.text}"
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Proceed Action */}
            <div className="mt-8 pt-6 border-t border-[#E5E2DD]">
              <button
                onClick={() => onProceedToStory(selectedType, customTexts[selectedType])}
                className="w-full py-4 px-6 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>선택한 문장으로 9:16 Story 비주얼 만들기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

