import React, { useMemo } from 'react';
import { WalkRecord, ReactionType, InstagramProfile } from '../types';
import { 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  Award,
  Instagram,
  ExternalLink
} from 'lucide-react';

interface SpatialLanguageReportProps {
  records: WalkRecord[];
  onSelectKeyword: (keyword: string) => void;
  onStartNewWalk: () => void;
  instagramProfile?: InstagramProfile;
}

export const SpatialLanguageReport: React.FC<SpatialLanguageReportProps> = ({
  records,
  onSelectKeyword,
  onStartNewWalk,
  instagramProfile,
}) => {
  // Aggregate keyword frequencies
  const { keywordStats, totalKeywordsCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    records.forEach((r) => {
      (r.spatialAnalysis?.keywords || []).forEach((rawKw) => {
        const clean = rawKw.replace(/^#/, '').trim();
        if (clean) {
          counts[clean] = (counts[clean] || 0) + 1;
          total++;
        }
      });
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { keywordStats: sorted, totalKeywordsCount: total };
  }, [records]);

  // Aggregate audience reactions by type and related themes
  const { reactionTypeStats, totalReactions, topResonantThemes } = useMemo(() => {
    const typeCounts: Record<ReactionType, number> = {
      '공감': 0,
      '질문': 0,
      '칭찬': 0,
      '디자인 의견': 0,
      '공간 문의': 0,
      '협업 제안': 0,
      '기타': 0,
    };
    let total = 0;

    // Calculate which keywords have the most reactions attached to them
    const keywordReactionMap: Record<string, number> = {};

    records.forEach((r) => {
      const rxList = r.reactions || [];
      rxList.forEach((rx) => {
        if (typeCounts[rx.type] !== undefined) {
          typeCounts[rx.type]++;
          total++;
        }
      });

      if (rxList.length > 0) {
        (r.spatialAnalysis?.keywords || []).forEach((rawKw) => {
          const clean = rawKw.replace(/^#/, '').trim();
          if (clean) {
            keywordReactionMap[clean] = (keywordReactionMap[clean] || 0) + rxList.length;
          }
        });
      }
    });

    const topKeywordsByReaction = Object.entries(keywordReactionMap)
      .map(([name, reactions]) => ({ name, reactions }))
      .sort((a, b) => b.reactions - a.reactions);

    return {
      reactionTypeStats: typeCounts,
      totalReactions: total,
      topResonantThemes: topKeywordsByReaction,
    };
  }, [records]);

  // Designer Persona Interpretation based on top keywords
  const designerPersona = useMemo(() => {
    const top3 = keywordStats.slice(0, 3).map((k) => k.name);
    if (top3.includes('빛') || top3.includes('그림자') || top3.includes('사선광')) {
      return {
        title: '빛과 음영의 건축적 서정가',
        desc: '인공적인 조명보다 자연광의 각도와 그늘이 빚어내는 공간의 뉘앙스를 탁월하게 포착하며, 시간의 흐름을 공간의 온도로 치환하는 감각을 지녔습니다.',
        focus: '자연광 • 슬릿 그림자 • 시간의 궤적',
      };
    } else if (top3.includes('콘크리트') || top3.includes('벽돌') || top3.includes('소재') || top3.includes('물성')) {
      return {
        title: '물성과 텍스처의 탐미주의자',
        desc: '재료의 원초적인 표면 질감, 조적 패턴, 오래된 물성이 건네는 침묵의 대화에 깊이 매료되는 감각적 디자이너입니다.',
        focus: '물성의 원형 • 텍스처 대비 • 에이징의 미학',
      };
    } else {
      return {
        title: '도심 속 여백과 비움의 큐레이터',
        desc: '복잡한 도시의 틈새에서 비움과 절제의 균형을 찾아내며, 일상의 작은 순간을 고유한 디자인 언어로 정제해내는 시선을 지니고 있습니다.',
        focus: '공간의 여백 • 비례감 • 일상의 시선',
      };
    }
  }, [keywordStats]);

  const maxCount = keywordStats[0]?.count || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold px-3 py-1 rounded-full bg-[#F0EFED] text-[#1A1A1A]/70">
            Spatial Language & Insight Report
          </span>
          <a
            href={instagramProfile?.profileUrl || 'https://www.instagram.com/duweon_choo/'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] text-white text-[10px] font-mono font-bold hover:bg-[#333333] transition-colors"
          >
            <Instagram className="w-2.5 h-2.5" />
            <span>{instagramProfile?.username || '@duweon_choo'}</span>
            <ExternalLink className="w-2.5 h-2.5 text-white/60" />
          </a>
        </div>
        <h2 className="font-serif-kr text-3xl sm:text-4xl font-normal text-[#1A1A1A] mb-3">
          {instagramProfile?.displayName ? `${instagramProfile.displayName}의 공간 언어` : '나의 공간 언어 & 관찰 리포트'}
        </h2>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60 leading-relaxed">
          산책하며 남긴 {records.length}개의 기록과 인스타그램({instagramProfile?.username || '@duweon_choo'})을 통해 축적된 반응 데이터를 종합하여, 고유한 공간적 취향과 시선의 패턴을 분석했습니다.
        </p>
      </div>

      {/* Main Persona Card */}
      <div className="bg-[#1A1A1A] text-white rounded-2xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-white/80" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                AI Spatial Persona Analysis
              </span>
            </div>
            <h3 className="font-serif-kr text-2xl sm:text-3xl font-normal text-white">
              "{designerPersona.title}"
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl font-serif-kr">
              {designerPersona.desc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-white/50 text-[11px] font-medium">핵심 관찰 포커스:</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-medium border border-white/15 text-xs">
                {designerPersona.focus}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 block">
              산책 아카이브 통계 요약
            </span>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-2xl font-bold text-white block">{records.length}</span>
                <span className="text-[10px] text-white/60">누적 산책 기록</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-2xl font-bold text-white block">{totalReactions}</span>
                <span className="text-[10px] text-white/60">축적된 청중 반응</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-2xl font-bold text-white block">{keywordStats.length}</span>
                <span className="text-[10px] text-white/60">고유 공간 키워드</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-2xl font-bold text-white block">9:16</span>
                <span className="text-[10px] text-white/60">스토리 비주얼화</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Keyword Frequency Ranking & Audience Resonance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Top Spatial Keywords Frequency */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1A1A1A]" />
                가장 자주 관찰한 공간 키워드 랭킹
              </h4>
              <p className="text-xs text-[#1A1A1A]/50">
                당신의 시선이 반복적으로 머무른 공간적 요소들입니다.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1A1A1A] bg-[#F0EFED] px-2.5 py-1 rounded-full border border-[#E5E2DD]">
              총 {totalKeywordsCount}회 태깅
            </span>
          </div>

          <div className="space-y-3.5">
            {keywordStats.slice(0, 7).map((item, index) => {
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-[#1A1A1A]/40 text-[11px]">
                        0{index + 1}
                      </span>
                      <button
                        onClick={() => onSelectKeyword(item.name)}
                        className="font-bold text-[#1A1A1A] hover:opacity-60 transition-opacity"
                      >
                        #{item.name}
                      </button>
                    </div>
                    <span className="text-[#1A1A1A]/60 font-semibold text-[11px]">
                      {item.count}회 관찰
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#F0EFED] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1A1A1A] transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E5E2DD] text-xs text-[#1A1A1A]/70 leading-relaxed font-serif-kr">
            <span className="font-bold text-[#1A1A1A] block mb-1 font-sans text-[11px] uppercase tracking-wider">💡 시선의 통찰</span>
            당신은 최근 기록에서{' '}
            <span className="font-bold text-[#1A1A1A]">
              {keywordStats.slice(0, 3).map((k) => `#${k.name} (${k.count}회)`).join(', ')}
            </span>
            를 집중적으로 관찰했습니다. 이 테마들을 엮어 시리즈성 인스타그램 스토리나 아티클로 발행하면 강력한 브랜딩이 됩니다.
          </div>
        </div>

        {/* Right: Audience Resonance Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#E5E2DD] shadow-xs space-y-5">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1A1A1A]" />
              사람들의 반응이 가장 뜨거웠던 주제
            </h4>
            <p className="text-xs text-[#1A1A1A]/50">
              독자 및 동료 디자이너들이 영감을 얻고 소통을 건넨 주제입니다.
            </p>
          </div>

          {/* Top Resonant Themes */}
          <div className="space-y-2.5">
            {topResonantThemes.slice(0, 4).map((theme, idx) => (
              <div
                key={theme.name}
                className="p-3.5 rounded-xl bg-[#F9F8F6] border border-[#E5E2DD] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">
                      #{theme.name}
                    </span>
                    <span className="text-[10px] text-[#1A1A1A]/50">
                      공감 및 DM 피드백 집중
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#1A1A1A] bg-white border border-[#E5E2DD] px-2.5 py-1 rounded-full">
                  {theme.reactions}건 반응
                </span>
              </div>
            ))}
          </div>

          {/* Reaction Type Distribution */}
          <div className="pt-2 border-t border-[#F0EFED]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block mb-2">
              반응 유형별 분포
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(reactionTypeStats).map(([type, count]) => {
                if (count === 0) return null;
                return (
                  <span
                    key={type}
                    className="text-[11px] px-3 py-1 rounded-full bg-[#F0EFED] text-[#1A1A1A]/80 border border-[#E5E2DD] flex items-center gap-1.5"
                  >
                    <span>{type}</span>
                    <span className="font-bold text-[#1A1A1A] bg-white px-1.5 py-0.2 rounded-full border border-[#E5E2DD]">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={onStartNewWalk}
              className="w-full py-3.5 px-4 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>오늘의 산책에서 새로운 영감 기록하기</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

