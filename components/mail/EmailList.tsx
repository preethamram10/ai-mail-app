"use client";

import type { EmailListItem } from "@/types/email";
import { formatDate, extractDisplayName, truncateText, cn } from "@/lib/utils";
import { Mail, MailOpen, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface EmailListProps {
    emails: EmailListItem[];
    onEmailClick?: (emailId: string) => void;
    onRestore?: (emailId: string) => void;
    showRestoreButton?: boolean;
}

export function EmailList({ emails, onEmailClick, onRestore, showRestoreButton }: EmailListProps) {
    const router = useRouter();

    const handleClick = (emailId: string) => {
        if (onEmailClick) {
            onEmailClick(emailId);
        } else {
            router.push(`/email/${emailId}`);
        }
    };

    if (emails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <Mail className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No emails found</p>
                <p className="text-sm">Your inbox is empty</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {emails.map((email, index) => (
                <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                    <EmailListItem
                        email={email}
                        onClick={() => handleClick(email.id)}
                        onRestore={onRestore}
                        showRestoreButton={showRestoreButton}
                    />
                </motion.div>
            ))}
        </div>
    );
}

interface EmailListItemProps {
    email: EmailListItem;
    onClick: () => void;
    onRestore?: (emailId: string) => void;
    showRestoreButton?: boolean;
}

function EmailListItem({ email, onClick, onRestore, showRestoreButton }: EmailListItemProps) {
    const displayName = extractDisplayName(email.from);

    const handleRestore = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRestore) {
            onRestore(email.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "px-6 py-4 hover:bg-accent/50 cursor-pointer transition-colors",
                email.isUnread && "bg-accent/20"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                    {email.isUnread ? (
                        <Mail className="w-5 h-5 text-primary" />
                    ) : (
                        <MailOpen className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3
                            className={cn(
                                "text-sm truncate",
                                email.isUnread ? "font-semibold" : "font-medium"
                            )}
                        >
                            {displayName}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(email.date)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <p
                            className={cn(
                                "text-sm truncate",
                                email.isUnread ? "font-medium" : "font-normal"
                            )}
                        >
                            {email.subject || "(No subject)"}
                        </p>
                        {email.hasAttachments && (
                            <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                        {truncateText(email.snippet, 100)}
                    </p>
                </div>

                {/* Restore Button */}
                {showRestoreButton && onRestore && (
                    <button
                        onClick={handleRestore}
                        className="flex-shrink-0 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                    >
                        Restore
                    </button>
                )}
            </div>
        </div>
    );
}

