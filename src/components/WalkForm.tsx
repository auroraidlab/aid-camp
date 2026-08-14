import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Sparkles, MapPin, Calendar, Check, RefreshCw } from 'lucide-react';

interface WalkFormProps {
  onAnalyze: (data: {
    image: string;
    imageBase64?: string;
    mimeType?: string;
    note: string;
    location: string;
    date: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const PRESET_LOCATIONS = [
  '성수동 연무장길',
  '한남동 골목길',
  '종로 북촌 한옥마을',
  '을지로 인쇄소 골목',
  '서촌 자하문로',
  '도산공원 인근',
  '삼청동 돌담길',
];

const PRESET_SAMPLE_PHOTOS = [
  {
    name: '성수동 붉은 벽돌과 사선광',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&q=85',
    defaultLocation: '성수동 연무장길 뒷골목',
    defaultNote: '오후 4시의 햇빛이 오래된 붉은 벽돌벽을 타고 비스듬히 내려오는 모습이 좋았다.',
  },
  {
    name: '북촌 한옥 처마와 정갈한 그림자',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1080&q=85',
    defaultLocation: '종로구 계동 북촌 한옥마을',
    defaultNote: '처마 밑 좁은 여백 사이로 떨어지는 정갈한 그림자와 목재의 묵직한 결.',
  },
  {
    name: '콘크리트와 담쟁이덩굴의 물성',
    url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1080&q=85',
    defaultLocation: '한남동 대사관로 경사 골목',
    defaultNote: '노출 콘크리트 벽면 틈새를 비집고 나온 담쟁이덩굴과 아침 안개빛의 대비.',
  },
  {
    name: '스틸 도어와 노을빛 반영',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1080&q=85',
    defaultLocation: '도산공원 인근 골목 카페',
    defaultNote: '스테인리스 스틸 도어에 반사되는 저녁노을과 나무의 실루엣이 공간의 경계를 허문다.',
  },
];

const INSPIRATION_MEMOS = [
  '오후 4시의 햇빛이 오래된 벽을 타고 내려오는 모습이 좋았다.',
  '벽면의 거친 콘크리트 질감과 부드러운 아침 그림자의 대비가 인상적이다.',
  '골목 모서리에서 만난 작은 틈새가 시선의 여백을 만들어낸다.',
  '처마 밑 깊은 그늘에서 시간의 온도가 한 템포 쉬어가는 느낌.',
];

export const WalkForm: React.FC<WalkFormProps> = ({ onAnalyze, isLoading }) => {
  const [image, setImage] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG 등)만 업로드할 수 있습니다.');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setImage(sample.url);
    setImageBase64(''); // Remote URL
    setMimeType('image/jpeg');
    setLocation(sample.defaultLocation);
    setNote(sample.defaultNote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('산책 중 촬영한 사진을 업로드해주세요.');
      return;
    }
    if (!note.trim()) {
      alert('눈에 들어온 순간에 대한 짧은 메모를 남겨주세요.');
      return;
    }

    onAnalyze({
      image,
      imageBase64,
      mimeType,
      note: note.trim(),
      location: location.trim() || '도심의 산책길',
      date,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Title & Introduction */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#1A1A1A]/40">
            Step 01 • Record Your Walk
          </span>
        </div>
        <h2 className="font-serif-kr text-3xl sm:text-4xl font-normal text-[#1A1A1A] mb-3">
          오늘의 산책 기록하기
        </h2>
        <p className="text-[#1A1A1A]/60 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          길을 걷다 눈길을 사로잡은 빛, 그림자, 소재, 건축의 한 컷을 올리고 짧은 생각을 적어주세요. 
          AI가 공간디자인적 시선으로 의미를 해석해 드립니다.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-8 p-4 rounded-xl bg-white border border-[#E5E2DD] flex items-start gap-3.5 text-[#1A1A1A]/80 shadow-xs">
        <div className="w-6 h-6 rounded-full bg-[#F0EFED] flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#1A1A1A]" />
        </div>
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-[#1A1A1A] block mb-0.5">개인정보 보호 안내</span>
          사진에 사람의 얼굴, 차량 번호판, 상세 집 주소, 전화번호 등 개인 식별 정보가 포함되어 있지 않은지 업로드 전 확인해주세요.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Area */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E2DD] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#1A1A1A] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1A1A1A]" />
              산책 사진 업로드 <span className="text-[#1A1A1A]/40">*</span>
            </label>

            {/* Quick Sample Selector */}
            <div className="text-[11px] text-[#1A1A1A]/50 flex items-center gap-2">
              <span>샘플 사진 테스트:</span>
              <div className="flex gap-1.5">
                {PRESET_SAMPLE_PHOTOS.slice(0, 3).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="px-2.5 py-1 bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] rounded-lg text-xs font-medium transition-colors"
                  >
                    샘플 {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border border-dashed transition-all overflow-hidden ${
              dragActive
                ? 'border-[#1A1A1A] bg-[#F0EFED]'
                : image
                ? 'border-[#E5E2DD] bg-[#F9F8F6]'
                : 'border-[#E5E2DD] hover:border-[#1A1A1A] hover:bg-[#F0EFED]/60 bg-[#F9F8F6]'
            } min-h-[260px] sm:min-h-[320px] flex flex-col items-center justify-center p-6`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {image ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <img
                  src={image}
                  alt="Walk Snapshot"
                  className="max-h-[340px] w-auto object-contain rounded-lg shadow-xs"
                />
                <div className="mt-4 flex items-center gap-2 bg-[#1A1A1A] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>사진 등록 완료 • 클릭하여 변경</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0EFED] text-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                  사진을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-[#1A1A1A]/40 font-normal">
                  JPG, PNG, WebP 이미지 지원 (빛과 공간의 결이 드러난 사진을 추천합니다)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date & Location Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E2DD] shadow-xs">
          <div>
            <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#1A1A1A] flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]" />
              산책 일자
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] text-xs sm:text-sm text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#1A1A1A] flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]" />
              장소
            </label>
            <input
              type="text"
              placeholder="예: 성수동 연무장길, 북촌 계동 골목"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] text-xs sm:text-sm text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A]"
            />
          </div>

          {/* Quick Location Pills */}
          <div className="sm:col-span-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1A1A1A]/40 mr-1">추천 장소:</span>
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    location === loc
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-medium'
                      : 'bg-[#F0EFED] text-[#1A1A1A]/70 border-[#E5E2DD] hover:bg-[#E5E2DD]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Observation Memo Input */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E2DD] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold tracking-[0.1em] uppercase text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
              오늘의 발견 & 짧은 메모 <span className="text-[#1A1A1A]/40">*</span>
            </label>
            <span className="text-[11px] text-[#1A1A1A]/40">
              한 문장만으로도 충분합니다
            </span>
          </div>

          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="무엇이 눈에 들어왔나요? (예: 오후 4시의 햇빛이 오래된 벽을 타고 내려오는 모습이 좋았다.)"
            className="w-full p-4 rounded-xl border border-[#E5E2DD] bg-[#F9F8F6] text-xs sm:text-sm leading-relaxed text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] placeholder:text-[#1A1A1A]/30"
          />

          {/* Quick Memo Ideas */}
          <div className="mt-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/40 block mb-2">메모 예시</span>
            <div className="space-y-1.5">
              {INSPIRATION_MEMOS.map((memoText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNote(memoText)}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-[#F9F8F6] hover:bg-[#F0EFED] text-[#1A1A1A]/80 border border-[#E5E2DD] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">"{memoText}"</span>
                  <span className="text-[#1A1A1A] opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-wider font-bold shrink-0 ml-2">
                    적용
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !image || !note.trim()}
            className={`w-full py-4 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-3 transition-all ${
              isLoading || !image || !note.trim()
                ? 'bg-[#E5E2DD] text-[#1A1A1A]/30 cursor-not-allowed'
                : 'bg-[#1A1A1A] hover:bg-[#333333] text-white shadow-md hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>AI가 사진과 메모의 공간적 의미를 분석 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>AI 공간 분석 & 문장 생성하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

