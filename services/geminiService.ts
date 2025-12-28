
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { JAHA_SYSTEM_PROMPT } from "../constants.ts";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: JAHA_SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.9,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await this.chat.sendMessage({ message });
      return response.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Something went wrong. Please try again.");
    }
  }

  async *sendMessageStream(message: string) {
    try {
      const streamResponse = await this.chat.sendMessageStream({ message });
      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error) {
      console.error("Gemini API Stream Error:", error);
      throw new Error("Something went wrong. Please try again.");
    }
  }
}
