import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const suggestCategory = async (
  description: string, 
  categories: Category[]
): Promise<string | null> => {
  if (!description || !apiKey) return null;

  try {
    const categoryNames = categories.map(c => c.name).join(', ');
    
    const prompt = `
      Você é um assistente financeiro inteligente. 
      Analise a descrição da transação: "${description}".
      Selecione a categoria que melhor corresponde a partir desta lista: [${categoryNames}].
      Se nenhuma corresponder perfeitamente, escolha a mais próxima.
      Retorne APENAS o nome exato da categoria da lista.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryName: {
              type: Type.STRING,
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.categoryName || null;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};