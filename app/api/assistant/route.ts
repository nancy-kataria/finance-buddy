import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // Authenticate user session via Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract messages from user input
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const messageHistory = messages.map((msg) => {
      const role = msg.role === "assistant" ? "model" : "user";
      
      return {
        role: role,
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are an elite, approachable trading assistant designed for beginners. 
          Your core purpose is to teach disciplined trading. 
          NEVER provide direct stock buy or sell recommendations. Instead, break down financial concepts 
          (like risk-to-reward ratios or reading earnings reports) into highly scannable, step-by-step educational points. 
          Keep your formatting professional, concise, and easy to read`,
        temperature: 0.4, // Lower temperature keeps explanations objective and focused
      },
      contents: messageHistory,
    });

    return NextResponse.json({ 
      text: response.text 
    });

  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response from assistant" },
      { status: 500 }
    );
  }
}