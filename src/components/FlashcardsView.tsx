import React, { useState, useMemo } from 'react';
import { 
  RotateCw, CheckCircle, Volume2, Search, Sparkles, Filter, 
  Layers, Maximize2, Minimize2, ChevronLeft, ChevronRight, BookmarkCheck,
  Check, HelpCircle
} from 'lucide-react';
import { Flashcard, Category } from '../types';
import { FLASHCARDS_DATA } from '../data/flashcards';
import { playFlipSound, playClickSound, speakText } from '../utils/audio';

interface FlashcardsViewProps {
  masteredIds: Set<string>;
  onToggleMastered: (id: string) => void;
  soundEnabled: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  masteredIds,
  onToggleMastered,
  soundEnabled,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);
  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: '全部重點 (20)' },
    { id: 'cases_and_toxins', label: '邦克列酸與定義' },
    { id: 'bacterial_types', label: '中毒型態與孢子' },
    { id: 'microbiology', label: '常見病原菌與病毒' },
    { id: 'parasites_natural', label: '寄生蟲與天然毒素' },
    { id: 'hygiene_prevention', label: 'A肝體檢與真菌' },
  ];

  const filteredCards = useMemo(() => {
    return FLASHCARDS_DATA.filter((card) => {
      const matchCategory = activeCategory === 'all' || card.category === activeCategory;
      const matchMastered = onlyUnmastered ? !masteredIds.has(card.id) : true;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        card.title.toLowerCase().includes(query) ||
        card.subtitle.toLowerCase().includes(query) ||
        card.frontTags.some((t) => t.toLowerCase().includes(query)) ||
        card.frontKeyPoints.some((p) => p.toLowerCase().includes(query)) ||
        card.backDetail.definition.toLowerCase().includes(query);
      return matchCategory && matchMastered && matchQuery;
    });
  }, [activeCategory, searchQuery, onlyUnmastered, masteredIds]);

  const toggleFlip = (id: string) => {
    if (soundEnabled) playFlipSound();
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSpeech = (e: React.MouseEvent, card: Flashcard) => {
    e.stopPropagation();
    const textToSpeak = `${card.title}。${card.frontKeyPoints.join('。')}`;
    speakText(textToSpeak);
  };

  const currentFocusCard = filteredCards[focusIndex] || filteredCards[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>常見食物中毒教材 · 精華字卡系統</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              學習字卡（翻面自評）
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              點擊卡片即可 3D 翻面查看機轉、診斷標準與防範金句。搭配語音朗讀與熟記追蹤。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                setFocusMode(!focusMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-2xs ${
                focusMode
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{focusMode ? '切換網格模式' : '單張專注模式'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setOnlyUnmastered(!onlyUnmastered);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors shadow-2xs ${
                onlyUnmastered
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{onlyUnmastered ? '只看未熟記' : '顯示全部'}</span>
            </button>
          </div>
        </div>

        {/* Category & Search Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  setActiveCategory(cat.id);
                  setFocusIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  activeCategory === cat.id
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋關鍵字 (如: 邦克列酸、仙人掌、李斯特、A肝、旋毛蟲)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocusIndex(0);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Focus Mode (Single Card) */}
      {focusMode && filteredCards.length > 0 && currentFocusCard && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              專注卡片：<strong className="text-emerald-700">{focusIndex + 1}</strong> / {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setFocusIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={focusIndex === 0}
                className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setFocusIndex((prev) => Math.min(filteredCards.length - 1, prev + 1));
                }}
                disabled={focusIndex === filteredCards.length - 1}
                className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 disabled:opacity-30 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            onClick={() => toggleFlip(currentFocusCard.id)}
            className="cursor-pointer min-h-[360px] bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative transition-all duration-300 hover:border-emerald-400 hover:shadow-lg"
          >
            {/* Top Bar on Focus Card */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-1.5">
                {currentFocusCard.frontTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleSpeech(e, currentFocusCard)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-700 transition-colors"
                  title="語音朗讀重點"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    onToggleMastered(currentFocusCard.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    masteredIds.has(currentFocusCard.id)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{masteredIds.has(currentFocusCard.id) ? '已熟記' : '標記熟記'}</span>
                </button>
              </div>
            </div>

            {/* Front vs Back Content */}
            {!flippedCardIds.has(currentFocusCard.id) ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{currentFocusCard.title}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-0.5">{currentFocusCard.subtitle}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                  <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase">
                    ★ 核心學習指標：
                  </span>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {currentFocusCard.frontKeyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentFocusCard.funFact && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>{currentFocusCard.funFact}</span>
                  </div>
                )}

                <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>點擊卡片查看「病原機轉與預防詳解」</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-base font-bold text-emerald-700">教材標準機轉與防範詳解</h4>
                  <span className="text-xs text-slate-500 font-mono">(背面詳解)</span>
                </div>

                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {currentFocusCard.backDetail.definition}
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-800">關鍵生化/生長條件：</div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {currentFocusCard.backDetail.keyConditions.map((cond, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium">症狀或潛伏期：</div>
                    <div className="text-slate-800 mt-0.5">{currentFocusCard.backDetail.symptomsOrIncubation}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-emerald-700 font-medium">防範措施：</div>
                    <div className="text-slate-800 mt-0.5">{currentFocusCard.backDetail.prevention}</div>
                  </div>
                </div>

                {currentFocusCard.backDetail.relatedCaseOrRemark && (
                  <div className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 p-2 rounded-lg">
                    {currentFocusCard.backDetail.relatedCaseOrRemark}
                  </div>
                )}

                <div className="pt-2 text-center text-xs text-slate-500">
                  點擊再次翻回正面
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Mode (All Cards) */}
      {!focusMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const isFlipped = flippedCardIds.has(card.id);
            const isMastered = masteredIds.has(card.id);

            return (
              <div
                key={card.id}
                onClick={() => toggleFlip(card.id)}
                className={`cursor-pointer rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between min-h-[340px] relative ${
                  isFlipped
                    ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Card Top Actions */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                      {card.frontTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleSpeech(e, card)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                        title="朗讀"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          onToggleMastered(card.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          isMastered ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title={isMastered ? '已熟記' : '標記為已熟記'}
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Front vs Back */}
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">{card.subtitle}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-semibold text-emerald-800">核心記憶點：</span>
                        <ul className="text-xs text-slate-700 space-y-1.5">
                          {card.frontKeyPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {card.funFact && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                          <span>{card.funFact}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs text-slate-700 animate-fadeIn">
                      <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span className="font-bold text-emerald-700">{card.title} · 詳解</span>
                        <span className="text-[10px] text-slate-400 font-mono">背面</span>
                      </div>
                      <p className="leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {card.backDetail.definition}
                      </p>
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-900">關鍵生長與生化條件：</span>
                        {card.backDetail.keyConditions.map((c, i) => (
                          <div key={i} className="text-slate-700 pl-2 border-l border-emerald-400 text-[11px]">
                            {c}
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                        <span className="text-emerald-800 font-semibold">防範措施：</span>
                        <p className="text-slate-700 mt-0.5">{card.backDetail.prevention}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Bar */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    <span>{isFlipped ? '點擊翻回正面' : '點擊翻轉看詳解'}</span>
                  </span>
                  {isMastered ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> 已熟記
                    </span>
                  ) : (
                    <span className="text-slate-400">待加強複習</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-slate-800 font-bold text-base">查無符合條件的字卡</h4>
          <p className="text-slate-500 text-xs mt-1">請嘗試清除搜尋關鍵字或切換分類標籤。</p>
        </div>
      )}
    </div>
  );
};
