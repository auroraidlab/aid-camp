import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, KeyRound, X, AlertCircle, Sparkles, LogIn } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string) => void;
}

export const ADMIN_PIN_KEY = 'spatial_archive_admin_pin';
export const ADMIN_AUTH_KEY = 'spatial_archive_is_admin';

export const getStoredAdminPin = (): string => {
  return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
};

export const checkIsAdmin = (): boolean => {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const setAdminStatus = (status: boolean): void => {
  if (status) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
};

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsChangingPin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredAdminPin();

    if (pin === correctPin) {
      setAdminStatus(true);
      onShowToast('관리자 인증이 완료되었습니다. (산책 기록 가능)');
      onSuccess();
      onClose();
    } else {
      setError('비밀번호가 일치하지 않습니다. 기본 비밀번호는 1234 입니다.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setError('새 비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
    setAdminStatus(true);
    onShowToast('새 관리자 비밀번호가 저장 및 적용되었습니다.');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E5E2DD] transition-all">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#E5E2DD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold text-[#1A1A1A]">
                관리자 전용 인증
              </h3>
              <p className="text-[11px] text-[#1A1A1A]/50">
                산책 기록 및 아카이브 관리 권한 확인
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] p-2 rounded-full hover:bg-[#F0EFED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#E5E2DD] space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold font-serif-kr">
                산책자/관리자(@duweon_choo) 전용 권한
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-serif-kr">
              새로운 산책 기록 작성, 인스타그램 게시물 가져오기, 사진 변경 및 삭제는 관리자만 이용할 수 있습니다.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#1A1A1A]/60">
              <span>기본 비밀번호: <strong className="text-[#1A1A1A] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E2DD]">1234</strong></span>
              <button
                type="button"
                onClick={() => setIsChangingPin(!isChangingPin)}
                className="text-xs text-[#1A1A1A] underline font-medium hover:text-black"
              >
                {isChangingPin ? '로그인으로 돌아가기' : '비밀번호 변경'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isChangingPin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A]/70 mb-1.5 tracking-wider uppercase">
                  관리자 비밀번호 (PIN)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" />
                  <input
                    ref={inputRef}
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    placeholder="4자리 비밀번호 입력 (기본: 1234)"
                    className="w-full pl-10 pr-4 py-3 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-sm font-mono tracking-widest text-[#1A1A1A] placeholder:tracking-normal placeholder:text-xs placeholder:font-sans focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E5E2DD] bg-white hover:bg-[#F0EFED] text-xs font-bold text-[#1A1A1A] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-[0.98]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>인증 및 시작</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A]/70 mb-1.5 tracking-wider uppercase">
                  새 관리자 비밀번호
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="새 비밀번호 입력 (4자리 이상)"
                  className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-sm font-mono tracking-widest text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A] focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E5E2DD] bg-white hover:bg-[#F0EFED] text-xs font-bold text-[#1A1A1A] transition-colors"
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold tracking-wider shadow-xs transition-colors"
                >
                  비밀번호 저장
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
