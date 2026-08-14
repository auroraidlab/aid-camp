export type ReactionType =
  | '공감'
  | '질문'
  | '칭찬'
  | '디자인 의견'
  | '공간 문의'
  | '협업 제안'
  | '기타';

export interface ReactionItem {
  id: string;
  type: ReactionType;
  content: string;
  author?: string;
  createdAt: string;
}

export interface GeneratedCopies {
  emotional: string;     // A. 감성 문장
  expert: string;        // B. 공간전문가 문장
  storyShort: string;    // C. Instagram Story용 짧은 문장
}

export interface SpatialAnalysis {
  keywords: string[];          // 핵심 공간 키워드 3~5개 (#빛, #그림자 등)
  mood: string;                // 공간 분위기
  lightAndShadow: string;      // 빛과 그림자
  materialsAndColors: string;  // 소재와 색
  formAndNature: string;       // 형태 및 식물/자연
  architecturalFeature: string;// 건축 및 공간디자인적 특징
  copies: GeneratedCopies;     // 3가지 AI 문장
}

export type StoryTemplateId = 'templateA' | 'templateB' | 'templateC';

export interface InstagramProfile {
  username: string; // e.g. "duweon_choo"
  displayName: string; // e.g. "추두원 (Duweon Choo)"
  bio: string;
  avatarUrl?: string;
  isConnected: boolean;
  connectedAt: string;
  profileUrl: string;
}

export interface TemplateCustomization {
  colorScheme: 'warm-sand' | 'raw-concrete' | 'deep-noir' | 'sage-green' | 'terracotta';
  fontPairing: 'modern-serif' | 'clean-sans' | 'editorial-mix';
  showDate: boolean;
  showLocation: boolean;
  showKeywords: boolean;
  showAuthorBadge: boolean;
  authorHandle?: string; // e.g. "@duweon_choo"
}

export interface WalkRecord {
  id: string;
  date: string;              // YYYY-MM-DD
  time?: string;             // HH:mm
  location: string;          // 장소 (예: 성수동 연무장길, 북촌 계동 골목)
  note: string;              // 사용자가 입력한 짧은 관찰 메모
  image: string;             // Data URL or Image URL
  imageCaption?: string;
  spatialAnalysis: SpatialAnalysis;
  selectedCopyType: 'emotional' | 'expert' | 'storyShort';
  selectedCopyText: string;
  selectedTemplate: StoryTemplateId;
  templateCustomization?: TemplateCustomization;
  reactions: ReactionItem[];
  // Real Instagram Post integration fields
  instagramPostUrl?: string;       // e.g. "https://www.instagram.com/p/..."
  instagramShortcode?: string;     // e.g. "C_12345"
  instagramEmbedHtml?: string;     // Official embed code if available
  instagramLikes?: number;         // e.g. 142
  instagramCommentsCount?: number; // e.g. 18
  isRealInstagramPost?: boolean;   // true if imported directly from Instagram post
  createdAt: string;
  updatedAt: string;
}

export interface InstagramFetchedPost {
  url: string;
  shortcode: string;
  caption: string;
  imageUrl: string;
  authorHandle: string;
  authorName?: string;
  timestamp?: string;
  date?: string;
  locationName?: string;
  likesCount?: number;
  commentsCount?: number;
  embedHtml?: string;
}

export type ViewTab = 'record' | 'archive' | 'report' | 'creator';
