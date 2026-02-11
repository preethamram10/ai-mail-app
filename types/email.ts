export interface Email {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    payload: {
        headers: EmailHeader[];
        body?: EmailBody;
        parts?: EmailPart[];
    };
    internalDate: string;
    sizeEstimate: number;
}

export interface EmailHeader {
    name: string;
    value: string;
}

export interface EmailBody {
    size: number;
    data?: string;
}

export interface EmailPart {
    partId: string;
    mimeType: string;
    filename: string;
    headers: EmailHeader[];
    body: EmailBody;
    parts?: EmailPart[];
}

export interface EmailListItem {
    id: string;
    threadId: string;
    from: string;
    to: string;
    subject: string;
    snippet: string;
    date: Date;
    isUnread: boolean;
    hasAttachments: boolean;
}

export interface EmailDetail {
    id: string;
    threadId: string;
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    htmlBody?: string;
    date: Date;
    isUnread: boolean;
    labelIds: string[];
    attachments: EmailAttachment[];
}

export interface EmailAttachment {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
}

export interface ComposeEmailData {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
}

export interface EmailFilters {
    query?: string;
    from?: string;
    to?: string;
    subject?: string;
    after?: Date;
    before?: Date;
    hasAttachment?: boolean;
    isUnread?: boolean;
    labelIds?: string[];
}
