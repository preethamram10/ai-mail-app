"use client";

import { useState } from "react";
import { ComposeEmailData } from "@/types/email";
import { Send, X, Minimize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<ComposeEmailData>;
    initialAIOpen?: boolean;
}

export function ComposeModal({ isOpen, onClose, initialData, initialAIOpen = false }: ComposeModalProps) {
    const [formData, setFormData] = useState<ComposeEmailData>({
        to: initialData?.to || "",
        subject: initialData?.subject || "",
        body: initialData?.body || "",
        cc: initialData?.cc || "",
        bcc: initialData?.bcc || "",
    });

    const [isSending, setIsSending] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showAI, setShowAI] = useState(initialAIOpen);
    const [aiMessage, setAiMessage] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

    const handleAIRequest = async () => {
        if (!aiMessage.trim()) return;

        setAiLoading(true);
        setAiResponse("");

        try {
            const response = await fetch("/api/ai/compose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: aiMessage,
                    currentData: formData
                }),
            });

            if (!response.ok) throw new Error("AI request failed");

            const data = await response.json();

            // Update form with AI suggestions
            if (data.to) setFormData(prev => ({ ...prev, to: data.to }));
            if (data.subject) setFormData(prev => ({ ...prev, subject: data.subject }));
            if (data.body) setFormData(prev => ({ ...prev, body: data.body }));

            setAiResponse(data.message || "Email draft created!");
            toast.success("AI filled in the email!");
        } catch (error) {
            console.error("AI error:", error);
            setAiResponse("Sorry, I couldn't process that. Please try again.");
            toast.error("AI assistant unavailable");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.to || !formData.subject || !formData.body) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch("/api/mail/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to send email");
            }

            toast.success("Email sent successfully!");

            // Reset and close
            setFormData({
                to: "",
                subject: "",
                body: "",
                cc: "",
                bcc: "",
            });
            onClose();
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Failed to send email");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: isMinimized ? 0.3 : 1,
                            y: isMinimized ? 400 : 0,
                            x: isMinimized ? -600 : 0
                        }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex">
                            {/* Main Form */}
                            <div className="flex-1 flex flex-col">
                                {/* Header */}
                                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">New Message</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowAI(!showAI)}
                                            className={`p-2 rounded-lg transition-colors ${showAI ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                            title="AI Assistant"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsMinimized(!isMinimized)}
                                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                                            title="Minimize"
                                        >
                                            <Minimize2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                                            title="Close"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {!isMinimized && (
                                    <>
                                        {/* Form */}
                                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                            {/* To Field */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    To <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.to}
                                                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                                    placeholder="recipient@example.com"
                                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            {/* Subject Field */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Subject <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    placeholder="Email subject"
                                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>

                                            {/* Body Field */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Message <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={formData.body}
                                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                                    placeholder="Write your message..."
                                                    rows={10}
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                {!formData.to || !formData.subject || !formData.body
                                                    ? "Fill in all required fields"
                                                    : "Ready to send"}
                                            </div>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSending || !formData.to || !formData.subject || !formData.body}
                                                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                            >
                                                <Send className="w-4 h-4" />
                                                {isSending ? "Sending..." : "Send"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* AI Assistant Panel */}
                            {showAI && !isMinimized && (
                                <div className="w-80 border-l border-border flex flex-col">
                                    <div className="px-4 py-3 border-b border-border">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            AI Assistant
                                        </h3>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Tell me what email you want to write, and I'll help you compose it!
                                        </p>

                                        {aiResponse && (
                                            <div className="bg-accent p-3 rounded-lg text-sm">
                                                {aiResponse}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Try saying:</p>
                                            <button
                                                onClick={() => setAiMessage("Write a professional email about project submission")}
                                                className="text-xs text-left w-full p-2 bg-accent/50 hover:bg-accent rounded text-muted-foreground"
                                            >
                                                "Write a professional email about project submission"
                                            </button>
                                            <button
                                                onClick={() => setAiMessage("Write a thank you email")}
                                                className="text-xs text-left w-full p-2 bg-accent/50 hover:bg-accent rounded text-muted-foreground"
                                            >
                                                "Write a thank you email"
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border space-y-2">
                                        <textarea
                                            value={aiMessage}
                                            onChange={(e) => setAiMessage(e.target.value)}
                                            placeholder="Describe the email you want to write..."
                                            rows={3}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAIRequest();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleAIRequest}
                                            disabled={aiLoading || !aiMessage.trim()}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            {aiLoading ? "Thinking..." : "Generate Email"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
