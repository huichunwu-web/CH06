import React, { useState } from 'react';
import { UserCheck, CheckCircle2, RotateCcw, Award, BookOpen, Stethoscope, Save } from 'lucide-react';
import { StudentInfo, QuizSubmission } from '../types';
import { playClickSound } from '../utils/audio';

interface StudentProfileViewProps {
  student: StudentInfo;
  onUpdateStudent: (info: StudentInfo) => void;
  masteredCount: number;
  totalCards: number;
  completedScenarioCount: number;
  totalScenarios: number;
  latestSubmission: QuizSubmission | null;
  onResetProgress: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onUpdateStudent,
  masteredCount,
  totalCards,
  completedScenarioCount,
  totalScenarios,
  latestSubmission,
  onResetProgress,
}) => {
  const [studentId, setStudentId] = useState(student.studentId || '');
  const [name, setName] = useState(student.name || '');
  const [department, setDepartment] = useState(student.department || '餐飲廚藝管理系');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    onUpdateStudent({
      studentId: studentId.trim(),
      name: name.trim(),
      department: department.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
          <UserCheck className="w-4 h-4" />
          <span>學籍登記 · 學習履歷管理</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          學生個人檔案設定
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          請務必填寫真實學號與姓名，系統將自動同步套印於「模擬測驗紀錄」與「PDF正式評量證書」。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            編輯個人學籍資訊
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                學生學號 (Student ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：B11234056"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                學生姓名 (Full Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例如：林書宇"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                系所 / 班級 / 單位 (Department / Class)
              </label>
              <input
                type="text"
                placeholder="例如：餐飲廚藝管理系二年甲班"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                <span>儲存學籍資料</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 資料已更新並儲存！
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Learning Statistics Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            個人學習履歷概況
          </h3>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>字卡掌握度</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-700">{masteredCount}</span>
                <span className="text-slate-500">/ {totalCards} 組重點</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(masteredCount / totalCards) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>最新模擬測驗</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-700">
                  {latestSubmission ? `${latestSubmission.score}分` : '尚未測驗'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {latestSubmission ? `完成時間：${latestSubmission.timestamp}` : '點擊「模擬測驗」開始評量'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>情境疫調通關</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-indigo-700">{completedScenarioCount}</span>
                <span className="text-slate-500">/ {totalScenarios} 案結案</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (confirm('確定要重置目前的字卡熟記進度與測驗紀錄嗎？此動作無法復原。')) {
                    onResetProgress();
                  }
                }}
                className="w-full text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置個人學習記錄</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
