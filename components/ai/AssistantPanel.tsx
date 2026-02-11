"use client";

import { useState, useRef, useEffect } from "react";
import { useAIStore, ChatMessage, PendingAction } from "@/store/aiStore";
import { useMailStore } from "@/store/mailStore";
import { Send, Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { executeFunction } from "@/lib/ai/executor";
import toast from "react-hot-toast";
import { ActionPreview } from "./ActionPreview";

interface AssistantPanelProps {
    composeFormRef?: any;
    onClose?: () => void;
}

export function AssistantPanel({ composeFormRef, onClose }: AssistantPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {
        messages,
        pendingAction,
        context,
        isProcessing,
        addMessage,
        setPendingAction,
        confirmAction,
        cancelAction,
        updateContext,
        setIsProcessing,
    } = useAIStore();

    const { currentEmail, currentView } = useMailStore();

    // Update context when view or email changes
    useEffect(() => {
        updateContext({
            currentView,
            currentEmailId: currentEmail?.id,
        });
    }, [currentEmail, currentView, updateContext]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message
        addMessage({
            role: "user",
            content: userMessage,
        });

        setIsProcessing(true);

        try {
            // Send to AI API
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    context,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const { text, functionCalls } = await response.json();

            // Add AI response
            if (text) {
                addMessage({
                    role: "assistant",
                    content: text,
                });
            }

            // Handle function calls
            if (functionCalls && functionCalls.length > 0) {
                const functionCall = functionCalls[0]; // Handle first function call

                // Check if this needs confirmation
                if (needsConfirmation(functionCall.name)) {
                    setPendingAction({
                        type: functionCall.name,
                        data: functionCall.args,
                        confirmed: false,
                    });
                } else {
                    // Execute immediately
                    await executeAction(functionCall);
                }
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            addMessage({
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            });
            toast.error("Failed to process message");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        confirmAction();

        try {
            await executeAction({
                name: pendingAction.type,
                args: pendingAction.data,
            });

            setPendingAction(null);
        } catch (error: any) {
            console.error("Error executing action:", error);
            toast.error("Failed to execute action");
        }
    };

    const handleCancelAction = () => {
        cancelAction();
        setPendingAction(null);
        addMessage({
            role: "assistant",
            content: "Action cancelled.",
        });
    };

    const executeAction = async (functionCall: any) => {
        const result = await executeFunction(functionCall, composeFormRef);

        if (result.success) {
            addMessage({
                role: "assistant",
                content: result.message,
            });
            toast.success(result.message);
        } else {
            addMessage({
                role: "assistant",
                content: `Error: ${result.message}`,
            });
            toast.error(result.message);
        }
    };

    const needsConfirmation = (functionName: string): boolean => {
        return functionName === "sendEmail";
    };

    return (
        <div className="h-full flex flex-col bg-background border-l border-border">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">
                            Control your inbox with natural language
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-accent rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium mb-1">
                            Hi! I'm your AI email assistant
                        </p>
                        <p className="text-xs">
                            Try: "Show me emails from last week" or "Compose an email to..."
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <ChatMessageItem key={message.id} message={message} />
                ))}

                {isProcessing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Pending Action */}
            <AnimatePresence>
                {pendingAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 pb-4"
                    >
                        <ActionPreview
                            action={pendingAction}
                            onConfirm={handleConfirmAction}
                            onCancel={handleCancelAction}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask me anything..."
                        rows={2}
                        className="flex-1 px-3 py-2 bg-accent/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-foreground"
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </motion.div>
    );
}
