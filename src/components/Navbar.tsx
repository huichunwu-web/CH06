import React from 'react';
import { BookOpen, CheckSquare, Stethoscope, FileDown, UserCheck } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export type NavTab = 'cards' | 'quiz' | 'scenarios' | 'pdf' | 'student';

interface NavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  quizScore: number | null;
  scenariosCompletedCount: number;
  totalScenarios: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  quizScore,
  scenariosCompletedCount,
  totalScenarios,
}) => {
  const tabs = [
    {
      id: 'cards' as NavTab,
      label: '學習字卡',
      icon: BookOpen,
      desc: '重點分類與翻牌記憶',
      badge: '20組核心重點',
    },
    {
      id: 'quiz' as NavTab,
      label: '模擬測驗',
      icon: CheckSquare,
      desc: '章節評量與答題音效',
      badge: quizScore !== null ? `${quizScore}分` : '即測即評',
      badgeColor: quizScore !== null ? (quizScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') : undefined,
    },
    {
      id: 'scenarios' as NavTab,
      label: '情境分析',
      icon: Stethoscope,
      desc: '疫調實戰與診斷決策',
      badge: `${scenariosCompletedCount}/${totalScenarios}案`,
    },
    {
      id: 'pdf' as NavTab,
      label: '學習報告 (PDF輸出)',
      icon: FileDown,
      desc: '成績證明與錯題總覽',
      badge: '可匯出/列印',
    },
    {
      id: 'student' as NavTab,
      label: '學籍資訊',
      icon: UserCheck,
      desc: '學號姓名與進度管理',
    },
  ];

  return (
    <nav className="bg-white/95 border-b border-slate-200 backdrop-blur sticky top-[61px] z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  onChangeTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      tab.badgeColor || (isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200')
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
