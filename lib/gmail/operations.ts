import { gmail_v1 } from "googleapis";
import { createGmailClient } from "./client";
import {
    Email,
    EmailListItem,
    EmailDetail,
    ComposeEmailData,
    EmailFilters,
    EmailAttachment,
} from "@/types/email";

export async function listEmails(
    accessToken: string,
    labelId: string = "INBOX",
    maxResults: number = 50
): Promise<EmailListItem[]> {
    const gmail = createGmailClient(accessToken);

    const response = await gmail.users.messages.list({
        userId: "me",
        labelIds: [labelId],
        maxResults,
    });

    const messages = response.data.messages || [];

    const emailPromises = messages.map(async (message) => {
        const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
            format: "metadata",
            metadataHeaders: ["From", "To", "Subject", "Date"],
        });

        return parseEmailListItem(email.data as Email);
    });

    return Promise.all(emailPromises);
}

export async function getEmail(
    accessToken: string,
    emailId: string
): Promise<EmailDetail> {
    const gmail = createGmailClient(accessToken);

    const response = await gmail.users.messages.get({
        userId: "me",
        id: emailId,
        format: "full",
    });

    return parseEmailDetail(response.data as Email);
}

export async function sendEmail(
    accessToken: string,
    emailData: ComposeEmailData
): Promise<string> {
    const gmail = createGmailClient(accessToken);

    const message = createMimeMessage(emailData);
    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });

    return response.data.id!;
}

export async function searchEmails(
    accessToken: string,
    filters: EmailFilters
): Promise<EmailListItem[]> {
    const gmail = createGmailClient(accessToken);

    const query = buildSearchQuery(filters);

    const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 50,
    });

    const messages = response.data.messages || [];

    const emailPromises = messages.map(async (message) => {
        const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
            format: "metadata",
            metadataHeaders: ["From", "To", "Subject", "Date"],
        });

        return parseEmailListItem(email.data as Email);
    });

    return Promise.all(emailPromises);
}

export async function modifyEmail(
    accessToken: string,
    emailId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
): Promise<void> {
    const gmail = createGmailClient(accessToken);

    await gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: {
            addLabelIds,
            removeLabelIds,
        },
    });
}

export async function markAsRead(
    accessToken: string,
    emailId: string
): Promise<void> {
    await modifyEmail(accessToken, emailId, [], ["UNREAD"]);
}

export async function markAsUnread(
    accessToken: string,
    emailId: string
): Promise<void> {
    await modifyEmail(accessToken, emailId, ["UNREAD"], []);
}

export async function trashEmail(
    accessToken: string,
    emailId: string
): Promise<void> {
    await modifyEmail(accessToken, emailId, ["TRASH"], []);
}

export async function restoreEmail(
    accessToken: string,
    emailId: string
): Promise<void> {
    await modifyEmail(accessToken, emailId, [], ["TRASH"]);
}

export async function listTrashedEmails(
    accessToken: string,
    maxResults: number = 50
): Promise<EmailListItem[]> {
    return listEmails(accessToken, "TRASH", maxResults);
}


// Helper functions

function parseEmailListItem(email: Email): EmailListItem {
    const headers = email.payload.headers;
    const from = getHeader(headers, "From");
    const to = getHeader(headers, "To");
    const subject = getHeader(headers, "Subject");
    const date = getHeader(headers, "Date");

    return {
        id: email.id,
        threadId: email.threadId,
        from,
        to,
        subject,
        snippet: email.snippet,
        date: new Date(date),
        isUnread: email.labelIds.includes("UNREAD"),
        hasAttachments: hasAttachments(email),
    };
}

function parseEmailDetail(email: Email): EmailDetail {
    const headers = email.payload.headers;
    const from = getHeader(headers, "From");
    const to = getHeader(headers, "To");
    const cc = getHeader(headers, "Cc");
    const bcc = getHeader(headers, "Bcc");
    const subject = getHeader(headers, "Subject");
    const date = getHeader(headers, "Date");

    const { textBody, htmlBody } = extractBody(email.payload);
    const attachments = extractAttachments(email.payload);

    return {
        id: email.id,
        threadId: email.threadId,
        from,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body: textBody,
        htmlBody: htmlBody || undefined,
        date: new Date(date),
        isUnread: email.labelIds.includes("UNREAD"),
        labelIds: email.labelIds,
        attachments,
    };
}

function getHeader(headers: any[], name: string): string {
    const header = headers.find(
        (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header?.value || "";
}

function hasAttachments(email: Email): boolean {
    if (!email.payload.parts) return false;

    return email.payload.parts.some(
        (part) => part.filename && part.filename.length > 0
    );
}

function extractBody(payload: any): { textBody: string; htmlBody: string } {
    let textBody = "";
    let htmlBody = "";

    if (payload.body?.data) {
        textBody = decodeBase64(payload.body.data);
    }

    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                textBody = decodeBase64(part.body.data);
            } else if (part.mimeType === "text/html" && part.body?.data) {
                htmlBody = decodeBase64(part.body.data);
            } else if (part.parts) {
                const nested = extractBody(part);
                if (nested.textBody) textBody = nested.textBody;
                if (nested.htmlBody) htmlBody = nested.htmlBody;
            }
        }
    }

    return { textBody, htmlBody };
}

function extractAttachments(payload: any): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.filename && part.filename.length > 0) {
                attachments.push({
                    filename: part.filename,
                    mimeType: part.mimeType,
                    size: part.body.size,
                    attachmentId: part.body.attachmentId,
                });
            }
            if (part.parts) {
                attachments.push(...extractAttachments(part));
            }
        }
    }

    return attachments;
}

function decodeBase64(data: string): string {
    return Buffer.from(data, "base64").toString("utf-8");
}

function createMimeMessage(emailData: ComposeEmailData): string {
    const lines = [];
    lines.push(`To: ${emailData.to}`);
    if (emailData.cc) lines.push(`Cc: ${emailData.cc}`);
    if (emailData.bcc) lines.push(`Bcc: ${emailData.bcc}`);
    lines.push(`Subject: ${emailData.subject}`);
    lines.push("MIME-Version: 1.0");
    lines.push("Content-Type: text/plain; charset=utf-8");
    lines.push("");
    lines.push(emailData.body);

    return lines.join("\r\n");
}

function buildSearchQuery(filters: EmailFilters): string {
    const parts: string[] = [];

    if (filters.query) parts.push(filters.query);
    if (filters.from) parts.push(`from:${filters.from}`);
    if (filters.to) parts.push(`to:${filters.to}`);
    if (filters.subject) parts.push(`subject:${filters.subject}`);
    if (filters.after) {
        const date = formatDateForQuery(filters.after);
        parts.push(`after:${date}`);
    }
    if (filters.before) {
        const date = formatDateForQuery(filters.before);
        parts.push(`before:${date}`);
    }
    if (filters.hasAttachment) parts.push("has:attachment");
    if (filters.isUnread) parts.push("is:unread");

    return parts.join(" ");
}

function formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}
