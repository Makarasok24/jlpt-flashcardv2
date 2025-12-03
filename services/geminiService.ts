import { GoogleGenAI, Type } from "@google/genai";
import { VocabCard, GeneratorParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const vocabSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      kanji: { type: Type.STRING, description: "The Japanese word in Kanji (or Kana if no Kanji exists)." },
      kana: { type: Type.STRING, description: "The reading in Hiragana/Katakana." },
      romaji: { type: Type.STRING, description: "The romanized reading." },
      english: { type: Type.STRING, description: "English meaning." },
      exampleSentence: { type: Type.STRING, description: "A simple example sentence using the word in Japanese." },
      exampleTranslation: { type: Type.STRING, description: "Translation of the example sentence." },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Relevant tags like N-level, topic, POS" 
      }
    },
    required: ["kanji", "kana", "romaji", "english"],
  },
};

export const generateVocabulary = async (params: GeneratorParams): Promise<VocabCard[]> => {
  const prompt = `Generate a list of ${params.count} unique Japanese vocabulary words related to the topic: "${params.topic}" suitable for difficulty level: "${params.difficulty}".
  Ensure the examples are natural. Return the data strictly as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabSchema,
        temperature: 0.7,
      }
    });

    const rawData = response.text;
    if (!rawData) {
        throw new Error("No data returned from Gemini.");
    }

    const parsedData = JSON.parse(rawData);

    // Map to VocabCard structure with IDs
    return parsedData.map((item: any) => ({
      id: crypto.randomUUID(),
      kanji: item.kanji,
      kana: item.kana,
      romaji: item.romaji,
      english: item.english,
      exampleSentence: item.exampleSentence,
      exampleTranslation: item.exampleTranslation,
      tags: item.tags || [params.topic],
      mastered: false,
    }));

  } catch (error) {
    console.error("Error generating vocabulary:", error);
    throw error;
  }
};

export const generateVocabularyFromImage = async (imageDataUrl: string): Promise<VocabCard[]> => {
  // Extract MIME type and Base64 data
  const matches = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid image data");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const prompt = `Analyze this image which appears to be a vocabulary list or test. 
  Extract all valid Japanese vocabulary rows into a JSON structure.
  
  For each item found:
  1. "kanji": Use the main written form (often in a Kanji/Katakana column). If the Kanji column is empty or a dash '-', use the Hiragana column.
  2. "kana": The reading (Hiragana).
  3. "english": The English meaning.
  4. "romaji": Convert the reading to romaji.
  5. "exampleSentence": Create a SHORT, simple example sentence using this word.
  6. "exampleTranslation": Translate the example.
  7. "tags": Add "Imported" and infer the N-level if visible (e.g. N4, N5).
  
  Strictly follow the JSON schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: vocabSchema,
        temperature: 0.5, // Lower temperature for more accurate extraction
      }
    });

    const rawData = response.text;
    if (!rawData) throw new Error("No data returned.");

    const parsedData = JSON.parse(rawData);

    return parsedData.map((item: any) => ({
      id: crypto.randomUUID(),
      kanji: item.kanji,
      kana: item.kana,
      romaji: item.romaji,
      english: item.english,
      exampleSentence: item.exampleSentence,
      exampleTranslation: item.exampleTranslation,
      tags: item.tags || ['Imported'],
      mastered: false,
    }));

  } catch (error) {
    console.error("Error extracting vocabulary from image:", error);
    throw error;
  }
};