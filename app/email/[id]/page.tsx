"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailDetailView } from "@/components/mail/EmailDetail";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssistantPanel } from "@/components/ai/AssistantPanel";
import { ComposeForm, ComposeFormRef } from "@/components/mail/ComposeForm";
import { useMailStore } from "@/store/mailStore";
import { useUIStore } from "@/store/uiStore";
import { useParams, useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function EmailDetailPage() {
    const params = useParams();
    const router = useRouter();
    const emailId = params.id as string;
    const { setCurrentEmail, currentEmail } = useMailStore();
    const { assistantOpen, toggleAssistant } = useUIStore();
    const [showReply, setShowReply] = useState(false);
    const [generatingReply, setGeneratingReply] = useState(false);
    const composeFormRef = useRef<ComposeFormRef>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["email", emailId],
        queryFn: async () => {
            const response = await fetch(`/api/mail/${emailId}`);
            if (!response.ok) throw new Error("Failed to fetch email");
            return response.json();
        },
        enabled: !!emailId,
    });

    useEffect(() => {
        if (data?.email) {
            setCurrentEmail(data.email);
        }
    }, [data, setCurrentEmail]);

    const handleAIReply = async () => {
        if (!currentEmail) return;

        setGeneratingReply(true);
        try {
            const response = await fetch("/api/ai/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailContent: currentEmail.body || "",
                    emailSubject: currentEmail.subject || "",
                    emailFrom: currentEmail.from || "",
                }),
            });

            if (!response.ok) throw new Error("Failed to generate reply");

            const replyData = await response.json();
            setShowReply(true);

            // Wait for form to render, then fill it
            setTimeout(() => {
                if (composeFormRef.current) {
                    composeFormRef.current.fillForm({
                        to: currentEmail.from,
                        subject: replyData.subject,
                        body: replyData.body,
                    });
                }
            }, 100);

            toast.success("AI reply generated!");
        } catch (error) {
            console.error("Error generating reply:", error);
            toast.error("Failed to generate reply");
        } finally {
            setGeneratingReply(false);
        }
    };

    const handleReply = () => {
        setShowReply(true);
        if (composeFormRef.current && currentEmail) {
            composeFormRef.current.fillForm({
                to: currentEmail.from,
                subject: currentEmail.subject.startsWith("Re:")
                    ? currentEmail.subject
                    : `Re: ${currentEmail.subject}`,
                body: "",
            });
        }
    };

    const handleForward = () => {
        router.push(`/compose?forward=${emailId}`);
    };

    const { data: emailCounts } = useQuery({
        queryKey: ["emailCounts"],
        queryFn: async () => {
            // Placeholder for now, or fetch actual counts if API exists
            return { inbox: 0, sent: 0, trash: 0 };
        },
        initialData: { inbox: 0, sent: 0, trash: 0 }
    });

    if (isLoading) {
        return (
            <div className="h-screen flex bg-background">
                <Sidebar emailCounts={emailCounts} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading email...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentEmail) {
        return (
            <div className="h-screen flex bg-background">
                <Sidebar emailCounts={emailCounts} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Email not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-background">
            <Sidebar emailCounts={emailCounts} />

            <div className="flex-1 flex flex-col bg-background min-w-0">
                {/* Header */}
                <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold">Email</h1>
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

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Email Detail */}
                    <div className={`flex-1 overflow-hidden ${assistantOpen ? "w-2/3" : "w-full"}`}>
                        {!showReply ? (
                            <EmailDetailView
                                email={currentEmail}
                                onReply={handleReply}
                                onForward={handleForward}
                                onAIReply={handleAIReply}
                                generatingReply={generatingReply}
                            />
                        ) : (
                            <ComposeForm
                                ref={composeFormRef}
                                showAnimation={true}
                                onCancel={() => setShowReply(false)}
                            />
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
                            <AssistantPanel
                                composeFormRef={showReply ? composeFormRef : undefined}
                                onClose={toggleAssistant}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
