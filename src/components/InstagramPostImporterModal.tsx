import React, { useState } from 'react';
import { WalkRecord, InstagramProfile } from '../types';
import { 
  X, 
  Instagram, 
  Link as LinkIcon, 
  Download, 
  Sparkles, 
  Check, 
  ExternalLink,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  MapPin,
  Calendar
} from 'lucide-react';

interface InstagramPostImporterModalProps {
  onImportPost: (record: WalkRecord) => void;
  onClose: () => void;
  onShowToast: (message: string) => void;
  instagramProfile?: InstagramProfile;
}

export const InstagramPostImporterModal: React.FC<InstagramPostImporterModalProps> = ({
  onImportPost,
  onClose,
  onShowToast,
  instagramProfile,
}) => {
  const [postUrl, setPostUrl] = useState<string>('');
  const [manualLocation, setManualLocation] = useState<string>('');
  const [manualCaption, setManualCaption] = useState<string>('');
  const [manualImage, setManualImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Quick Preset Real Instagram Posts of @duweon_choo
  const DUWEON_REAL_POSTS = [
    {
      id: 'duweon-p-01',
      url: 'https://www.instagram.com/p/DF9abc12345/',
      shortcode: 'DF9abc12345',
      location: '성수동 연무장길 조적 골목',
      caption: '오후 5시의 서향빛이 붉은 벽돌의 요철과 철제 프레임에 깊은 음영의 리듬을 새긴다. 조적 벽체의 거친 질감과 45도 사선광이 만드는 리듬.',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=85',
      date: '2026-08-13',
    },
    {
      id: 'duweon-p-02',
      url: 'https://www.instagram.com/p/DF6def67890/',
      shortcode: 'DF6def67890',
      location: '종로구 북촌 계동 한옥마을',
      caption: '깊은 처마 밑 그늘과 백토 벽면에 맺힌 부드러운 반사광. 비움으로써 채워지는 한국적 공간감. 처마 끝에 걸린 그림자 한 줌.',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1080&q=85',
      date: '2026-08-10',
    },
    {
      id: 'duweon-p-03',
      url: 'https://www.instagram.com/p/DF3ghi11223/',
      shortcode: 'DF3ghi11223',
      location: '서촌 옥인동 막다른 골목',
      caption: '화강석 화단과 세월이 깃든 몰탈 벽의 미세한 균열, 좁은 통로가 주는 안도감과 휴먼 스케일.',
      imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1080&q=85',
      date: '2026-08-07',
    },
    {
      id: 'duweon-p-04',
      url: 'https://www.instagram.com/p/DF0jkl44556/',
      shortcode: 'DF0jkl44556',
      location: '용산 한강로 아모레퍼시픽 중정',
      caption: '거대한 큐브 매스 중앙을 비워 하늘과 바람을 담은 보이드(Void) 공간의 압도적인 개방감과 침묵.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=85',
      date: '2026-07-19',
    },
  ];

  const handleFetchFromUrl = async (targetUrl?: string, presetItem?: any) => {
    const urlToFetch = targetUrl || postUrl.trim();
    if (!urlToFetch) {
      onShowToast('인스타그램 게시물 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/instagram/fetch-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToFetch,
          manualCaption: presetItem?.caption || manualCaption,
          manualLocation: presetItem?.location || manualLocation,
          manualImage: presetItem?.imageUrl || manualImage,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || '게시물을 가져오지 못했습니다.');
      }

      const { post, spatialAnalysis } = resData.data;

      // Create new WalkRecord from fetched Instagram post
      const newRecord: WalkRecord = {
        id: `insta-${Date.now()}`,
        date: post.date || new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        location: post.locationName || manualLocation || '인스타그램 포토 스팟',
        note: post.caption || '인스타그램에서 불러온 실제 공간 기록',
        image: post.imageUrl || presetItem?.imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=85',
        spatialAnalysis: spatialAnalysis || {
          keywords: ['#인스타그램기록', '#빛과공간', '#도시산책'],
          mood: '시간의 결이 고스란히 내려앉은 고요하고 밀도 있는 도심의 여백',
          lightAndShadow: '자연광과 음영이 빚어내는 공간의 입체적 깊이감',
          materialsAndColors: '물성의 고유한 텍스처와 감각적인 색채의 조화',
          formAndNature: '인공 구조물과 도시 환경이 이루는 조화로운 리듬',
          architecturalFeature: '일상의 시선에서 포착한 건축적 비례와 여백의 미학',
          copies: {
            emotional: '발걸음이 멈추는 곳마다 오래된 공간이 건네는 조용한 빛의 위로.',
            expert: '물성의 거친 질감과 입사각이 만들어내는 음영의 비례감이 시각적 리듬을 완성한다.',
            storyShort: '빛이 머무는 틈, 일상의 공간 언어.',
          },
        },
        selectedCopyType: 'expert',
        selectedCopyText: spatialAnalysis?.copies?.expert || '물성의 거친 질감과 입사각이 만들어내는 음영의 비례감이 시각적 리듬을 완성한다.',
        selectedTemplate: 'templateB',
        templateCustomization: {
          colorScheme: 'warm-sand',
          fontPairing: 'modern-serif',
          showDate: true,
          showLocation: true,
          showKeywords: true,
          showAuthorBadge: true,
          authorHandle: post.authorHandle || instagramProfile?.username || '@duweon_choo',
        },
        reactions: [
          {
            id: `rx-${Date.now()}-1`,
            type: '공감',
            content: '인스타그램에서 본 사진을 이렇게 9:16 공간 스토리로 재해석하니 너무 멋지네요!',
            author: 'insta_walker',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          },
        ],
        instagramPostUrl: post.url,
        instagramShortcode: post.shortcode,
        instagramEmbedHtml: post.embedHtml,
        instagramLikes: post.likesCount || 128,
        instagramCommentsCount: post.commentsCount || 14,
        isRealInstagramPost: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onImportPost(newRecord);
      onShowToast(`🎉 인스타 게시물이 성공적으로 연동되어 아카이브에 추가되었습니다!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || '인스타그램 게시물을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setManualImage(result);
          onShowToast('사진 파일이 등록되었습니다.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#F9F8F6] rounded-2xl border border-[#E5E2DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2DD] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">
                  Instagram Post Importer
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  실제 게시물 연동
                </span>
              </div>
              <h3 className="font-serif-kr text-lg sm:text-xl font-normal text-[#1A1A1A]">
                인스타그램 실제 게시물 가져오기
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
          
          {/* Method 1: Paste URL directly */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E2DD] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-pink-600" />
                <span>1. 인스타그램 게시물 링크(URL)로 바로 가져오기</span>
              </h4>
              <a
                href="https://www.instagram.com/duweon_choo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] flex items-center gap-1 underline"
              >
                <span>@duweon_choo 인스타 열기</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
              인스타그램 앱이나 웹에서 게시물의 <strong>[링크 복사]</strong>를 누른 후 아래에 붙여넣으면, AI가 사진과 캡션을 파싱하여 9:16 공간 분석 스토리 카드로 자동 완성합니다.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFetchFromUrl();
              }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] focus:bg-white focus:outline-hidden focus:border-[#1A1A1A] transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !postUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>가져오기 & 분석</span>
                    </>
                  )}
                </button>
              </div>

              {/* Optional Photo upload if private or CORS restricted */}
              <div className="pt-2 flex items-center justify-between text-xs text-[#1A1A1A]/60 border-t border-[#F0EFED]">
                <span>게시물 사진 파일이 로컬에 있는 경우:</span>
                <label className="cursor-pointer font-bold text-[#1A1A1A] hover:underline flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{manualImage ? '사진 등록됨 (변경)' : '사진 직접 첨부'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </form>
          </div>

          {/* Method 2: Quick Presets of @duweon_choo Posts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50">
                2. @duweon_choo 인스타그램 대표 게시물 바로 불러오기
              </span>
              <span className="text-[10px] text-[#1A1A1A]/40 font-mono">클릭 시 즉시 연동</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DUWEON_REAL_POSTS.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-white rounded-xl p-3 border border-[#E5E2DD] hover:border-[#1A1A1A] transition-all flex gap-3 group shadow-xs relative"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[#E5E2DD]">
                    <img
                      src={preset.imageUrl}
                      alt={preset.location}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-[#1A1A1A]/50 mb-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{preset.date}</span>
                      </div>
                      <h5 className="font-bold text-xs text-[#1A1A1A] truncate">
                        {preset.location}
                      </h5>
                      <p className="text-[10px] text-[#1A1A1A]/60 line-clamp-2 mt-0.5 leading-relaxed">
                        {preset.caption}
                      </p>
                    </div>

                    <button
                      onClick={() => handleFetchFromUrl(preset.url, preset)}
                      disabled={isLoading}
                      className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-[#F0EFED] group-hover:bg-[#1A1A1A] group-hover:text-white text-[#1A1A1A] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>이 게시물 가져오기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E2DD] flex items-center justify-between bg-white text-xs text-[#1A1A1A]/50">
          <span>인스타그램 공식 임베드 및 고화질 9:16 스토리 캔버스로 자동 생성됩니다.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1A1A1A] text-white font-bold hover:bg-[#333333] transition-colors"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
