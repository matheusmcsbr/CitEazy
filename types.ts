export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
}

export interface QuizResult {
  id: string;
  date: string; // ISO string
  score: number; // 0-100
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  questions: Question[]; // Store questions to review later
  userAnswers: number[]; // Index of answers chosen
}

export interface GeneratedQuizData {
  questions: Question[];
  groundingMetadata?: any;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  HISTORY = 'HISTORY',
}

export interface QuizSettings {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
