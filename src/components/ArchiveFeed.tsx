import React, { useState, useMemo } from 'react';
import { ReactionType, WalkRecord, InstagramProfile } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  ArrowUpRight,
  Instagram,
  Calendar,
  RefreshCw,
  Upload,
  Camera
} from 'lucide-react';

interface ArchiveFeedProps {
  records: WalkRecord[];
  onSelectRecord: (record: WalkRecord) => void;
  onOpenReactionModal: (record: WalkRecord) => void;
  onStartNewWalk: () => void;
  instagramProfile?: InstagramProfile;
  onOpenInstagramModal?: () => void;
  onSyncLatestMonthStories?: () => void;
  onOpenPhotoManager?: () => void;
  onOpenPostImporter?: () => void;
}

const COMMON_KEYWORD_FILTERS = [
  '전체',
  '빛',
  '그림자',
  '골목',
  '벽돌',
  '한옥',
  '콘크리트',
  '스테인리스',
  '회랑',
  '보이드',
  '을지로',
  '서촌',
  '성수',
];

const REACTION_FILTERS: { type: ReactionType | 'all'; label: string }[] = [
  { type: 'all', label: '모든 기록' },
  { type: '공감', label: '❤️ 공감' },
  { type: '질문', label: '❓ 질문' },
  { type: '칭찬', label: '👍 칭찬' },
  { type: '디자인 의견', label: '👁️ 디자인 의견' },
  { type: '공간 문의', label: '📍 공간 문의' },
  { type: '협업 제안', label: '💼 협업 제안' },
];

export const ArchiveFeed: React.FC<ArchiveFeedProps> = ({
  records,
  onSelectRecord,
  onOpenReactionModal,
  onStartNewWalk,
  instagramProfile,
  onOpenInstagramModal,
  onSyncLatestMonthStories,
  onOpenPhotoManager,
  onOpenPostImporter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('전체');
  const [selectedReactionType, setSelectedReactionType] = useState<ReactionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        // Keyword filter
        if (selectedKeyword !== '전체') {
          const matchKeyword = (record.spatialAnalysis?.keywords || []).some((kw) =>
            kw.toLowerCase().includes(selectedKeyword.toLowerCase())
          );
          if (!matchKeyword) return false;
        }

        // Reaction type filter
        if (selectedReactionType !== 'all') {
          const hasReactionType = (record.reactions || []).some(
            (rx) => rx.type === selectedReactionType
          );
          if (!hasReactionType) return false;
        }

        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchLocation = record.location?.toLowerCase().includes(q);
          const matchDate = record.date?.toLowerCase().includes(q);
          const matchNote = record.note?.toLowerCase().includes(q);
          const matchCopy = record.selectedCopyText?.toLowerCase().includes(q);
          const matchKeywords = (record.spatialAnalysis?.keywords || []).some((kw) =>
            kw.toLowerCase().includes(q)
          );
          const matchReactions = (record.reactions || []).some((rx) =>
            rx.content.toLowerCase().includes(q) || (rx.author && rx.author.toLowerCase().includes(q))
          );

          if (
            !matchLocation &&
            !matchDate &&
            !matchNote &&
            !matchCopy &&
            !matchKeywords &&
            !matchReactions
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
      });
  }, [records, searchQuery, selectedKeyword, selectedReactionType, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50">
              Inspiration Archive & Spatial Stories
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              최근 1달 (2026.07.15 ~ 08.13)
            </span>
          </div>
          <h2 className="font-serif-kr text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            공간 영감 아카이브
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/60 mt-1 max-w-lg leading-relaxed">
            <strong className="text-[#1A1A1A] font-semibold">{instagramProfile?.username || '@duweon_choo'}</strong> 인스타그램에 기록된 최근 1달간의 공간 스토리, 9:16 비주얼 카드와 청중 반응을 모아봅니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenPostImporter && (
            <button
              onClick={onOpenPostImporter}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-all active:scale-[0.98]"
              title="인스타그램 실제 게시물 링크로 가져오기"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>인스타 게시물 가져오기</span>
            </button>
          )}

          {onOpenPhotoManager && (
            <button
              onClick={onOpenPhotoManager}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F0EFED] text-[#1A1A1A] font-semibold text-xs flex items-center gap-1.5 border border-[#E5E2DD] transition-all shadow-xs"
              title="실제 인스타 사진으로 교체하기"
            >
              <Upload className="w-3.5 h-3.5 text-[#1A1A1A]" />
              <span>실제 사진 교체</span>
            </button>
          )}

          <button
            onClick={onStartNewWalk}
            className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-xs tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새로운 산책 기록</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E2DD] shadow-xs mb-8 space-y-4">
        
        {/* Top Search Input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소, 날짜, 키워드(#빛, #그림자), 문장, 반응 내용 검색..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] text-xs sm:text-sm text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#1A1A1A]/50 hover:text-[#1A1A1A] bg-[#E5E2DD] px-2 py-0.5 rounded-full font-medium"
              >
                지우기
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/50">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
            >
              <option value="latest">최신 산책순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        {/* Spatial Keyword Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#1A1A1A]" />
            키워드:
          </span>
          {COMMON_KEYWORD_FILTERS.map((kw) => (
            <button
              key={kw}
              onClick={() => setSelectedKeyword(kw)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all border ${
                selectedKeyword === kw
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-[#F9F8F6] text-[#1A1A1A]/70 border-[#E5E2DD] hover:bg-[#F0EFED]'
              }`}
            >
              {kw === '전체' ? '전체' : `#${kw}`}
            </button>
          ))}
        </div>

        {/* Reaction Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F0EFED] scrollbar-none">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 shrink-0 mr-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#1A1A1A]" />
            반응 유형:
          </span>
          {REACTION_FILTERS.map((rf) => (
            <button
              key={rf.type}
              onClick={() => setSelectedReactionType(rf.type)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all border ${
                selectedReactionType === rf.type
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-[#F9F8F6] text-[#1A1A1A]/70 border-[#E5E2DD] hover:bg-[#F0EFED]'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of 9:16 Instagram Story & Walk Records */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E5E2DD] p-8">
          <Sparkles className="w-8 h-8 text-[#1A1A1A] mx-auto mb-3 opacity-30" />
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">
            검색 결과와 일치하는 산책 기록이 없습니다
          </h3>
          <p className="text-xs text-[#1A1A1A]/50 max-w-sm mx-auto mb-4">
            다른 키워드로 검색하거나 새로운 산책 사진과 메모를 등록해보세요.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedKeyword('전체');
              setSelectedReactionType('all');
            }}
            className="text-xs font-bold px-4 py-2 bg-[#1A1A1A] text-white rounded-full hover:bg-[#333333]"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => {
            const reactionCount = record.reactions?.length || 0;
            return (
              <div
                key={record.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E5E2DD] hover:border-[#1A1A1A]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* 9:16 Visual Card Top Header Preview */}
                <div 
                  onClick={() => onSelectRecord(record)}
                  className="cursor-pointer relative aspect-4/5 overflow-hidden bg-[#1A1A1A]"
                >
                  <img
                    src={record.image}
                    alt={record.location}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Scrim overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-4 text-white">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90">
                          {record.date.replace(/-/g, '.')}
                        </span>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 border border-white/10 hidden sm:inline-flex items-center gap-1">
                          <Instagram className="w-2.5 h-2.5" />
                          {record.templateCustomization?.authorHandle || '@duweon_choo'}
                        </span>
                      </div>

                      {reactionCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1A1A1A] flex items-center gap-1 shadow-xs shrink-0">
                          <MessageSquare className="w-2.5 h-2.5 text-[#1A1A1A]" />
                          <span>{reactionCount}</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Floating Quote */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium mb-1">
                        <MapPin className="w-3 h-3 text-white" />
                        <span className="truncate">{record.location}</span>
                      </div>
                      <p className="font-serif-kr text-xs sm:text-sm font-normal text-white leading-snug line-clamp-2">
                        "{record.selectedCopyText}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body: Keywords, User Memo, Quick Action */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {(record.spatialAnalysis?.keywords || []).slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKeyword(kw.replace('#', ''));
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EFED] text-[#1A1A1A]/80 border border-[#E5E2DD] transition-colors cursor-pointer hover:bg-[#E5E2DD]"
                        >
                          {kw.startsWith('#') ? kw : `#${kw}`}
                        </span>
                      ))}
                    </div>

                    {/* Original Walk Memo */}
                    <p className="text-xs text-[#1A1A1A]/70 line-clamp-2 italic leading-relaxed font-serif-kr">
                      "{record.note}"
                    </p>
                  </div>

                  {/* Reaction Pill Preview & Action Toolbar */}
                  <div className="pt-3 border-t border-[#F0EFED] flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenReactionModal(record)}
                      className="flex items-center gap-1.5 text-[#1A1A1A] font-bold py-1 px-2.5 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>
                        {reactionCount > 0 ? `반응 ${reactionCount}건` : '+ 반응 기록'}
                      </span>
                    </button>

                    <button
                      onClick={() => onSelectRecord(record)}
                      className="flex items-center gap-1 font-bold text-[#1A1A1A] hover:opacity-70 py-1 px-2 transition-opacity"
                    >
                      <span>Story 카드</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

