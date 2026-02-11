import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { emailContent, emailSubject, emailFrom } = await request.json();

        if (!emailContent) {
            return NextResponse.json(
                { error: "Email content is required" },
                { status: 400 }
            );
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not configured");
            return generateSimpleReply(emailContent, emailSubject, session);
        }

        try {
            // Use Gemini AI to generate smart reply
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `You are an email reply assistant. Based on the received email, generate a professional reply with the following JSON format:
{
  "subject": "Re: [original subject]",
  "body": "professional reply body"
}

Original email:
Subject: ${emailSubject || "No subject"}
From: ${emailFrom || "Unknown sender"}
Content:
${emailContent}

Sender name: ${session.user.name || "User"}

Generate a professional, contextually appropriate reply. Be polite, concise, and address the main points from the original email. Include proper greeting and sign-off.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const replyData = JSON.parse(jsonMatch[0]);
                return NextResponse.json({
                    subject: replyData.subject || `Re: ${emailSubject || ""}`,
                    body: replyData.body || "",
                    message: "✅ Reply generated! Review and send."
                });
            }
        } catch (error) {
            console.error("Gemini AI error:", error);
            // Fallback to simple generation
        }

        // Fallback: Simple reply generation
        return generateSimpleReply(emailContent, emailSubject, session);
    } catch (error: any) {
        console.error("Error in AI reply:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate reply" },
            { status: 500 }
        );
    }
}

function generateSimpleReply(emailContent: string, emailSubject: string, session: any) {
    const subject = `Re: ${emailSubject || ""}`;
    const body = `Dear Sender,

Thank you for your email. I have received your message and will respond accordingly.

${emailContent.length > 200 ? "Regarding your message, I appreciate you reaching out." : ""}

I will get back to you with more details soon.

Best regards,
${session.user.name || "Your Name"}`;

    return NextResponse.json({
        subject,
        body,
        message: "✅ Reply generated! Review and send."
    });
}
