import React, { useState } from 'react';
import { User, Award, Volume2, VolumeX, Edit3, CheckCircle2 } from 'lucide-react';
import { StudentInfo } from '../types';
import { playClickSound } from '../utils/audio';

interface StudentHeaderProps {
  student: StudentInfo;
  onUpdateStudent: (info: StudentInfo) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  masteredCount: number;
  totalCards: number;
  latestScore: number | null;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  student,
  onUpdateStudent,
  soundEnabled,
  onToggleSound,
  masteredCount,
  totalCards,
  latestScore,
}) => {
  const [isEditing, setIsEditing] = useState(!student.studentId || !student.name);
  const [tempId, setTempId] = useState(student.studentId || '');
  const [tempName, setTempName] = useState(student.name || '');
  const [tempDept, setTempDept] = useState(student.department || '餐飲廚藝暨食品科學系');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!tempName.trim() || !tempId.trim()) return;
    onUpdateStudent({
      studentId: tempId.trim(),
      name: tempName.trim(),
      department: tempDept.trim(),
    });
    setIsEditing(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Subject */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white font-black text-xl">
              食
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight">常見食物中毒及預防</h1>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  第6章教材檢定
                </span>
              </div>
              <p className="text-xs text-slate-500">數位學習評量 · 字卡 · 模擬測驗 · 情境分析 · PDF輸出</p>
            </div>
          </div>

          {/* Student Status & Quick Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-sm">
            {/* Student ID & Name Pill */}
            {isEditing ? (
              <form onSubmit={handleSave} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-300">
                <input
                  type="text"
                  placeholder="學號 (如: B112001)"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="bg-white text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-300 w-28 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  required
                />
                <input
                  type="text"
                  placeholder="姓名 (如: 陳冠宇)"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-300 w-24 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  確定
                </button>
              </form>
            ) : (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2.5 text-xs shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {student.name} <span className="text-slate-500 font-normal">({student.studentId})</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{student.department || '食品餐飲學員'}</div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-emerald-700 transition-colors p-1"
                  title="修改學生資訊"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-500">字卡熟記:</span>
              <span className="font-bold text-emerald-700">{masteredCount}/{totalCards}</span>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(masteredCount / totalCards) * 100}%` }}
                />
              </div>
            </div>

            {latestScore !== null && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>測驗成績: {latestScore}分</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => {
                playClickSound();
                onToggleSound();
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={soundEnabled ? '音效已開啟（答題提示音）' : '音效已靜音'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? '音效開' : '靜音'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
