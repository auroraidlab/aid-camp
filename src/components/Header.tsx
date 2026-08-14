import React from 'react';
import { ViewTab, InstagramProfile } from '../types';
import { BookOpen, BarChart3, PlusCircle, Instagram, Github } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  recordCount: number;
  instagramProfile?: InstagramProfile;
  onOpenInstagramModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onTabChange, 
  recordCount,
  instagramProfile,
  onOpenInstagramModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2DD] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onTabChange('archive')}
          className="cursor-pointer group flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-xs group-hover:scale-105 transition-transform">
            시선
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif-kr text-lg font-bold tracking-tight text-[#1A1A1A]">
                산책의 시선
              </h1>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F0EFED] text-[#1A1A1A]/70">
                Spatial Archive
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A]/50 hidden sm:block font-normal">
              공간 디자이너의 일상 영감 & Instagram Story 아카이브
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/shyghoststella/aid-camp"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] hover:bg-[#F0EFED] hover:border-[#1A1A1A] text-xs font-medium text-[#1A1A1A]/80 hover:text-[#1A1A1A] transition-all shadow-xs"
            title="GitHub 저장소 바로가기 (shyghoststella/aid-camp)"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-semibold">GitHub</span>
          </a>

          {/* Instagram Account Connection Chip */}
          <button
            onClick={onOpenInstagramModal}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-[#E5E2DD] bg-[#F9F8F6] hover:bg-[#F0EFED] text-xs font-medium text-[#1A1A1A] transition-all shadow-xs"
            title="인스타그램 계정 연동 상태 관리"
          >
            <div className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <Instagram className="w-2.5 h-2.5" />
            </div>
            <span className="font-mono text-xs font-semibold text-[#1A1A1A]">
              {instagramProfile?.username || '@duweon_choo'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onTabChange('archive')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'archive'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F0EFED]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">영감 아카이브</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'archive' ? 'bg-white/20 text-white' : 'bg-[#E5E2DD] text-[#1A1A1A]'
              }`}>
                {recordCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                currentTab === 'report'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F0EFED]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">나의 공간 언어</span>
            </button>

            {/* Quick Record CTA */}
            <button
              onClick={() => onTabChange('record')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                currentTab === 'record'
                  ? 'bg-[#1A1A1A] text-white ring-2 ring-[#1A1A1A]/20'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333333] shadow-xs active:scale-[0.98]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>산책 기록</span>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
};

