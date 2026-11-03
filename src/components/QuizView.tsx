import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Award, Clock, 
  AlertCircle, FileText, Check, ChevronRight, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizSubmission, StudentInfo } from '../types';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { playCorrectSound, playIncorrectSound, playFanfare, playClickSound } from '../utils/audio';

interface QuizViewProps {
  student: StudentInfo;
  soundEnabled: boolean;
  onQuizCompleted: (submission: QuizSubmission) => void;
  onNavigateToPdf: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  student,
  soundEnabled,
  onQuizCompleted,
  onNavigateToPdf,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [, setConfirmedIndex] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isFinished]);

  const restartQuiz = () => {
    playClickSound();
    setQuestions(QUIZ_QUESTIONS);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setConfirmedIndex(null);
    setIsFinished(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  const currentQ = questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return;

    const isCorrect = optionIndex === currentQ.correctAnswerIndex;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setConfirmedIndex(currentIndex);

    // Audio Feedback
    if (soundEnabled) {
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);

    let correctCount = 0;
    const detailedAnswers = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const submission: QuizSubmission = {
      studentId: student.studentId || '未填寫學號',
      studentName: student.name || '未填寫姓名',
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      score,
      totalQuestions: questions.length,
      percentage: score,
      answers: detailedAnswers,
      timeSpentSeconds: elapsedSeconds,
    };

    onQuizCompleted(submission);

    // Fanfare and confetti if high score
    if (soundEnabled && score >= 70) {
      playFanfare();
    }
    if (score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const calculateScore = () => {
    let count = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) count++;
    });
    return Math.round((count / questions.length) * 100);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Result View
  if (isFinished) {
    const finalScore = calculateScore();
    const correctCount = questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswerIndex).length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Score Card Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 border border-emerald-100 mb-3 shadow-inner">
            <Award className={`w-12 h-12 ${finalScore >= 80 ? 'text-amber-500' : finalScore >= 60 ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">模擬測驗評量完成！</h2>
          <p className="text-slate-600 text-sm mt-1">
            考生：<strong className="text-emerald-700">{student.name || '未具名'}</strong>（學號：{student.studentId || '未登記'}）
          </p>

          {/* Big Score Display */}
          <div className="my-6">
            <span className={`text-6xl sm:text-7xl font-black tracking-tight ${
              finalScore >= 80 ? 'text-emerald-600' : finalScore >= 60 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {finalScore}
            </span>
            <span className="text-2xl text-slate-400 font-bold ml-1">/ 100 分</span>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-700">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              答對題數：<strong className="text-emerald-700">{correctCount}</strong> / {questions.length} 題
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>測驗歷時：<strong className="text-slate-800">{formatTime(elapsedSeconds)}</strong></span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              考核結果：
              <strong className={finalScore >= 60 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                {finalScore >= 85 ? '優異（通過合格認證）' : finalScore >= 60 ? '及格（通過標準）' : '未達及格標準（需加強複習）'}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                onNavigateToPdf();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4" />
              <span>產生學習成績 PDF 報告</span>
            </button>

            <button
              onClick={restartQuiz}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新進行測驗</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>測驗題目逐題回顧與解說</span>
              <span className="text-xs font-normal text-slate-500 font-mono">
                (已答 {questions.length} 題)
              </span>
            </h3>
            <span className="text-xs text-slate-500">綠色代表正確答案，紅色代表您的錯誤選擇</span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 bg-white space-y-3 transition-colors shadow-sm ${
                    isCorrect ? 'border-slate-200' : 'border-rose-300 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono mr-2 border border-slate-200">
                          {q.category}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base inline">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 答對
                        </span>
                      ) : (
                        <span className="text-rose-700 text-xs font-bold flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <XCircle className="w-4 h-4 text-rose-600" /> 答錯
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pl-8">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctAnswerIndex;
                      const isOptionSelected = oIdx === userAns;

                      let optClass = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-300';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${optClass}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-mono flex-shrink-0 text-slate-600">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-grow">{opt}</span>
                          {isOptionCorrect && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="pl-8 pt-1">
                    <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-semibold text-emerald-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>教材依據與詳解（{q.sourceChapter}）：</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-sm font-semibold">{formatTime(elapsedSeconds)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-700 font-medium">
            題數：<strong className="text-emerald-700">{currentIndex + 1}</strong> / {questions.length} 題
          </div>
        </div>

        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          全套 20 題標準檢定
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + (hasAnsweredCurrent ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-md space-y-5 relative">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
            {currentQ.category}
          </span>
          <span className="font-mono">{currentQ.sourceChapter}</span>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentIndex + 1}. {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIndex] === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;
            const showFeedback = hasAnsweredCurrent;

            let buttonStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40';

            if (showFeedback) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-400/40 font-medium';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-400/40';
              } else {
                buttonStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnsweredCurrent}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between gap-3 shadow-xs ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-mono text-xs font-semibold flex-shrink-0 text-slate-700 shadow-2xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {showFeedback && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button when answered */}
        {hasAnsweredCurrent && (
          <div className="pt-2 space-y-4 animate-fadeIn">
            <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1 ${
              selectedAnswers[currentIndex] === currentQ.correctAnswerIndex
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {selectedAnswers[currentIndex] === currentQ.correctAnswerIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>答對了！音效提醒正確</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>答錯了！正確答案為：{String.fromCharCode(65 + currentQ.correctAnswerIndex)}</span>
                  </>
                )}
              </div>
              <p className="text-slate-700 leading-relaxed text-xs pt-1">{currentQ.explanation}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
              >
                <span>{currentIndex < questions.length - 1 ? '下一題' : '完成測驗並查看總結'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
