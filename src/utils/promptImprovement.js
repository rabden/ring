
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = 'AIzaSyAvsEc_xHr9zswJmAd1bFYoyZlneyXqUP8';

export const improvePrompt = async (originalPrompt, activeModel, modelConfigs, onChunk) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    const modelExample = modelConfigs?.[activeModel]?.example || "a photo of a cat, high quality, detailed";
    
    const config = {
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are an expert AI image prompt engineer. Your task is to enhance the given prompt for high-quality image generation. Preserve the core idea and artistic vision, enrich brief prompts with details, and remove any extraneous noise. Keep the final prompt concise, between 20 to 80 words, and follow these guidelines: ${modelExample}. Output only the improved prompt.`,
        }
      ],
    };

    const model = 'gemini-2.0-flash-lite';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `a dino`,
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: `A majestic Tyrannosaurus Rex in a lush prehistoric jungle, sunlight dappling through giant ferns. Dramatic lighting, ultra-detailed scales, vibrant colors, paleoart, scientific illustration style`,
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: originalPrompt,
          },
        ],
      },
    ];

    let improvedPrompt = "";
    
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        improvedPrompt += chunk.text;
        if (onChunk) onChunk(chunk.text, true);
      }
    }

    // If onChunk wasn't called with streaming data, call it once with the final result
    if (improvedPrompt && (!onChunk || improvedPrompt !== originalPrompt)) {
      if (onChunk) onChunk(improvedPrompt, false);
    }

    return improvedPrompt.trim();
  } catch (error) {
    console.error('Error improving prompt:', error);
    throw error;
  }
}
