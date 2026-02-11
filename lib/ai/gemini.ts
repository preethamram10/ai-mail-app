import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Define function declarations for UI control
export const functions = [
    {
        name: "composeEmail",
        description:
            "Open the compose view and fill in the email fields (to, subject, body). Use this when the user wants to write or send an email.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                to: {
                    type: SchemaType.STRING,
                    description: "Recipient email address",
                },
                subject: {
                    type: SchemaType.STRING,
                    description: "Email subject line",
                },
                body: {
                    type: SchemaType.STRING,
                    description: "Email body content",
                },
                cc: {
                    type: SchemaType.STRING,
                    description: "CC recipients (optional)",
                },
            },
            required: ["to", "subject", "body"],
        },
    },
    {
        name: "searchEmails",
        description:
            "Search for emails based on filters. Updates the main UI to show filtered results. Use this when the user wants to find specific emails.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                query: {
                    type: SchemaType.STRING,
                    description: "Search query text",
                },
                from: {
                    type: SchemaType.STRING,
                    description: "Filter by sender email",
                },
                after: {
                    type: SchemaType.STRING,
                    description: "Filter emails after this date (YYYY-MM-DD)",
                },
                before: {
                    type: SchemaType.STRING,
                    description: "Filter emails before this date (YYYY-MM-DD)",
                },
                isUnread: {
                    type: SchemaType.BOOLEAN,
                    description: "Filter for unread emails only",
                },
            },
        },
    },
    {
        name: "openEmail",
        description:
            "Navigate to and display a specific email in the detail view. Use this when the user wants to open or read a specific email.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                emailId: {
                    type: SchemaType.STRING,
                    description: "The ID of the email to open",
                },
            },
            required: ["emailId"],
        },
    },
    {
        name: "filterInbox",
        description:
            "Apply filters to the inbox view. Updates the UI to show filtered results.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                dateRange: {
                    type: SchemaType.STRING,
                    description:
                        "Date range filter (e.g., 'last 7 days', 'last month', 'this week')",
                },
                sender: {
                    type: SchemaType.STRING,
                    description: "Filter by sender name or email",
                },
                unreadOnly: {
                    type: SchemaType.BOOLEAN,
                    description: "Show only unread emails",
                },
            },
        },
    },
    {
        name: "sendEmail",
        description:
            "Send the currently composed email. Use this after composeEmail when the user confirms they want to send.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {},
        },
    },
    {
        name: "replyToEmail",
        description:
            "Open compose view with a reply to the currently open email. Pre-fills recipient and subject.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                body: {
                    type: SchemaType.STRING,
                    description: "Reply message body",
                },
            },
            required: ["body"],
        },
    },
];

export async function createChatSession() {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [{ functionDeclarations: functions }],
        systemInstruction: `You are an AI assistant integrated into an email client. Your role is to help users manage their emails through natural language commands.

You can control the UI by calling functions. When a user asks you to do something, you should:
1. Call the appropriate function to perform the action
2. Provide a brief, friendly confirmation message

Key capabilities:
- Compose and send emails
- Search and filter emails
- Navigate to specific emails
- Reply to emails

Important guidelines:
- Always confirm before sending emails (use composeEmail first, then sendEmail after user confirmation)
- Be context-aware: know which email is currently open, which view the user is in
- When searching, use the most relevant filters based on the user's request
- Parse natural language dates (e.g., "last week" → calculate actual dates)
- Be concise and helpful in your responses

Examples:
- "Send an email to john@example.com about the meeting" → composeEmail
- "Show me emails from Sarah" → searchEmails with from filter
- "Open the latest email" → openEmail with the first email ID
- "Reply to this email" → replyToEmail (context-aware)`,
    });

    return model.startChat({
        history: [],
    });
}

export async function sendMessage(chat: any, message: string, context?: any) {
    const result = await chat.sendMessage(message);
    return result.response;
}
