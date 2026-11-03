import React, { useRef, useState } from 'react';
import { 
  Printer, Download, Award, User, Calendar, CheckCircle, 
  FileCheck, Shield, BookOpen, AlertCircle, Sparkles, Building, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentInfo, QuizSubmission } from '../types';
import { SCENARIO_CASES } from '../data/scenarios';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { playClickSound } from '../utils/audio';

interface PdfExportViewProps {
  student: StudentInfo;
  latestSubmission: QuizSubmission | null;
  masteredCount: number;
  totalCards: number;
  completedScenarioCount: number;
  totalScenarios: number;
  onEditStudent: () => void;
}

export const PdfExportView: React.FC<PdfExportViewProps> = ({
  student,
  latestSubmission,
  masteredCount,
  totalCards,
  completedScenarioCount,
  totalScenarios,
  onEditStudent,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const currentDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certificateNo = `FSP-${student.studentId || 'STUDENT'}-${Date.now().toString().slice(-6)}`;

  // Handle jsPDF download
  const handleDownloadPdf = async () => {
    playClickSound();
    if (!printAreaRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`常見食物中毒學習評量報告_${student.studentId || '學員'}_${student.name || '姓名'}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
      // Fallback to window.print()
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const quizScore = latestSubmission ? latestSubmission.score : null;
  const passed = quizScore !== null ? quizScore >= 60 : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner and Download Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <FileCheck className="w-4 h-4" />
            <span>數位學習成果報告 · PDF 證書輸出</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            正式研習成績與能力證明
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            登載學生學號、姓名、模擬測驗成績、字卡熟記進度與情境疫調診斷結案紀錄。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>列印 / 預覽 (Print)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>產生 PDF 中...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>下載 PDF 檔案</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Certificate & Transcript Sheet (A4-styled container) */}
      <div
        ref={printAreaRef}
        className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 max-w-4xl mx-auto space-y-8 font-sans print:p-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-double border-emerald-800/80 p-6 sm:p-8 rounded-xl relative space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-200 pb-6">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold tracking-widest text-xs uppercase">
              <Shield className="w-4 h-4" />
              <span>Food Safety & Microbiology Digital Learning Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
              常見食物中毒及預防 · 數位研習評量證明
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              依據衛生福利部食品安全指引及教材第6章規範考核
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-1">
              核發證號：{certificateNo} ｜ 評測日期：{currentDate}
            </div>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 text-xs block">學生學號</span>
              <strong className="text-base text-slate-900 font-mono">
                {student.studentId || '尚未登記'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">學生姓名</span>
              <strong className="text-base text-slate-900 font-bold">
                {student.name || '尚未具名'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">系所/班級</span>
              <span className="text-slate-800 font-medium">
                {student.department || '食品餐飲學程'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">考核結果</span>
              <strong className={`text-base font-bold ${passed ? 'text-emerald-700' : 'text-slate-700'}`}>
                {quizScore !== null ? (quizScore >= 80 ? '★ 優等合格' : quizScore >= 60 ? '通過合格' : '未達標準') : '尚未完成測驗'}
              </strong>
            </div>
          </div>

          {/* Core Achievement Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            {/* Score */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
              <span className="text-xs text-emerald-800 font-semibold block">模擬測驗總分</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {quizScore !== null ? quizScore : '--'}
                <span className="text-sm font-normal text-emerald-600"> 分</span>
              </div>
              <span className="text-[11px] text-emerald-800/80 mt-1 block">
                {latestSubmission ? `答對 ${latestSubmission.answers.filter(a => a.isCorrect).length}/${latestSubmission.totalQuestions} 題` : '未進行'}
              </span>
            </div>

            {/* Flashcards */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
              <span className="text-xs text-amber-800 font-semibold block">字卡熟記進度</span>
              <div className="text-3xl sm:text-4xl font-black text-amber-700 mt-1">
                {Math.round((masteredCount / totalCards) * 100)}%
              </div>
              <span className="text-[11px] text-amber-800/80 mt-1 block">
                已掌握 {masteredCount} / {totalCards} 組重點
              </span>
            </div>

            {/* Scenarios */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4">
              <span className="text-xs text-indigo-800 font-semibold block">情境疫調結案</span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-700 mt-1">
                {completedScenarioCount}
                <span className="text-sm font-normal text-indigo-600"> / {totalScenarios} 案</span>
              </div>
              <span className="text-[11px] text-indigo-800/80 mt-1 block">
                包含寶林案與流水素麵
              </span>
            </div>
          </div>

          {/* Curriculum Competencies (Knowledge Checklist) */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>課程關鍵知識掌握檢定清單：</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">1. 邦克列酸與寶林茶室案</div>
                <p className="text-slate-600 text-[11px]">
                  掌握唐菖蒲伯克氏菌生長與邦克列酸油脂20-50%產毒條件、耐熱性及防範法則。
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">2. 食物中毒三大定義與單人原則</div>
                <p className="text-slate-600 text-[11px]">
                  二人以上、攝取相同食物、相似症狀；致命命案（河豚/肉毒桿菌/農藥）1人即可成案。
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">3. 細菌性三大中毒型態與芽孢</div>
                <p className="text-slate-600 text-[11px]">
                  感染型（發燒/腸炎弧菌/沙門氏） vs 毒素型（無發燒/金黃色葡萄球菌/短潛伏期）。
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">4. 仙人掌桿菌與熱炒老化作業</div>
                <p className="text-slate-600 text-[11px]">
                  常居榜首，熟飯冷卻老化務必在冷藏庫進行，嚴禁放置於廚房工作檯吹風自然放涼。
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">5. 病毒滅活與從業A肝體檢</div>
                <p className="text-slate-600 text-[11px]">
                  70℃以上破壞Spike蛋白，鹼片/肥皂溶脂破膜；IgM陽性即刻停工離場，IgG終身免疫。
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-emerald-800">6. 天然毒素、寄生蟲與真菌防線</div>
                <p className="text-slate-600 text-[11px]">
                  發霉食品整批丟棄；旋毛蟲豬肉中心達65℃；西施舌PSP無解藥；馬鈴薯發芽茄鹼拋棄。
                </p>
              </div>
            </div>
          </div>

          {/* Test Performance Review if available */}
          {latestSubmission && latestSubmission.answers.some(a => !a.isCorrect) && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>需加強複習之錯題檢討：</span>
              </div>
              <ul className="list-disc pl-5 text-slate-700 text-[11px] space-y-0.5">
                {latestSubmission.answers
                  .filter(a => !a.isCorrect)
                  .map(a => {
                    const q = QUIZ_QUESTIONS.find(item => item.id === a.questionId);
                    return (
                      <li key={a.questionId}>
                        <strong className="text-slate-900">{q?.question.slice(0, 36)}...</strong>
                        <span className="text-emerald-700 ml-1">（正確依據：{q?.sourceChapter}）</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Signatures & Official Stamp */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
            <div className="space-y-1 text-center sm:text-left">
              <div>指導教師 / 評核主任簽章：</div>
              <div className="font-serif text-lg font-bold text-slate-800 tracking-wider pt-1">
                張敏宏 教授 / 食安稽核委員
              </div>
              <div className="text-[10px] text-slate-400">認證機構：食品安全與餐飲衛生數位檢定推廣小組</div>
            </div>

            {/* Official Digital Stamp Graphic */}
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-rose-700/80 flex flex-col items-center justify-center text-rose-700 p-1 transform rotate-[-8deg] select-none">
              <span className="text-[9px] font-black tracking-widest uppercase">FOOD SAFETY</span>
              <span className="text-xs font-black my-0.5">檢定合格</span>
              <span className="text-[8px] font-mono">{new Date().getFullYear()} CERTIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
