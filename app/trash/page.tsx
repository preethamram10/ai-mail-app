"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailList } from "@/components/mail/EmailList";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssistantPanel } from "@/components/ai/AssistantPanel";
import { useMailStore } from "@/store/mailStore";
import { useUIStore } from "@/store/uiStore";
import { Sparkles, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function TrashPage() {
    const { emails, setEmails, setCurrentView } = useMailStore();
    const { assistantOpen, toggleAssistant } = useUIStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentView("trash");
    }, [setCurrentView]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["emails", "trash"],
        queryFn: async () => {
            const response = await fetch("/api/mail/trash");
            if (!response.ok) throw new Error("Failed to fetch trashed emails");
            return response.json();
        },
    });

    useEffect(() => {
        if (data?.emails) {
            setEmails(data.emails);
        }
    }, [data, setEmails]);

    const restoreMutation = useMutation({
        mutationFn: async (emailId: string) => {
            const response = await fetch("/api/mail/trash", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailId }),
            });
            if (!response.ok) throw new Error("Failed to restore email");
            return response.json();
        },
        onSuccess: () => {
            toast.success("Email restored to inbox");
            queryClient.invalidateQueries({ queryKey: ["emails", "trash"] });
            queryClient.invalidateQueries({ queryKey: ["emails", "inbox"] });
            refetch();
        },
        onError: () => {
            toast.error("Failed to restore email");
        },
    });

    const handleRestore = (emailId: string) => {
        restoreMutation.mutate(emailId);
    };

    return (
        <div className="h-screen flex bg-background">
            {/* Sidebar */}
            <Sidebar emailCounts={{ inbox: 0, sent: 0, trash: emails.length }} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Trash</h1>
                            <p className="text-sm text-muted-foreground">
                                {emails.length} email{emails.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleAssistant}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${assistantOpen
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent hover:bg-accent/80"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">AI Assistant</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Email List */}
                    <div className={`flex-1 overflow-y-auto ${assistantOpen ? "w-2/3" : "w-full"}`}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading trashed emails...</p>
                                </div>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Trash2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                    <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
                                    <p className="text-muted-foreground">
                                        Deleted emails will appear here
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="mb-4 p-3 bg-accent/50 rounded-lg border border-border">
                                    <p className="text-sm text-muted-foreground">
                                        Emails in trash will be automatically deleted after 30 days
                                    </p>
                                </div>
                                <EmailList
                                    emails={emails}
                                    onRestore={handleRestore}
                                    showRestoreButton={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* AI Assistant Panel */}
                    {assistantOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "33.333333%", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-border"
                        >
                            <AssistantPanel onClose={toggleAssistant} />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
