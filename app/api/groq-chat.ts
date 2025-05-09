import { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { userMessage } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
        return res.status(400).json({ error: "Invalid user message" });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: userMessage }],
            model: "llama-3.3-70b-versatile",
        });

        const message = chatCompletion.choices[0].message.content ?? "";

        res.status(200).json({ message });
    } catch (error: any) {
        console.error("Groq API error:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
}
