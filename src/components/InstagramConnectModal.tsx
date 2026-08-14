import React, { useState } from 'react';
import { 
  Instagram, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  MessageSquare,
  Share2,
  Camera,
  Upload
} from 'lucide-react';
import { InstagramProfile } from '../types';

interface InstagramConnectModalProps {
  profile: InstagramProfile;
  onUpdateProfile: (profile: InstagramProfile) => void;
  onClose: () => void;
  onShowToast: (message: string) => void;
  onSyncLatestMonthStories?: () => void;
  onOpenPhotoManager?: () => void;
  onOpenPostImporter?: () => void;
}

export const InstagramConnectModal: React.FC<InstagramConnectModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onShowToast,
  onSyncLatestMonthStories,
  onOpenPhotoManager,
  onOpenPostImporter,
}) => {
  const [handleInput, setHandleInput] = useState(profile.username.replace('@', ''));
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://www.instagram.com/${profile.username.replace('@', '')}/`);
    setCopiedLink(true);
    onShowToast('인스타그램 프로필 링크가 복사되었습니다.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSyncTest = () => {
    setIsSyncing(true);
    if (onSyncLatestMonthStories) {
      onSyncLatestMonthStories();
    }
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast(`@${handleInput || 'duweon_choo'} 최근 1달 스토리(7.15~8.13) 8건이 최신 상태로 동기화되었습니다.`);
    }, 700);
  };

  const handleSaveHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@+/, '');
    if (!cleanHandle) return;

    onUpdateProfile({
      ...profile,
      username: `@${cleanHandle}`,
      profileUrl: `https://www.instagram.com/${cleanHandle}/`,
      isConnected: true,
      connectedAt: new Date().toISOString(),
    });
    onShowToast(`인스타그램 계정이 @${cleanHandle} 로 설정되었습니다.`);
  };

  const handleToggleConnection = () => {
    const nextState = !profile.isConnected;
    onUpdateProfile({
      ...profile,
      isConnected: nextState,
      connectedAt: nextState ? new Date().toISOString() : profile.connectedAt,
    });
    onShowToast(nextState ? `@${profile.username} 계정이 연동되었습니다.` : '인스타그램 연동이 해제되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#F9F8F6] rounded-2xl border border-[#E5E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2DD] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-0.5">
                Instagram Integration
              </span>
              <h3 className="font-serif-kr text-xl font-normal text-[#1A1A1A]">
                인스타그램 계정 연동
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Account Status Card */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E2DD] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-serif-kr text-lg font-bold">
                    추
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#1A1A1A]">
                      {profile.displayName}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      연동 활성화
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#1A1A1A]/60 mt-0.5">
                    {profile.username.startsWith('@') ? profile.username : `@${profile.username}`}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/50 mt-1">
                    {profile.bio}
                  </p>
                </div>
              </div>

              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>프로필 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-3 border-t border-[#F0EFED] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/70">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">최근 1달 스토리(2026.07.15 ~ 08.13) 8건 연동 완료</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyProfileLink}
                  className="px-3 py-1 rounded-full bg-[#F9F8F6] hover:bg-[#F0EFED] border border-[#E5E2DD] text-xs text-[#1A1A1A] flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#1A1A1A]/60" />}
                  <span>링크 복사</span>
                </button>

                <button
                  onClick={handleSyncTest}
                  disabled={isSyncing}
                  className="px-3 py-1 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>스토리 재동기화</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real Photo Upload Notice & Trigger */}
          {onOpenPhotoManager && (
            <div className="p-4 rounded-xl bg-[#1A1A1A] text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">
                  Real Story Photos
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  직접 사진 등록 지원
                </span>
              </div>
              <h5 className="font-serif-kr text-sm font-normal text-white">
                내 기기(스마트폰/PC)의 실제 인스타 스토리 사진으로 교체하기
              </h5>
              <p className="text-[11px] text-white/70 leading-relaxed font-serif-kr">
                인스타그램에 실제로 게시했던 원본 사진 파일을 각 공간 스토리 카드에 직접 등록하거나 변경할 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPhotoManager();
                }}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F0EFED] text-[#1A1A1A] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>스토리 카드 사진 일괄 등록 / 교체 열기</span>
              </button>
            </div>
          )}

          {/* Real Post Fetch Trigger */}
          {onOpenPostImporter && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 border border-pink-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-700">
                  Instagram Link Importer
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-pink-700 border border-pink-200">
                  URL로 가져오기
                </span>
              </div>
              <h5 className="font-serif-kr text-sm font-normal text-[#1A1A1A]">
                인스타그램 실제 게시물 URL로 가져와서 AI 공간 분석하기
              </h5>
              <p className="text-[11px] text-[#1A1A1A]/70 leading-relaxed font-serif-kr">
                인스타그램 앱이나 웹의 게시물 링크(URL)를 입력하면 본문 캡션과 사진을 가져와 9:16 공간 스토리 카드로 즉시 생성합니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPostImporter();
                }}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99]"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-300" />
                <span>인스타 게시물 URL 가져오기 열기</span>
              </button>
            </div>
          )}

          {/* Active Features List */}
          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/60">
              연동 활성화 기능
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>9:16 스토리 자동 서명</span>
                </div>
                <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-serif-kr">
                  생성되는 인스타그램 스토리 하단에 <span className="font-semibold text-[#1A1A1A]">{profile.username}</span> 인장이 자동으로 렌더링됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                  <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>맞춤형 캡션 & 태그</span>
                </div>
                <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-serif-kr">
                  스토리 복사 시 <span className="font-semibold text-[#1A1A1A]">{profile.username}</span> 및 공간 아카이브 해시태그가 자동 구성됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>청중 반응 & DM 아카이브</span>
                </div>
                <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-serif-kr">
                  스토리를 본 사람들의 피드백, 공간 문의, 디자인 대화를 기록하여 공간 언어로 축적합니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                  <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span>공간 디자이너 페르소나</span>
                </div>
                <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-serif-kr">
                  축적된 산책 기록과 반응 데이터를 분석하여 나만의 시선 리포트를 발행합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Account Edit Form */}
          <form onSubmit={handleSaveHandle} className="bg-white p-4 rounded-xl border border-[#E5E2DD] space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block">
              인스타그램 계정 아이디 변경 / 재연동
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1A1A1A]/40 font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="duweon_choo"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] text-xs font-mono text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold tracking-wider transition-colors shrink-0"
              >
                계정 변경
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E2DD] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleConnection}
            className="text-xs font-semibold text-[#1A1A1A]/50 hover:text-red-600 transition-colors"
          >
            {profile.isConnected ? '연동 일시 해제' : '다시 연동하기'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold tracking-wider hover:bg-[#333333] transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
