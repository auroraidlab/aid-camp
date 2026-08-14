import React, { useState, useEffect } from 'react';
import { 
  WalkRecord, 
  ViewTab, 
  SpatialAnalysis, 
  StoryTemplateId, 
  ReactionItem,
  InstagramProfile
} from './types';
import { SAMPLE_WALK_RECORDS } from './data/sampleRecords';
import { 
  getStoredRecords, 
  saveStoredRecords, 
  initializeRecordsWithSamples,
  resetToSampleRecords
} from './utils/storage';
import { Header } from './components/Header';
import { WalkForm } from './components/WalkForm';
import { AIAnalysisResult } from './components/AIAnalysisResult';
import { StoryVisualStudio } from './components/StoryVisualStudio';
import { ArchiveFeed } from './components/ArchiveFeed';
import { WalkDetailModal } from './components/WalkDetailModal';
import { ReactionModal } from './components/ReactionModal';
import { SpatialLanguageReport } from './components/SpatialLanguageReport';
import { InstagramConnectModal } from './components/InstagramConnectModal';
import { PhotoManagerModal } from './components/PhotoManagerModal';
import { InstagramPostImporterModal } from './components/InstagramPostImporterModal';
import { AdminAuthModal, checkIsAdmin, setAdminStatus } from './components/AdminAuthModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, AlertTriangle, Lock, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [currentTab, setCurrentTab] = useState<ViewTab>('archive');
  
  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkIsAdmin());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  // Instagram Connected Profile State
  const [instagramProfile, setInstagramProfile] = useState<InstagramProfile>(() => {
    const saved = localStorage.getItem('sanchaek_instagram_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      username: '@duweon_choo',
      displayName: '추두원 (Duweon Choo)',
      profileUrl: 'https://www.instagram.com/duweon_choo/',
      isConnected: true,
      connectedAt: new Date().toISOString(),
      bio: '공간 컨설팅 & 공간 디자이너의 일상 산책 영감 아카이브',
      autoWatermark: true,
    };
  });
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState<boolean>(false);
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState<boolean>(false);
  const [isPostImporterOpen, setIsPostImporterOpen] = useState<boolean>(false);

  // Walk creation wizard step: 1 = Form, 2 = AI Analysis, 3 = Story Studio
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(1);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  
  // Current draft in creation
  const [currentDraft, setCurrentDraft] = useState<Partial<WalkRecord>>({
    date: new Date().toISOString().split('T')[0],
    location: '',
    note: '',
    image: '',
    selectedTemplate: 'templateB',
  });

  // Modals state
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<WalkRecord | null>(null);
  const [reactionModalRecord, setReactionModalRecord] = useState<WalkRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize records from storage
  useEffect(() => {
    const loaded = initializeRecordsWithSamples(SAMPLE_WALK_RECORDS);
    setRecords(loaded);
  }, []);

  // Update profile handler
  const handleUpdateInstagramProfile = (newProfile: InstagramProfile) => {
    setInstagramProfile(newProfile);
    localStorage.setItem('sanchaek_instagram_profile', JSON.stringify(newProfile));
  };

  // Sync / Reset to latest 1-month stories
  const handleSyncLatestMonthStories = () => {
    const fresh = resetToSampleRecords(SAMPLE_WALK_RECORDS);
    setRecords(fresh);
    showToast('@duweon_choo 최근 1달(7.15~8.13) 스토리 8건이 새로고침되었습니다.');
  };

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Open Admin Auth modal with optional callback
  const handleOpenAdminAuth = (action?: () => void) => {
    if (action) {
      setPendingAdminAction(() => action);
    } else {
      setPendingAdminAction(null);
    }
    setIsAdminModalOpen(true);
  };

  // Admin login success
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    if (pendingAdminAction) {
      pendingAdminAction();
      setPendingAdminAction(null);
    }
  };

  // Admin logout
  const handleAdminLogout = () => {
    setAdminStatus(false);
    setIsAdmin(false);
    if (currentTab === 'record') {
      setCurrentTab('archive');
    }
    showToast('관리자 로그아웃되었습니다. (방문자 모드로 전환)');
  };

  // Step 1: Submit photo & memo to AI API
  const handleAnalyzeWalk = async (data: {
    image: string;
    imageBase64?: string;
    mimeType?: string;
    note: string;
    location: string;
    date: string;
  }) => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/analyze-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: data.imageBase64,
          mimeType: data.mimeType,
          note: data.note,
          location: data.location,
          date: data.date,
        }),
      });

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error('공간 분석에 실패했습니다.');
      }

      const analysis: SpatialAnalysis = json.data;

      // Update draft with AI analysis results
      const newDraft: Partial<WalkRecord> = {
        id: `walk-${Date.now()}`,
        date: data.date,
        location: data.location,
        note: data.note,
        image: data.image,
        spatialAnalysis: analysis,
        selectedCopyType: 'expert',
        selectedCopyText: analysis.copies.expert,
        selectedTemplate: 'templateB',
        templateCustomization: {
          colorScheme: 'warm-sand',
          fontPairing: 'modern-serif',
          showDate: true,
          showLocation: true,
          showKeywords: true,
          showAuthorBadge: true,
        },
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentDraft(newDraft);
      setCreationStep(2); // Move to Step 2 (Analysis & Copy selection)
    } catch (err: any) {
      console.error(err);
      alert('AI 공간 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Step 2: User chooses a copy sentence and moves to 9:16 Story Studio
  const handleProceedToStory = (
    selectedType: 'emotional' | 'expert' | 'storyShort',
    selectedText: string
  ) => {
    setCurrentDraft((prev) => ({
      ...prev,
      selectedCopyType: selectedType,
      selectedCopyText: selectedText,
    }));
    setCreationStep(3); // Move to Step 3 (9:16 Story Visual Studio)
  };

  // Step 3: Save completed walk record
  const handleSaveRecord = (
    updatedRecord: WalkRecord,
    openReactionImmediately: boolean = false
  ) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === updatedRecord.id);
      let nextList: WalkRecord[];
      if (exists) {
        nextList = prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
      } else {
        nextList = [updatedRecord, ...prev];
      }
      saveStoredRecords(nextList);
      return nextList;
    });

    showToast('✨ 산책 기록과 Story 카드가 아카이브에 안전하게 저장되었습니다.');

    if (openReactionImmediately) {
      setReactionModalRecord(updatedRecord);
    }

    // Reset creation flow and switch to archive tab
    setCreationStep(1);
    setCurrentTab('archive');
  };

  // Audience Reaction: Add new feedback item
  const handleAddReaction = (
    recordId: string,
    reactionData: Omit<ReactionItem, 'id' | 'createdAt'>
  ) => {
    const newReaction: ReactionItem = {
      id: `rx-${Date.now()}`,
      ...reactionData,
      createdAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setRecords((prev) => {
      const nextList = prev.map((r) => {
        if (r.id === recordId) {
          const updatedReactions = [newReaction, ...(r.reactions || [])];
          const updatedRec = {
            ...r,
            reactions: updatedReactions,
            updatedAt: new Date().toISOString(),
          };
          // Update open modals if targeting same record
          if (selectedDetailRecord?.id === recordId) {
            setSelectedDetailRecord(updatedRec);
          }
          if (reactionModalRecord?.id === recordId) {
            setReactionModalRecord(updatedRec);
          }
          return updatedRec;
        }
        return r;
      });
      saveStoredRecords(nextList);
      return nextList;
    });

    showToast('💬 사람들의 반응이 연결되어 기록되었습니다.');
  };

  // Audience Reaction: Delete reaction
  const handleDeleteReaction = (recordId: string, reactionId: string) => {
    setRecords((prev) => {
      const nextList = prev.map((r) => {
        if (r.id === recordId) {
          const updatedReactions = (r.reactions || []).filter((rx) => rx.id !== reactionId);
          const updatedRec = {
            ...r,
            reactions: updatedReactions,
            updatedAt: new Date().toISOString(),
          };
          if (selectedDetailRecord?.id === recordId) {
            setSelectedDetailRecord(updatedRec);
          }
          if (reactionModalRecord?.id === recordId) {
            setReactionModalRecord(updatedRec);
          }
          return updatedRec;
        }
        return r;
      });
      saveStoredRecords(nextList);
      return nextList;
    });
  };

  // Update single story photo
  const handleUpdateRecordPhoto = (recordId: string, newImageUrl: string) => {
    setRecords((prev) => {
      const nextList = prev.map((r) => {
        if (r.id === recordId) {
          const updated = {
            ...r,
            image: newImageUrl,
            updatedAt: new Date().toISOString(),
          };
          if (selectedDetailRecord?.id === recordId) {
            setSelectedDetailRecord(updated);
          }
          return updated;
        }
        return r;
      });
      saveStoredRecords(nextList);
      return nextList;
    });
  };

  // Delete Walk Record
  const handleDeleteRecord = (id: string) => {
    if (!confirm('이 산책 기록을 아카이브에서 삭제하시겠습니까?')) return;
    setRecords((prev) => {
      const nextList = prev.filter((r) => r.id !== id);
      saveStoredRecords(nextList);
      return nextList;
    });
    setSelectedDetailRecord(null);
    showToast('기록이 삭제되었습니다.');
  };

  // Import Real Instagram Post handler
  const handleImportInstagramPost = (newRecord: WalkRecord) => {
    setRecords((prev) => {
      const nextList = [newRecord, ...prev];
      saveStoredRecords(nextList);
      return nextList;
    });
    setSelectedDetailRecord(newRecord);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col font-sans-ui selection:bg-[#1A1A1A] selection:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 border border-white/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'record' && !isAdmin) {
            handleOpenAdminAuth(() => {
              setCurrentTab('record');
              setCreationStep(1);
            });
            return;
          }
          setCurrentTab(tab);
          if (tab === 'record') {
            setCreationStep(1);
          }
        }}
        recordCount={records.length}
        instagramProfile={instagramProfile}
        onOpenInstagramModal={() => setIsInstagramModalOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminAuth={() => handleOpenAdminAuth()}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main App View Switcher */}
      <main className="flex-1 pb-16">
        {currentTab === 'record' && (
          <div>
            {!isAdmin ? (
              <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E2DD] shadow-lg space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mx-auto shadow-md">
                    <Lock className="w-7 h-7 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#1A1A1A]/50">
                      Administrator Only
                    </span>
                    <h3 className="font-serif-kr text-2xl font-normal text-[#1A1A1A]">
                      산책 기록은 관리자 전용입니다
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1A1A1A]/60 leading-relaxed max-w-md mx-auto font-serif-kr">
                      공간 디자이너의 일상 산책과 건축적 영감을 기록하고 9:16 인스타그램 스토리를 제작하는 기능은 계정 관리자(@duweon_choo)만 접근할 수 있습니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#E5E2DD] text-xs text-[#1A1A1A]/70 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>관리자 비밀번호를 인증하시면 기록을 작성할 수 있습니다.</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      onClick={() => handleOpenAdminAuth(() => {
                        setCurrentTab('record');
                        setCreationStep(1);
                      })}
                      className="px-6 py-3 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>관리자 인증하기</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('archive')}
                      className="px-6 py-3 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD] text-[#1A1A1A] text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>아카이브 둘러보기</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {creationStep === 1 && (
                  <WalkForm onAnalyze={handleAnalyzeWalk} isLoading={isLoadingAI} />
                )}

                {creationStep === 2 && currentDraft.spatialAnalysis && (
                  <AIAnalysisResult
                    analysis={currentDraft.spatialAnalysis}
                    image={currentDraft.image || ''}
                    location={currentDraft.location || ''}
                    date={currentDraft.date || ''}
                    userNote={currentDraft.note || ''}
                    onProceedToStory={handleProceedToStory}
                    onBack={() => setCreationStep(1)}
                  />
                )}

                {creationStep === 3 && currentDraft.spatialAnalysis && (
                  <StoryVisualStudio
                    initialRecord={currentDraft as WalkRecord}
                    onSaveRecord={handleSaveRecord}
                    onBack={() => setCreationStep(2)}
                    instagramProfile={instagramProfile}
                    onOpenInstagramModal={() => setIsInstagramModalOpen(true)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {currentTab === 'archive' && (
          <ArchiveFeed
            records={records}
            onSelectRecord={(rec) => setSelectedDetailRecord(rec)}
            onOpenReactionModal={(rec) => setReactionModalRecord(rec)}
            onStartNewWalk={() => {
              if (!isAdmin) {
                handleOpenAdminAuth(() => {
                  setCreationStep(1);
                  setCurrentTab('record');
                });
              } else {
                setCreationStep(1);
                setCurrentTab('record');
              }
            }}
            instagramProfile={instagramProfile}
            onOpenInstagramModal={() => setIsInstagramModalOpen(true)}
            onSyncLatestMonthStories={handleSyncLatestMonthStories}
            onOpenPhotoManager={() => {
              if (!isAdmin) {
                handleOpenAdminAuth(() => setIsPhotoManagerOpen(true));
              } else {
                setIsPhotoManagerOpen(true);
              }
            }}
            onOpenPostImporter={() => {
              if (!isAdmin) {
                handleOpenAdminAuth(() => setIsPostImporterOpen(true));
              } else {
                setIsPostImporterOpen(true);
              }
            }}
            isAdmin={isAdmin}
            onOpenAdminAuth={() => handleOpenAdminAuth()}
          />
        )}

        {currentTab === 'report' && (
          <SpatialLanguageReport
            records={records}
            onSelectKeyword={(kw) => {
              setCurrentTab('archive');
            }}
            onStartNewWalk={() => {
              if (!isAdmin) {
                handleOpenAdminAuth(() => {
                  setCreationStep(1);
                  setCurrentTab('record');
                });
              } else {
                setCreationStep(1);
                setCurrentTab('record');
              }
            }}
            instagramProfile={instagramProfile}
          />
        )}
      </main>

      {/* Detail Walk Record View Modal */}
      {selectedDetailRecord && (
        <WalkDetailModal
          record={selectedDetailRecord}
          onClose={() => setSelectedDetailRecord(null)}
          onOpenReactionModal={(rec) => {
            setReactionModalRecord(rec);
          }}
          onDeleteRecord={handleDeleteRecord}
          instagramProfile={instagramProfile}
          onUpdateRecordPhoto={handleUpdateRecordPhoto}
          isAdmin={isAdmin}
          onOpenAdminAuth={() => handleOpenAdminAuth()}
        />
      )}

      {/* Audience Reaction Tracker Modal */}
      {reactionModalRecord && (
        <ReactionModal
          record={reactionModalRecord}
          onClose={() => setReactionModalRecord(null)}
          onAddReaction={handleAddReaction}
          onDeleteReaction={handleDeleteReaction}
        />
      )}

      {/* Instagram Connect & Settings Modal */}
      {isInstagramModalOpen && (
        <InstagramConnectModal
          profile={instagramProfile}
          onUpdateProfile={handleUpdateInstagramProfile}
          onClose={() => setIsInstagramModalOpen(false)}
          onShowToast={showToast}
          onSyncLatestMonthStories={handleSyncLatestMonthStories}
          onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
          onOpenPostImporter={() => setIsPostImporterOpen(true)}
        />
      )}

      {/* Real Instagram Photo Manager Modal */}
      {isPhotoManagerOpen && (
        <PhotoManagerModal
          records={records}
          onUpdateRecordPhoto={handleUpdateRecordPhoto}
          onClose={() => setIsPhotoManagerOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Real Instagram Post Importer Modal */}
      {isPostImporterOpen && (
        <InstagramPostImporterModal
          onImportPost={handleImportInstagramPost}
          onClose={() => setIsPostImporterOpen(false)}
          onShowToast={showToast}
          instagramProfile={instagramProfile}
        />
      )}

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={handleAdminLoginSuccess}
        onShowToast={showToast}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-[#E5E2DD] py-8 text-center text-xs text-[#1A1A1A]/40 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif-kr text-[#1A1A1A]/70">
            산책의 시선 • 개인 공간 영감 & Instagram Story 아카이브
          </p>
          <p className="text-[11px] text-[#1A1A1A]/40 font-mono tracking-tight">
            Everyday Walk, Spatial Analysis & Visual Dialogue
          </p>
        </div>
      </footer>

    </div>
  );
}
