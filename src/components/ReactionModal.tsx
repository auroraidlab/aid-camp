import React, { useState } from 'react';
import { ReactionItem, ReactionType, WalkRecord } from '../types';
import { 
  X, 
  MessageSquare, 
  Send, 
  Trash2, 
  User, 
  Heart, 
  HelpCircle, 
  ThumbsUp, 
  Eye, 
  MapPin, 
  Briefcase, 
  MoreHorizontal 
} from 'lucide-react';

interface ReactionModalProps {
  record: WalkRecord;
  onClose: () => void;
  onAddReaction: (recordId: string, reaction: Omit<ReactionItem, 'id' | 'createdAt'>) => void;
  onDeleteReaction: (recordId: string, reactionId: string) => void;
}

const REACTION_TYPE_CONFIG: Record<
  ReactionType,
  { label: string; icon: any }
> = {
  '공감': { label: '공감', icon: Heart },
  '질문': { label: '질문', icon: HelpCircle },
  '칭찬': { label: '칭찬', icon: ThumbsUp },
  '디자인 의견': { label: '디자인 의견', icon: Eye },
  '공간 문의': { label: '공간 문의', icon: MapPin },
  '협업 제안': { label: '협업 제안', icon: Briefcase },
  '기타': { label: '기타', icon: MoreHorizontal },
};

export const ReactionModal: React.FC<ReactionModalProps> = ({
  record,
  onClose,
  onAddReaction,
  onDeleteReaction,
}) => {
  const [selectedType, setSelectedType] = useState<ReactionType>('공감');
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    onAddReaction(record.id, {
      type: selectedType,
      content: content.trim(),
      author: author.trim() || '익명의 반응자',
    });

    setContent('');
    setAuthor('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#F9F8F6] rounded-2xl border border-[#E5E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2DD] flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-1">
              Audience Reaction Tracker
            </span>
            <h3 className="font-serif-kr text-xl font-normal text-[#1A1A1A]">
              사람들의 반응 기록하기
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
              인스타그램 스토리에 게시한 후 수신한 DM, 댓글, 질문, 협업 제안을 기록해 공간 언어로 축적합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] flex items-center justify-center text-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Linked Record Summary Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E5E2DD]">
            <img
              src={record.image}
              alt="Walk Record"
              className="w-14 h-14 rounded-lg object-cover shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A]/50 mb-0.5">
                <span>{record.date.replace(/-/g, '.')}</span>
                <span>•</span>
                <span className="font-semibold text-[#1A1A1A]">{record.location}</span>
              </div>
              <p className="font-serif-kr text-xs font-normal text-[#1A1A1A] truncate">
                "{record.selectedCopyText}"
              </p>
              <div className="flex gap-1 mt-1">
                {(record.spatialAnalysis?.keywords || []).slice(0, 3).map((kw, i) => (
                  <span key={i} className="text-[10px] text-[#1A1A1A]/50">
                    {kw.startsWith('#') ? kw : `#${kw}`}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* New Reaction Form */}
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-[#E5E2DD] space-y-4 shadow-xs">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-[#1A1A1A]" />
              새로운 반응 추가
            </h4>

            {/* Reaction Type Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block mb-2">
                반응 유형 선택 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(REACTION_TYPE_CONFIG) as ReactionType[]).map((type) => {
                  const cfg = REACTION_TYPE_CONFIG[type];
                  const Icon = cfg.icon;
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                          : 'bg-[#F9F8F6] text-[#1A1A1A]/70 border-[#E5E2DD] hover:bg-[#F0EFED]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Content Textarea */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block mb-1.5">
                반응 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="예: 사진보다 빛에 대한 이야기가 인상적이라고 했다. / 프로젝트 공간 컨설팅 문의 DM 수신"
                className="w-full p-3.5 rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] text-xs leading-relaxed text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            {/* Optional Author / Source */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="반응자 ID 또는 출처 (선택, 예: @design_archive)"
                  className="w-full px-3.5 py-2.5 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] text-xs text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                  !content.trim()
                    ? 'bg-[#F0EFED] text-[#1A1A1A]/30 cursor-not-allowed border border-[#E5E2DD]'
                    : 'bg-[#1A1A1A] hover:bg-[#333333] text-white shadow-xs active:scale-[0.98]'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>반응 저장</span>
              </button>
            </div>
          </form>

          {/* Reaction History List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                누적된 반응 목록 ({record.reactions?.length || 0})
              </h4>
            </div>

            {(!record.reactions || record.reactions.length === 0) ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#E5E2DD] text-[#1A1A1A]/40">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30 text-[#1A1A1A]" />
                <p className="text-xs font-semibold text-[#1A1A1A]/70">아직 등록된 반응이 없습니다.</p>
                <p className="text-[11px] text-[#1A1A1A]/40 mt-0.5">
                  스토리를 본 사람들의 첫 반응을 위에 기록해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {record.reactions.map((rx) => {
                  const cfg = REACTION_TYPE_CONFIG[rx.type] || REACTION_TYPE_CONFIG['기타'];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={rx.id}
                      className="p-4 rounded-xl bg-white border border-[#E5E2DD] shadow-xs flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F0EFED] text-[#1A1A1A] border border-[#E5E2DD] shrink-0 mt-0.5">
                          <Icon className="w-3 h-3" />
                          <span>{rx.type}</span>
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#1A1A1A] leading-relaxed break-words font-medium">
                            "{rx.content}"
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#1A1A1A]/40">
                            {rx.author && (
                              <span className="font-semibold text-[#1A1A1A]/70 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {rx.author}
                              </span>
                            )}
                            <span>{rx.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteReaction(record.id, rx.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#1A1A1A]/40 hover:text-red-600 p-1 rounded-lg transition-all"
                        title="반응 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E2DD] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold tracking-wider hover:bg-[#333333] transition-colors"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};

