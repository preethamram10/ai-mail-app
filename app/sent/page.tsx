"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailList } from "@/components/mail/EmailList";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssistantPanel } from "@/components/ai/AssistantPanel";
import { useMailStore } from "@/store/mailStore";
import { useUIStore } from "@/store/uiStore";
import { Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SentPage() {
    const { emails, setEmails, setCurrentView } = useMailStore();
    const { assistantOpen, toggleAssistant } = useUIStore();

    useEffect(() => {
        setCurrentView("sent");
    }, [setCurrentView]);

    const { data, isLoading } = useQuery({
        queryKey: ["emails", "sent"],
        queryFn: async () => {
            const response = await fetch("/api/mail/list?labelId=SENT");
            if (!response.ok) throw new Error("Failed to fetch sent emails");
            return response.json();
        },
    });

    useEffect(() => {
        if (data?.emails) {
            setEmails(data.emails);
        }
    }, [data, setEmails]);

    return (
        <div className="h-screen flex bg-background">
            {/* Sidebar */}
            <Sidebar emailCounts={{ inbox: 0, sent: emails.length, trash: 0 }} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Sent</h1>
                            <p className="text-sm text-muted-foreground">
                                {emails.length} email{emails.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

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
                </header>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Email List */}
                    <div className={`flex-1 overflow-y-auto ${assistantOpen ? "w-2/3" : "w-full"}`}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading sent emails...</p>
                                </div>
                            </div>
                        ) : (
                            <EmailList emails={emails} />
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
