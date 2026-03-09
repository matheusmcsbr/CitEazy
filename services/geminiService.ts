import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedQuizData, Question } from "../types";
import { RAW_CIVICS_QUESTIONS } from "./rawQuestions";
import { QUESTION_BANK } from "./questionBank";

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the supreme law of the land?",
    options: ["The Constitution", "The Declaration of Independence", "The Emancipation Proclamation", "The Articles of Confederation"],
    correctAnswerIndex: 0,
    explanation: "The Constitution is the supreme law of the land. It sets up the government and protects basic rights.",
    category: "Principles of American Democracy"
  }
];

// Fisher-Yates shuffle helper for better randomization
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const generateQuizQuestions = async (count: number = 128): Promise<GeneratedQuizData> => {
  // 1. Randomize the order of questions from the bank
  const shuffledQuestions = shuffleArray([...QUESTION_BANK]);
  
  // 2. Select the requested number of questions (ensures no repeats in this set)
  const selectedQuestions = shuffledQuestions.slice(0, count);

  // 3. Randomize the options (answers) for each question
  const finalQuestions = selectedQuestions.map(q => {
    // Map options to objects to track their original index
    const optionsWithIndex = q.options.map((opt, idx) => ({ val: opt, originalIdx: idx }));
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(optionsWithIndex);
    
    // Find where the correct answer moved to
    const newCorrectIndex = shuffledOptions.findIndex(o => o.originalIdx === q.correctAnswerIndex);

    return {
      ...q,
      options: shuffledOptions.map(o => o.val),
      correctAnswerIndex: newCorrectIndex
    };
  });

  return {
    questions: finalQuestions,
    groundingMetadata: null
  };
};