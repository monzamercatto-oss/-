import { GoogleGenAI } from "@google/genai";
import { CoC7Actor } from "../types";
import { TEMPLATE_INVESTIGATOR, TEMPLATE_NPC, TEMPLATE_CREATURE } from "../constants";

export type ActorType = 'character' | 'npc' | 'creature';

export const extractCharacterData = async (
  files: { data: string; mimeType: string }[],
  userExampleJson: string,
  actorType: ActorType
): Promise<CoC7Actor> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let targetTemplate: CoC7Actor;
  let typeSpecificInstructions = "";

  switch (actorType) {
    case 'npc':
      targetTemplate = TEMPLATE_NPC;
      typeSpecificInstructions = `
        - This is an NPC (Non-Player Character) sheet.
        - Extract simple attributes.
        - Look for "Occupation" or role.
        - Ensure "actorLink" in prototypeToken is false.
        - **BIOGRAPHY/NOTES**:
          - Extract any flavor text, background, or description found on the sheet.
          - If none exists, GENERATE a mysterious, atmospheric description of their appearance, personality, and role in the story (2-3 paragraphs).
          - **IMPORTANT**: Format 'system.biography' as a valid HTML string (use <p>, <b>, <i> tags).
      `;
      break;
    case 'creature':
      targetTemplate = TEMPLATE_CREATURE;
      typeSpecificInstructions = `
        - This is a MONSTER / CREATURE stat block.
        - "Education" (EDU), "Appearance" (APP) might be missing or N/A (set to 0).
        - Look for "Armor" values.
        - Look for "Attacks per round".
        - Skills might be listed as attacks (e.g., "Fighting 50%", "Dodge 30%"). Add these to 'items'.
        - Look for "Sanity Loss" (e.g., 1/1d6) if available.
        - **BIOGRAPHY/NOTES**:
          - Extract description text.
          - If none exists, GENERATE a terrifying, Lovecraftian description of how this creature looks, sounds, and smells. Make it visceral and scary (3-4 paragraphs).
          - **IMPORTANT**: Format 'system.biography' as a valid HTML string (use <p>, <b>, <i> tags).
      `;
      break;
    default:
      targetTemplate = TEMPLATE_INVESTIGATOR;
      typeSpecificInstructions = `
        - This is a standard INVESTIGATOR sheet.
        - Extract Age, Residence, Birthplace if visible.
        - Ensure "actorLink" is true.
        - **BIOGRAPHY/NOTES**:
          - Extract Backstory/Personal Description text.
          - If empty, summarize their occupation and background briefly.
          - Format 'system.biography' as HTML string (<p> tags).
      `;
      break;
  }

  const prompt = `
    ROLE: You are an advanced OCR and Data Mapping AI for "Call of Cthulhu 7th Edition".
    
    CONTEXT: You are extracting data for a **${actorType.toUpperCase()}**.

    INPUT: One or more images of a stat block or character sheet.
    OUTPUT: A single valid JSON object strictly matching the provided template.

    INSTRUCTIONS:
    1. READ: Extract all text visible on the sheet.
    2. OVERWRITE: Map values into the JSON template below. Replace placeholders (0, null, "NAME") with actual values.
    3. LANGUAGE & TRANSLATION (CRITICAL):
       - The output JSON MUST use **RUSSIAN** language for all text fields.
       - **SKILLS ("items" array):** The 'name' of every skill MUST be in Russian.
         - Example: "Spot Hidden" -> "Внимательность"
         - Example: "Fighting (Brawl)" -> "Драка (Ближний бой)"
         - Example: "Firearms (Handgun)" -> "Огнестрельное (Пистолет)"
         - Example: "Dodge" -> "Уклонение"
       - **OCCUPATION:** Translate occupation to Russian (e.g., "Detective" -> "Детектив").
       - **BIOGRAPHY:** All generated or extracted notes must be in Russian.
    4. BIOGRAPHY (NOTES):
       - Fill the 'system.biography' field.
       - IT MUST BE AN HTML STRING. Wrap paragraphs in <p></p>.
    5. SKILLS/ITEMS:
       - Iterate through EVERY skill/attack/weapon found.
       - Create a JSON object in the 'items' array for each.
       - Generate a random 16-char '_id'.
       - **VALUE EXTRACTION RULE (CRITICAL)**:
         - Call of Cthulhu 7th Ed character sheets often display three numbers for each skill: 
           1. Base Value (Regular success)
           2. Half Value (Hard success)
           3. Fifth Value (Extreme success)
         - **YOU MUST EXTRACT THE BASE VALUE**.
         - The Base Value is almost always the **LARGEST NUMBER** of the three.
         - Examples:
           - "50 25 10" -> Value is 50.
           - "40 (20/8)" -> Value is 40.
           - A large bold "60" with smaller "30" and "12" next to it -> Value is 60.
         - Map this largest value to 'system.value'.
       - For CREATURES: Treat attacks (e.g., "Claw 40%") as skills.

    TYPE SPECIFIC RULES:
    ${typeSpecificInstructions}

    COMMON MAPPING RULES:
    - Characteristics (STR, CON, SIZ, DEX, APP, INT, POW, EDU): Use full values.
    - Attributes (HP, MP, SAN, LUCK, BUILD, DB, MOV): Use current/max values found.
    - If a field is not found on the sheet, leave it as the default in the template (0 or null).

    Target JSON Template (FILL THIS):
    ${JSON.stringify(targetTemplate)}

    Reference Item Structure (for creating skills):
    ${userExampleJson}
  `;

  try {
    const parts = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    }));

    parts.push({ text: prompt } as any);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    
    return JSON.parse(cleanText) as CoC7Actor;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};

export const generateTokenImage = async (description: string, actorType: ActorType): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  let stylePrompt = "";
  if (actorType === 'creature') {
    // Strictly forcing photo-realism and removing artistic terms
    stylePrompt = "Style: Real life photograph, flash photography in pitch darkness. The image must look like a real, damaged, blurry black and white photo taken in the 1920s. Harsh flashlight beam illuminating the creature. Heavy film grain, motion blur, poor focus, realistic textures, slime, dirt. It should look like physical evidence found at a crime scene. NOT a digital painting, NOT a drawing, NOT an illustration, NOT CGI. Scary found footage.";
  } else {
    stylePrompt = "Style: Authentic 1920s vintage photograph, sepia tone, heavy film grain, scratches, cracks, worn texture, vignette. Portrait.";
  }

  // Clean description of HTML tags for the image prompt
  const cleanDescription = description.replace(/<[^>]*>?/gm, '');

  const prompt = `
    Generate a portrait/image of a Call of Cthulhu ${actorType} matching this description: "${cleanDescription}".
    ${stylePrompt}
    The subject should be centered facing forward.
    No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw error;
  }
};