import { ComposeEmailData, EmailFilters } from "@/types/email";
import { useMailStore } from "@/store/mailStore";
import { useAIStore } from "@/store/aiStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface FunctionCall {
    name: string;
    args: any;
}

export interface ExecutionResult {
    success: boolean;
    message: string;
    data?: any;
}

export async function executeFunction(
    functionCall: FunctionCall,
    composeFormRef?: any
): Promise<ExecutionResult> {
    const { name, args } = functionCall;

    try {
        switch (name) {
            case "composeEmail":
                return await executeComposeEmail(args, composeFormRef);

            case "searchEmails":
                return await executeSearchEmails(args);

            case "openEmail":
                return await executeOpenEmail(args);

            case "filterInbox":
                return await executeFilterInbox(args);

            case "sendEmail":
                return await executeSendEmail(composeFormRef);

            case "replyToEmail":
                return await executeReplyToEmail(args, composeFormRef);

            default:
                return {
                    success: false,
                    message: `Unknown function: ${name}`,
                };
        }
    } catch (error: any) {
        console.error(`Error executing ${name}:`, error);
        return {
            success: false,
            message: error.message || `Failed to execute ${name}`,
        };
    }
}

async function executeComposeEmail(
    args: any,
    composeFormRef?: any
): Promise<ExecutionResult> {
    const { to, subject, body, cc } = args;

    const emailData: Partial<ComposeEmailData> = {
        to,
        subject,
        body,
        cc,
    };

    // If we have a ref to the compose form, fill it directly
    if (composeFormRef?.current) {
        composeFormRef.current.fillForm(emailData);
        return {
            success: true,
            message: `Composed email to ${to}. Review and click Send when ready.`,
            data: emailData,
        };
    }

    // Otherwise, navigate to compose page with state
    const router = useRouter();
    useMailStore.getState().setCurrentView("compose");

    return {
        success: true,
        message: `Opening compose view for email to ${to}`,
        data: emailData,
    };
}

async function executeSearchEmails(args: any): Promise<ExecutionResult> {
    const filters: EmailFilters = {};

    if (args.query) filters.query = args.query;
    if (args.from) filters.from = args.from;
    if (args.after) filters.after = new Date(args.after);
    if (args.before) filters.before = new Date(args.before);
    if (args.isUnread !== undefined) filters.isUnread = args.isUnread;

    // Call search API
    const response = await fetch("/api/mail/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        throw new Error("Failed to search emails");
    }

    const { emails } = await response.json();

    // Update store with search results
    useMailStore.getState().setEmails(emails);
    useMailStore.getState().updateFilters(filters);

    return {
        success: true,
        message: `Found ${emails.length} email${emails.length !== 1 ? "s" : ""}`,
        data: { emails, filters },
    };
}

async function executeOpenEmail(args: any): Promise<ExecutionResult> {
    const { emailId } = args;

    // Fetch email details
    const response = await fetch(`/api/mail/${emailId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch email");
    }

    const { email } = await response.json();

    // Update store
    useMailStore.getState().setCurrentEmail(email);

    // Navigate to email detail
    if (typeof window !== "undefined") {
        window.location.href = `/email/${emailId}`;
    }

    return {
        success: true,
        message: `Opened email: ${email.subject}`,
        data: email,
    };
}

async function executeFilterInbox(args: any): Promise<ExecutionResult> {
    const filters: EmailFilters = {};

    // Parse date range
    if (args.dateRange) {
        const { after, before } = parseDateRange(args.dateRange);
        if (after) filters.after = after;
        if (before) filters.before = before;
    }

    if (args.sender) filters.from = args.sender;
    if (args.unreadOnly) filters.isUnread = true;

    // Apply filters
    useMailStore.getState().updateFilters(filters);

    // Fetch filtered emails
    const response = await fetch("/api/mail/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        throw new Error("Failed to filter emails");
    }

    const { emails } = await response.json();
    useMailStore.getState().setEmails(emails);

    return {
        success: true,
        message: `Applied filters. Showing ${emails.length} email${emails.length !== 1 ? "s" : ""
            }`,
        data: { emails, filters },
    };
}

async function executeSendEmail(composeFormRef?: any): Promise<ExecutionResult> {
    if (!composeFormRef?.current) {
        return {
            success: false,
            message: "No email to send",
        };
    }

    await composeFormRef.current.submit();

    return {
        success: true,
        message: "Email sent successfully!",
    };
}

async function executeReplyToEmail(
    args: any,
    composeFormRef?: any
): Promise<ExecutionResult> {
    const currentEmail = useMailStore.getState().currentEmail;

    if (!currentEmail) {
        return {
            success: false,
            message: "No email is currently open to reply to",
        };
    }

    const replyData: Partial<ComposeEmailData> = {
        to: currentEmail.from,
        subject: currentEmail.subject.startsWith("Re:")
            ? currentEmail.subject
            : `Re: ${currentEmail.subject}`,
        body: args.body,
    };

    if (composeFormRef?.current) {
        composeFormRef.current.fillForm(replyData);
    }

    return {
        success: true,
        message: `Composed reply to ${currentEmail.from}`,
        data: replyData,
    };
}

// Helper function to parse natural language date ranges
function parseDateRange(range: string): { after?: Date; before?: Date } {
    const now = new Date();
    const result: { after?: Date; before?: Date } = {};

    const lowerRange = range.toLowerCase();

    if (lowerRange.includes("last 7 days") || lowerRange.includes("last week")) {
        result.after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (lowerRange.includes("last 10 days")) {
        result.after = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    } else if (lowerRange.includes("last 30 days") || lowerRange.includes("last month")) {
        result.after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (lowerRange.includes("this week")) {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        result.after = startOfWeek;
    } else if (lowerRange.includes("today")) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        result.after = startOfDay;
    }

    return result;
}
