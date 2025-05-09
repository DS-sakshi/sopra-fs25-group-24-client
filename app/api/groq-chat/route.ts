import Groq from "groq-sdk";

// Sanity check
if (!process.env.GROQ_API_KEY) {
    throw new Error("🚨 GROQ_API_KEY is not set. Please define it in your environment (.env.local)");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { userMessage } = await req.json();

        if (!userMessage || typeof userMessage !== "string") {
            return new Response(JSON.stringify({ error: "Invalid user message" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const chatCompletion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Using the specified model
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant who ONLY answers questions about the board game Quoridor. You are savvy, strategic, and love sharing advanced tips and clever tactics for Quoridor 🧠🎲. If the question is unrelated, kindly explain you only help with Quoridor topics. Use emojis to make the conversation fun and engaging! 😊"
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                temperature: 0.7, // Adding temperature for varied responses
                max_tokens: 800, // Setting reasonable token limit
            });

            // Process the response
            if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
                throw new Error("Invalid response structure from API");
            }

            const message = chatCompletion.choices[0].message.content ?? "";

            return new Response(JSON.stringify({ message }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            console.error("Groq API error:", error);

            // Detailed error logging
            if (error.response) {
                console.error(`Status: ${error.response.status}, Message: ${error.response.data?.error?.message || "Unknown API error"}`);
            }

            return new Response(JSON.stringify({ error: "Failed to process message with Groq" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (parseError: any) {
        console.error("Request parsing error:", parseError);
        return new Response(JSON.stringify({ error: "Failed to parse request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}