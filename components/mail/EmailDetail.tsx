import { EmailDetail } from "@/types/email";
import { formatDate, extractDisplayName, extractEmailAddress } from "@/lib/utils";
import { ArrowLeft, Reply, Forward, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";

interface EmailDetailProps {
    email: EmailDetail;
    onReply?: () => void;
    onForward?: () => void;
    onAIReply?: () => void;
    generatingReply?: boolean;
}

export function EmailDetailView({ email, onReply, onForward, onAIReply, generatingReply }: EmailDetailProps) {
    const router = useRouter();
    const displayName = extractDisplayName(email.from);
    const emailAddress = extractEmailAddress(email.from);

    const sanitizedHtml = email.htmlBody
        ? DOMPurify.sanitize(email.htmlBody)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-background"
        >
            {/* Header */}
            <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex items-center gap-2">
                        {onAIReply && (
                            <button
                                onClick={onAIReply}
                                disabled={generatingReply}
                                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
                                title="AI Smart Reply"
                            >
                                <Sparkles className="w-4 h-4" />
                                {generatingReply ? "Generating..." : "AI Reply"}
                            </button>
                        )}
                        <button
                            onClick={onReply}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Reply"
                        >
                            <Reply className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onForward}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Forward"
                        >
                            <Forward className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-red-500"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-4">{email.subject || "(No subject)"}</h1>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <p className="font-semibold">{displayName}</p>
                                <p className="text-sm text-muted-foreground">{emailAddress}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(email.date)}
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            to {extractDisplayName(email.to)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {sanitizedHtml ? (
                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                ) : (
                    <div className="whitespace-pre-wrap">{email.body}</div>
                )}

                {/* Attachments */}
                {email.attachments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border">
                        <h3 className="font-semibold mb-3">
                            Attachments ({email.attachments.length})
                        </h3>
                        <div className="space-y-2">
                            {email.attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg"
                                >
                                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                        <span className="text-xs font-semibold text-primary">
                                            {attachment.filename.split(".").pop()?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {attachment.filename}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
