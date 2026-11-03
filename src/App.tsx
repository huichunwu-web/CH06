import React, { useState, useEffect } from 'react';
import { StudentInfo, QuizSubmission, ScenarioSubmission } from './types';
import { StudentHeader } from './components/StudentHeader';
import { Navbar, NavTab } from './components/Navbar';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { ScenarioAnalysisView } from './components/ScenarioAnalysisView';
import { PdfExportView } from './components/PdfExportView';
import { StudentProfileView } from './components/StudentProfileView';
import { FLASHCARDS_DATA } from './data/flashcards';
import { SCENARIO_CASES } from './data/scenarios';

const STORAGE_KEYS = {
  STUDENT: 'fsp_student_info',
  SOUND: 'fsp_sound_enabled',
  MASTERED: 'fsp_mastered_cards',
  SUBMISSION: 'fsp_latest_submission',
  SCENARIOS: 'fsp_completed_scenarios',
};

export default function App() {
  // Student state
  const [student, setStudent] = useState<StudentInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      studentId: 'F11235088',
      name: '王小華',
      department: '餐飲廚藝暨食品安全系',
      classGroup: '食安研習專班',
    };
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  // Mastered flashcard IDs
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTERED);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['fc-1', 'fc-2', 'fc-5']); // Pre-seed 3 mastered cards for positive first impression
  });

  // Latest quiz submission
  const [latestSubmission, setLatestSubmission] = useState<QuizSubmission | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSION);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Completed scenario IDs
  const [completedScenarioIds, setCompletedScenarioIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['case-1']); // Pre-seed case-1 (Bao Lin Tea Room)
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('cards');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
    } catch {}
  }, [student]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(Array.from(masteredIds)));
    } catch {}
  }, [masteredIds]);

  useEffect(() => {
    if (latestSubmission) {
      try {
        localStorage.setItem(STORAGE_KEYS.SUBMISSION, JSON.stringify(latestSubmission));
      } catch {}
    }
  }, [latestSubmission]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(Array.from(completedScenarioIds)));
    } catch {}
  }, [completedScenarioIds]);

  // Handlers
  const handleToggleMastered = (cardId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleQuizCompleted = (submission: QuizSubmission) => {
    setLatestSubmission(submission);
  };

  const handleScenarioCompleted = (sub: ScenarioSubmission) => {
    setCompletedScenarioIds((prev) => {
      const next = new Set(prev);
      next.add(sub.caseId);
      return next;
    });
  };

  const handleResetProgress = () => {
    setMasteredIds(new Set());
    setLatestSubmission(null);
    setCompletedScenarioIds(new Set());
    try {
      localStorage.removeItem(STORAGE_KEYS.MASTERED);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSION);
      localStorage.removeItem(STORAGE_KEYS.SCENARIOS);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Student Header */}
      <StudentHeader
        student={student}
        onUpdateStudent={setStudent}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        masteredCount={masteredIds.size}
        totalCards={FLASHCARDS_DATA.length}
        latestScore={latestSubmission ? latestSubmission.score : null}
      />

      {/* Module Navigation Tabs */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        quizScore={latestSubmission ? latestSubmission.score : null}
        scenariosCompletedCount={completedScenarioIds.size}
        totalScenarios={SCENARIO_CASES.length}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-12">
        {activeTab === 'cards' && (
          <FlashcardsView
            masteredIds={masteredIds}
            onToggleMastered={handleToggleMastered}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            student={student}
            soundEnabled={soundEnabled}
            onQuizCompleted={handleQuizCompleted}
            onNavigateToPdf={() => setActiveTab('pdf')}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioAnalysisView
            soundEnabled={soundEnabled}
            onScenarioCompleted={handleScenarioCompleted}
            completedCaseIds={completedScenarioIds}
          />
        )}

        {activeTab === 'pdf' && (
          <PdfExportView
            student={student}
            latestSubmission={latestSubmission}
            masteredCount={masteredIds.size}
            totalCards={FLASHCARDS_DATA.length}
            completedScenarioCount={completedScenarioIds.size}
            totalScenarios={SCENARIO_CASES.length}
            onEditStudent={() => setActiveTab('student')}
          />
        )}

        {activeTab === 'student' && (
          <StudentProfileView
            student={student}
            onUpdateStudent={setStudent}
            masteredCount={masteredIds.size}
            totalCards={FLASHCARDS_DATA.length}
            completedScenarioCount={completedScenarioIds.size}
            totalScenarios={SCENARIO_CASES.length}
            latestSubmission={latestSubmission}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-5 px-4 text-center space-y-1 print:hidden">
        <div className="font-medium text-slate-700">
          常見食物中毒及預防 數位研習與能力評量系統
        </div>
        <p className="text-[11px] text-slate-500">
          教材依據：第6章《常見食物中毒及預防》全章節（病原菌嗜pH、病毒特性、細菌性中毒型態、寶林茶室邦克列酸、日本流水素麵彎曲桿菌、從業A肝體檢、真菌毒素與寄生蟲）
        </p>
      </footer>
    </div>
  );
}
