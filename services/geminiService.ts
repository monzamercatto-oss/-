

import { GoogleGenAI } from "@google/genai";
import { CoC7Actor } from "../types";
import { TEMPLATE_INVESTIGATOR, TEMPLATE_NPC, TEMPLATE_CREATURE } from "../constants";

export type ActorType = 'character' | 'npc' | 'creature';

/**
 * Extracts character data from character sheet images/PDFs.
 * Uses gemini-3-flash-preview for high performance in data extraction tasks.
 */
export const extractCharacterData = async (
  files: { data: string; mimeType: string }[],
  userExampleJson: string,
  actorType: ActorType
): Promise<CoC7Actor> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API-ключ не найден. Пожалуйста, проверьте настройки доступа.");
  }

  // Create instance right before API call to ensure use of updated key.
  const ai = new GoogleGenAI({ apiKey });

  let targetTemplate: CoC7Actor;
  let typeSpecificInstructions = "";

  switch (actorType) {
    case 'npc':
      targetTemplate = TEMPLATE_NPC;
      typeSpecificInstructions = `
        - Это NPC. Извлеки только основные статы.
        - "actorLink" должен быть false.
        - БИОГРАФИЯ: Сгенерируй атмосферное описание на русском языке.
      `;
      break;
    case 'creature':
      targetTemplate = TEMPLATE_CREATURE;
      typeSpecificInstructions = `
        - Это МОНСТР. Атаки запиши в 'items'.
        - БИОГРАФИЯ: Сгенерируй пугающее лавкрафтовское описание на русском языке.
      `;
      break;
    default:
      targetTemplate = TEMPLATE_INVESTIGATOR;
      typeSpecificInstructions = `
        - Это СЫЩИК. Извлеки все навыки и характеристики.
        - "actorLink" должен быть true.
      `;
      break;
  }

  const prompt = `
    ROLE: OCR/Data Extractor for Call of Cthulhu 7e.
    TASK: Convert the attached images into a valid JSON for Foundry VTT.
    LANGUAGE: Use RUSSIAN for all text fields.
    
    RULES:
    1. Extract all numbers for characteristics.
    2. Biography should be HTML with <p> tags.
    3. Output ONLY raw JSON based on this structure:
    ${JSON.stringify(targetTemplate)}
    
    ${typeSpecificInstructions}
  `;

  try {
    // Fix: Explicitly type parts as any[] to allow both inlineData and text parts.
    const parts: any[] = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    }));
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
    });

    // Directly access .text property from the response.
    const text = response.text;
    if (!text) throw new Error("AI не вернул ответ.");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as CoC7Actor;
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("ЛИМИТ ИСЧЕРПАН: Вы отправили слишком много запросов. Подождите 60 секунд или используйте персональный API ключ в настройках.");
    }
    
    if (error.message?.includes("User location is not supported")) {
      throw new Error("ОШИБКА ДОСТУПА: Сервис недоступен в вашем регионе. Пожалуйста, включите VPN (США/Европа).");
    }
    throw error;
  }
};

/**
 * Generates a character/creature token image.
 * Uses gemini-3-pro-image-preview for high-quality results.
 */
export const generateTokenImage = async (description: string, actorType: ActorType): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API-ключ отсутствует.");
  
  // Create instance right before API call.
  const ai = new GoogleGenAI({ apiKey });

  let stylePrompt = actorType === 'creature' 
    ? "Real life photograph, flash photography, 1920s grainy blurry photo, terrifying monster, found footage."
    : "1920s vintage portrait photograph, sepia, heavy grain, scratches, authentic look.";

  const cleanDescription = description.replace(/<[^>]*>?/gm, '');
  const prompt = `Portrait of a Call of Cthulhu ${actorType}: ${cleanDescription}. ${stylePrompt}`;

  try {
    // Upgraded to gemini-3-pro-image-preview for high quality (supports 1K, 2K, 4K).
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Correctly iterate through parts to find the image part as per Gemini guidelines.
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("Изображение не было сгенерировано.");
  } catch (error: any) {
    console.error("Token Generation Error:", error);
    
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("ЛИМИТ ГЕНЕРАЦИИ: Бесплатные попытки создания образов закончились. Подождите минуту.");
    }

    if (error.message?.includes("User location is not supported")) {
      throw new Error("Генерация образа недоступна в вашем регионе. Используйте VPN.");
    }
    throw error;
  }
};
