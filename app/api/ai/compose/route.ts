import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, currentData } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not configured");
            // Fallback to simple keyword matching
            return generateSimpleEmail(message, currentData, session);
        }

        try {
            // Use Gemini AI to generate email
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `You are an email writing assistant. Based on the user's request, generate a professional email with the following JSON format:
{
  "to": "email address if mentioned, otherwise empty string",
  "subject": "appropriate email subject",
  "body": "professional email body with proper formatting"
}

User request: ${message}

Current email data:
- To: ${currentData?.to || "not set"}
- Subject: ${currentData?.subject || "not set"}
- Body: ${currentData?.body || "not set"}

Sender name: ${session.user.name || "User"}

Generate a complete, professional email. Extract email addresses from the request if present. Use proper email formatting with greetings, body paragraphs, and sign-off.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const emailData = JSON.parse(jsonMatch[0]);
                return NextResponse.json({
                    to: emailData.to || currentData?.to || "",
                    subject: emailData.subject || currentData?.subject || "",
                    body: emailData.body || currentData?.body || "",
                    message: "✅ Email ready to send! Review and click Send."
                });
            }
        } catch (error) {
            console.error("Gemini AI error:", error);
            // Fallback to simple generation
        }

        // Fallback: Simple keyword-based generation
        return generateSimpleEmail(message, currentData, session);
    } catch (error: any) {
        console.error("Error in AI compose:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process request" },
            { status: 500 }
        );
    }
}

function generateSimpleEmail(message: string, currentData: any, session: any) {
    const lowerMessage = message.toLowerCase();

    let to = currentData?.to || "";
    let subject = currentData?.subject || "";
    let body = currentData?.body || "";

    // Extract email address from message
    const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
        to = emailMatch[0];
    }

    // Extract recipient name if mentioned
    const nameMatch = message.match(/(?:to|email)\s+([A-Z][a-z]+)/);
    const recipientName = nameMatch ? nameMatch[1] : "Recipient";

    // Generate subject and body based on keywords
    if (lowerMessage.includes("project") && lowerMessage.includes("submission")) {
        subject = "Project Submission";
        body = `Dear ${recipientName},

I hope this email finds you well. I am writing to submit my project as per the deadline.

I have completed all the required components and ensured that the quality standards are met. The project includes all necessary documentation and deliverables.

Please find the project details attached. If you have any questions or need additional information, please feel free to reach out.

Thank you for your time and consideration.

Best regards,
${session.user.name || "Your Name"}`;
    } else if (lowerMessage.includes("thank")) {
        subject = "Thank You";
        body = `Dear ${recipientName},

I wanted to take a moment to express my sincere gratitude for your support and assistance.

Your help has been invaluable, and I truly appreciate the time and effort you've dedicated to helping me.

Thank you once again for everything.

Best regards,
${session.user.name || "Your Name"}`;
    } else if (lowerMessage.includes("meeting")) {
        subject = "Meeting Request";
        body = `Dear ${recipientName},

I hope this email finds you well. I would like to schedule a meeting to discuss important matters.

Please let me know your availability for the coming week, and I will do my best to accommodate your schedule.

Looking forward to hearing from you.

Best regards,
${session.user.name || "Your Name"}`;
    } else if (lowerMessage.includes("follow up")) {
        subject = "Follow Up";
        body = `Dear ${recipientName},

I hope this email finds you well. I am writing to follow up on our previous conversation.

I wanted to check in and see if you had any updates or if there's anything I can assist you with.

Please let me know at your earliest convenience.

Best regards,
${session.user.name || "Your Name"}`;
    } else if (lowerMessage.includes("application") || lowerMessage.includes("apply")) {
        subject = "Job Application";
        body = `Dear ${recipientName},

I hope this email finds you well. I am writing to express my interest in applying for the position.

I have attached my resume and cover letter for your review. I believe my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss my application further.

Thank you for your consideration.

Best regards,
${session.user.name || "Your Name"}`;
    } else {
        subject = "Important Message";
        body = `Dear ${recipientName},

I hope this email finds you well.

${message}

Please let me know if you need any additional information.

Best regards,
${session.user.name || "Your Name"}`;
    }

    return NextResponse.json({
        to,
        subject,
        body,
        message: "✅ Email ready to send! Review and click Send."
    });
}
