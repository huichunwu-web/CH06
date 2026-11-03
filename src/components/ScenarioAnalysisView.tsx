import React, { useState } from 'react';
import { 
  Stethoscope, AlertTriangle, CheckCircle2, XCircle, 
  ChevronRight, ArrowLeft, ShieldCheck, Sparkles, FileSearch, Lightbulb,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScenarioSubmission } from '../types';
import { SCENARIO_CASES } from '../data/scenarios';
import { playCorrectSound, playIncorrectSound, playFanfare, playClickSound } from '../utils/audio';

interface ScenarioAnalysisViewProps {
  soundEnabled: boolean;
  onScenarioCompleted: (submission: ScenarioSubmission) => void;
  completedCaseIds: Set<string>;
}

export const ScenarioAnalysisView: React.FC<ScenarioAnalysisViewProps> = ({
  soundEnabled,
  onScenarioCompleted,
  completedCaseIds,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [answersByCase, setAnswersByCase] = useState<Record<string, Record<string, number>>>({});
  const [, setCaseSolvedModal] = useState<string | null>(null);

  const activeCase = SCENARIO_CASES.find((c) => c.id === selectedCaseId);

  const handleSelectCase = (caseId: string) => {
    playClickSound();
    setSelectedCaseId(caseId);
  };

  const handleAnswerQuestion = (caseId: string, qId: string, optionIdx: number, correctIdx: number) => {
    const currentCaseAnswers = answersByCase[caseId] || {};
    if (currentCaseAnswers[qId] !== undefined) return;

    const isCorrect = optionIdx === correctIdx;
    const updated = { ...currentCaseAnswers, [qId]: optionIdx };
    setAnswersByCase((prev) => ({ ...prev, [caseId]: updated }));

    // Sound effect
    if (soundEnabled) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }

    // Check if all questions in this case are answered
    const theCase = SCENARIO_CASES.find((c) => c.id === caseId);
    if (theCase && Object.keys(updated).length === theCase.questions.length) {
      let correctCount = 0;
      theCase.questions.forEach((q) => {
        if (updated[q.id] === q.correctAnswerIndex) correctCount++;
      });

      onScenarioCompleted({
        caseId,
        score: Math.round((correctCount / theCase.questions.length) * 100),
        totalQuestions: theCase.questions.length,
        completedAt: new Date().toLocaleDateString('zh-TW'),
      });

      if (soundEnabled) playFanfare();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setCaseSolvedModal(caseId);
    }
  };

  // If inside a case investigation
  if (activeCase) {
    const currentCaseAnswers = answersByCase[activeCase.id] || {};
    const answeredCount = Object.keys(currentCaseAnswers).length;
    const isCompleted = answeredCount === activeCase.questions.length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Back */}
        <button
          onClick={() => {
            playClickSound();
            setSelectedCaseId(null);
          }}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-emerald-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回情境案件清單</span>
        </button>

        {/* Case Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-mono font-medium">
              {activeCase.badge}
            </span>
            <div className="text-xs text-slate-500">
              進度：<strong className="text-emerald-700">{answeredCount}</strong> / {activeCase.questions.length} 診斷題
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{activeCase.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{activeCase.subtitle}</p>
          </div>

          {/* Background Story */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <FileSearch className="w-4 h-4 text-emerald-600" />
              <span>【案件背景通報】</span>
            </div>
            <p>{activeCase.backgroundStory}</p>
          </div>

          {/* Clues & Symptoms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Symptoms */}
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 space-y-1.5">
              <div className="font-semibold text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>患者臨床症狀：</span>
              </div>
              <ul className="text-slate-700 space-y-1 pl-1">
                {activeCase.patientSymptoms.map((sym, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-1 text-[11px] text-slate-500">
                潛伏期：<span className="text-slate-800 font-medium">{activeCase.incubationTime}</span>
              </div>
            </div>

            {/* Suspected Foods */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
              <div className="font-semibold text-amber-800 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>高度嫌疑食品：</span>
              </div>
              <ul className="text-slate-700 space-y-1 pl-1">
                {activeCase.foodSuspects.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Investigation Clues */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
              <div className="font-semibold text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>現場疫調關鍵線索：</span>
              </div>
              <ul className="text-slate-700 space-y-1 pl-1">
                {activeCase.investigationClues.map((clue, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step-by-step Diagnostic Questions */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <span>流行病學疫調與診斷抉擇（點選即刻音效判定）：</span>
          </h3>

          <div className="space-y-4">
            {activeCase.questions.map((q, qIdx) => {
              const selectedOpt = currentCaseAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                      {q.prompt}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      const isThisCorrect = optIdx === q.correctAnswerIndex;

                      let style = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40';

                      if (isAnswered) {
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium ring-1 ring-emerald-300';
                        } else if (isThisSelected && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                        } else {
                          style = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleAnswerQuestion(activeCase.id, q.id, optIdx, q.correctAnswerIndex)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-mono flex-shrink-0 text-slate-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isAnswered && (
                            <div className="flex-shrink-0">
                              {isThisCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isThisSelected ? (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate feedback & explanation */}
                  {isAnswered && (
                    <div className="pl-8 pt-1">
                      <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>診斷正確！</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>判斷有誤！正確解析如下：</span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Case Concluded Banner */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <Award className="w-5 h-5 text-amber-600" />
              <span>【案件結案總結報告】</span>
            </div>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed">
              {activeCase.conclusionSummary}
            </p>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-start gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-800">食安黃金金句：</span>
                <span className="text-slate-800 ml-1">{activeCase.goldenRule}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedCaseId(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>探索其他真實案例</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
          <Stethoscope className="w-4 h-4" />
          <span>流行病學疫調 · 臨床情境分析</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          情境案例實戰診斷室
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          依據教材收錄之台灣國安級食安事件（寶林茶室）、日本流水素麵892人案、炒飯冷卻老化、A肝員工抗體判讀等7大真實與實務案例。
          化身食安專家，親自參與疫調、辨識病原並給予正確預防指引！
        </p>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SCENARIO_CASES.map((c, idx) => {
          const isDone = completedCaseIds.has(c.id);
          const caseAnswers = answersByCase[c.id] || {};
          const currentCount = Object.keys(caseAnswers).length;

          return (
            <div
              key={c.id}
              onClick={() => handleSelectCase(c.id)}
              className={`cursor-pointer rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                isDone
                  ? 'bg-white border-emerald-400 hover:border-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono">
                    {c.badge}
                  </span>
                  {isDone ? (
                    <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 結案完成
                    </span>
                  ) : currentCount > 0 ? (
                    <span className="text-amber-800 text-xs font-semibold font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      進行中 ({currentCount}/{c.questions.length})
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">
                      {c.questions.length} 題診斷
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {idx + 1}. {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{c.subtitle}</p>
                </div>

                {/* Key clues preview */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="text-[11px] font-semibold text-rose-800">主要症狀：</div>
                  <p className="line-clamp-2 text-slate-600 text-[11px]">
                    {c.patientSymptoms.join('、')}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-700">
                <span>{isDone ? '查看調查解析與結案' : '啟動案件調查'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
