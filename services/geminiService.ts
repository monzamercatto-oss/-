
import { GoogleGenAI } from "@google/genai";
import { CoC7Actor } from "../types";
import { TEMPLATE_INVESTIGATOR, TEMPLATE_NPC, TEMPLATE_CREATURE } from "../constants";

export type ActorType = 'character' | 'npc' | 'creature';

/**
 * Извлекает данные персонажа из изображений/PDF листов.
 * Использует gemini-3-flash-preview для высокой производительности задач OCR.
 */
export const extractCharacterData = async (
  files: { data: string; mimeType: string }[],
  userExampleJson: string,
  actorType: ActorType
): Promise<CoC7Actor> => {
  // Always create a new instance right before use to ensure the latest API key is used.
  // Syntax must strictly follow: new GoogleGenAI({ apiKey: process.env.API_KEY })
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // Access the text property directly (it is a property, not a method).
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
