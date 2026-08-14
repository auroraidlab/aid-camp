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
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, AlertTriangle, Github, ExternalLink } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [currentTab, setCurrentTab] = useState<ViewTab>('archive');
  
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
          setCurrentTab(tab);
          if (tab === 'record') {
            setCreationStep(1);
          }
        }}
        recordCount={records.length}
        instagramProfile={instagramProfile}
        onOpenInstagramModal={() => setIsInstagramModalOpen(true)}
      />

      {/* Main App View Switcher */}
      <main className="flex-1 pb-16">
        {currentTab === 'record' && (
          <div>
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
          </div>
        )}

        {currentTab === 'archive' && (
          <ArchiveFeed
            records={records}
            onSelectRecord={(rec) => setSelectedDetailRecord(rec)}
            onOpenReactionModal={(rec) => setReactionModalRecord(rec)}
            onStartNewWalk={() => {
              setCreationStep(1);
              setCurrentTab('record');
            }}
            instagramProfile={instagramProfile}
            onOpenInstagramModal={() => setIsInstagramModalOpen(true)}
            onSyncLatestMonthStories={handleSyncLatestMonthStories}
            onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
            onOpenPostImporter={() => setIsPostImporterOpen(true)}
          />
        )}

        {currentTab === 'report' && (
          <SpatialLanguageReport
            records={records}
            onSelectKeyword={(kw) => {
              setCurrentTab('archive');
            }}
            onStartNewWalk={() => {
              setCreationStep(1);
              setCurrentTab('record');
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

      {/* Subtle Footer */}
      <footer className="border-t border-[#E5E2DD] py-8 text-center text-xs text-[#1A1A1A]/40 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif-kr text-[#1A1A1A]/70">
            산책의 시선 • 개인 공간 영감 & Instagram Story 아카이브
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#1A1A1A]/60 font-mono">
            <a
              href="https://github.com/shyghoststella/aid-camp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors py-1 px-2.5 rounded-full bg-[#F0EFED] hover:bg-[#E5E2DD]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>shyghoststella/aid-camp</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
