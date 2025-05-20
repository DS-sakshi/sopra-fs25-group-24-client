import Groq from "groq-sdk";

// Delay API key check until runtime instead of during build
const getGroqClient = () => {
    if (process.env.GROQ_API_KEY) {
        return new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return null;
};

export async function POST(req: Request) {
    try {
        const { userMessage } = await req.json();

        if (!userMessage || typeof userMessage !== "string") {
            return new Response(JSON.stringify({ error: "Invalid user message" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Only try to use the API if we have a key
        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY is not set. The API will not function correctly.");
            return new Response(JSON.stringify({
                message: "GROQ API key not configured. Please set the GROQ_API_KEY environment variable.",
                error: "Missing API key"
            }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
            });
        }

        const groq = getGroqClient();
        if (!groq) {
            return new Response(JSON.stringify({
                error: "Failed to initialize Groq client"
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const chatCompletion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Using the specified model
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant who ONLY answers questions about the board game Quoridor. You are savvy, strategic, and love sharing advanced tips and clever tactics for Quoridor 🎲. If the question is unrelated, kindly explain you only help with Quoridor topics. Use emojis to make the conversation a bit more fun and engaging! 🧠 Always use normal text, never capital or bold."
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