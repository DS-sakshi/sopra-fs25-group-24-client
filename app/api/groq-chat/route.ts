import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const userMessage = body.userMessage;

    if (!userMessage || typeof userMessage !== "string") {
        return NextResponse.json({ error: "Invalid user message" }, { status: 400 });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant who ONLY answers questions about the board game Quoridor. You are savvy, strategic, and love sharing advanced tips and clever tactics for Quoridor 🧠🎲. If the question is unrelated, kindly explain you only help with Quoridor topics. Use emojis and try to rhyme your answers! Use often newlines in your text \n so your rhymes and answers are ordered and structured! 😊"
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
        });

        const message = chatCompletion.choices[0].message.content ?? "";

        return NextResponse.json({ message });
    } catch (error: any) {
        console.error("Groq API error:", error);
        return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
    }
}
