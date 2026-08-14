import React, { useState } from 'react';
import { Instagram, ExternalLink, RefreshCw } from 'lucide-react';

interface InstagramEmbedViewerProps {
  url?: string;
  shortcode?: string;
  className?: string;
}

export const InstagramEmbedViewer: React.FC<InstagramEmbedViewerProps> = ({
  url,
  shortcode,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Extract shortcode from url or prop
  let code = shortcode || '';
  if (!code && url) {
    const match = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      code = match[1];
    }
  }

  const embedUrl = code ? `https://www.instagram.com/p/${code}/embed/captioned/` : null;
  const postUrl = url || (code ? `https://www.instagram.com/p/${code}/` : 'https://www.instagram.com/duweon_choo/');

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-white border border-[#E5E2DD] overflow-hidden ${className}`}>
      
      {/* Top Bar with Instagram Link */}
      <div className="w-full px-4 py-2.5 bg-[#F9F8F6] border-b border-[#E5E2DD] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
            <Instagram className="w-3 h-3" />
          </div>
          <span className="font-bold text-[#1A1A1A]">Instagram 공식 게시물</span>
        </div>

        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-[#1A1A1A]/70 hover:text-[#1A1A1A] flex items-center gap-1 hover:underline"
        >
          <span>인스타에서 보기</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Embed Iframe Container */}
      <div className="w-full relative min-h-[480px] sm:min-h-[520px] flex items-center justify-center bg-[#FAF9F7]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-[#1A1A1A]/50 bg-[#FAF9F7] z-10">
            <RefreshCw className="w-5 h-5 animate-spin text-[#1A1A1A]/40" />
            <span>인스타그램 게시물 불러오는 중...</span>
          </div>
        )}

        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-[540px] border-none overflow-hidden"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            title="Instagram Post Embed"
          />
        ) : (
          <div className="p-8 text-center text-xs text-[#1A1A1A]/50">
            게시물 URL이 유효하지 않습니다.
          </div>
        )}
      </div>

    </div>
  );
};
