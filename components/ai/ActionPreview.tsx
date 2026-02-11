"use client";

import { PendingAction } from "@/store/aiStore";
import { Check, X, Mail, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface ActionPreviewProps {
    action: PendingAction;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ActionPreview({ action, onConfirm, onCancel }: ActionPreviewProps) {
    const getActionIcon = () => {
        switch (action.type) {
            case "compose":
            case "composeEmail":
            case "send":
            case "sendEmail":
            case "reply":
            case "replyToEmail":
                return <Mail className="w-5 h-5" />;
            case "search":
            case "searchEmails":
                return <Search className="w-5 h-5" />;
            case "filter":
            case "filterInbox":
                return <Filter className="w-5 h-5" />;
            default:
                return <Mail className="w-5 h-5" />;
        }
    };

    const getActionTitle = () => {
        switch (action.type) {
            case "compose":
            case "composeEmail":
                return "Compose Email";
            case "send":
            case "sendEmail":
                return "Send Email";
            case "reply":
            case "replyToEmail":
                return "Reply to Email";
            case "search":
            case "searchEmails":
                return "Search Emails";
            case "filter":
            case "filterInbox":
                return "Filter Inbox";
            default:
                return "Action";
        }
    };

    const getActionDetails = () => {
        switch (action.type) {
            case "compose":
            case "composeEmail":
                return (
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="font-medium">To:</span> {action.data.to}
                        </p>
                        <p>
                            <span className="font-medium">Subject:</span> {action.data.subject}
                        </p>
                        <p className="text-muted-foreground truncate">
                            {action.data.body.substring(0, 100)}...
                        </p>
                    </div>
                );
            case "send":
            case "sendEmail":
                return <p className="text-sm">Ready to send the composed email</p>;
            case "reply":
            case "replyToEmail":
                return (
                    <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground truncate">
                            {action.data.body.substring(0, 100)}...
                        </p>
                    </div>
                );
            case "search":
            case "searchEmails":
                return (
                    <div className="space-y-1 text-sm">
                        {action.data.query && <p>Query: {action.data.query}</p>}
                        {action.data.from && <p>From: {action.data.from}</p>}
                        {action.data.after && <p>After: {action.data.after}</p>}
                    </div>
                );
            case "filter":
            case "filterInbox":
                return (
                    <div className="space-y-1 text-sm">
                        {action.data.dateRange && <p>Date: {action.data.dateRange}</p>}
                        {action.data.sender && <p>Sender: {action.data.sender}</p>}
                        {action.data.unreadOnly && <p>Unread only</p>}
                    </div>
                );
            default:
                return <p className="text-sm">Confirm this action?</p>;
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-accent/50 border border-border rounded-lg p-4"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    {getActionIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{getActionTitle()}</h4>
                    {getActionDetails()}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                    <Check className="w-4 h-4" />
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}
