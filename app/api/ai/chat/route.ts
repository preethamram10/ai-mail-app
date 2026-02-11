import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createChatSession, sendMessage } from "@/lib/ai/gemini";

// Store chat sessions per user (in production, use Redis or similar)
const chatSessions = new Map();

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, context } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not configured");
            return NextResponse.json(
                { error: "AI service is not configured. Please set GEMINI_API_KEY in .env.local" },
                { status: 500 }
            );
        }

        // Get or create chat session for this user
        const userEmail = session.user.email;
        let chat = chatSessions.get(userEmail);

        if (!chat) {
            chat = await createChatSession();
            chatSessions.set(userEmail, chat);
        }

        // Send message with context
        const response = await sendMessage(chat, message, context);

        // Extract function calls if any
        const functionCalls = [];
        let textResponse = "";

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
                if (part.functionCall) {
                    functionCalls.push({
                        name: part.functionCall.name,
                        args: part.functionCall.args,
                    });
                } else if (part.text) {
                    textResponse += part.text;
                }
            }
        }

        return NextResponse.json({
            text: textResponse,
            functionCalls,
        });
    } catch (error: any) {
        console.error("Error in AI chat:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        return NextResponse.json(
            {
                error: error.message || "Failed to process message",
                details: process.env.NODE_ENV === "development" ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Clear chat session
        chatSessions.delete(session.user.email);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error clearing chat:", error);
        return NextResponse.json(
            { error: error.message || "Failed to clear chat" },
            { status: 500 }
        );
    }
}
