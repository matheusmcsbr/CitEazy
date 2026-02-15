import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedQuizData, Question } from "../types";
import { RAW_CIVICS_QUESTIONS } from "./rawQuestions";

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

export const generateQuizQuestions = async (count: number = 128): Promise<GeneratedQuizData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found. Returning fallback data.");
    return { questions: FALLBACK_QUESTIONS };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
      SOURCE MATERIAL:
      ${RAW_CIVICS_QUESTIONS}

      TASK:
      Generate a comprehensive JSON array of exactly ${count} multiple-choice US Civics questions suitable for the naturalization interview.

      STRICT REQUIREMENTS:
      1. COVERAGE: You MUST generate questions that cover all sections (A through G) in the source material.
      2. REAL-TIME ACCURACY: Use the googleSearch tool to find the current 2025 names for:
         - Speaker of the House of Representatives
         - Chief Justice of the United States
         - President and Vice President
         - Governor of a sample state (or phrase generically "Who is the Governor of your state?" with a note).
      3. CLARITY: Simple English suitable for ESL learners, matching the actual test difficulty.
      4. FORMATTING: 
         - 4 options per question.
         - Only one correct answer.
         - Categories must match the source structure.
      5. EXPLANATION: Provide a helpful factoid or context for the answer.

      OUTPUT:
      Return ONLY a JSON array of objects.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation", "category"],
          },
        },
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    if (response.text) {
      try {
        const data = JSON.parse(response.text) as Question[];
        const questions = data.map((q, idx) => ({ ...q, id: idx + 1 }));
        return { questions, groundingMetadata };
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON", parseError);
        return { questions: FALLBACK_QUESTIONS };
      }
    }
    
    return { questions: FALLBACK_QUESTIONS };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { questions: FALLBACK_QUESTIONS };
  }
};