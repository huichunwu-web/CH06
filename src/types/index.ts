export interface StudentInfo {
  studentId: string;
  name: string;
  department?: string;
  classGroup?: string;
}

export type Category = 
  | 'all'
  | 'microbiology' // 病原菌與病毒
  | 'bacterial_types' // 感染型/毒素型/中間型
  | 'cases_and_toxins' // 邦克列酸與經典案件
  | 'parasites_natural' // 寄生蟲與天然化學毒素
  | 'hygiene_prevention'; // 餐飲從業防疫與衛生

export interface Flashcard {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  frontTags: string[];
  frontKeyPoints: string[];
  backDetail: {
    definition: string;
    keyConditions: string[];
    symptomsOrIncubation: string;
    prevention: string;
    relatedCaseOrRemark?: string;
  };
  funFact?: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceChapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ScenarioQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ScenarioCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  backgroundStory: string;
  patientSymptoms: string[];
  incubationTime: string;
  foodSuspects: string[];
  investigationClues: string[];
  questions: ScenarioQuestion[];
  conclusionSummary: string;
  goldenRule: string;
}

export interface QuizSubmission {
  studentId: string;
  studentName: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
  timeSpentSeconds: number;
}

export interface ScenarioSubmission {
  caseId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}
