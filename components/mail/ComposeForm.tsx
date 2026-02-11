"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { ComposeEmailData } from "@/types/email";
import { Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ComposeFormProps {
    initialData?: Partial<ComposeEmailData>;
    onSend?: (data: ComposeEmailData) => Promise<void>;
    onCancel?: () => void;
    showAnimation?: boolean;
}

export interface ComposeFormRef {
    fillForm: (data: Partial<ComposeEmailData>) => void;
    getFormData: () => ComposeEmailData;
    submit: () => Promise<void>;
}

export const ComposeForm = forwardRef<ComposeFormRef, ComposeFormProps>(
    ({ initialData, onSend, onCancel, showAnimation = false }, ref) => {
        const [formData, setFormData] = useState<ComposeEmailData>({
            to: initialData?.to || "",
            subject: initialData?.subject || "",
            body: initialData?.body || "",
            cc: initialData?.cc || "",
            bcc: initialData?.bcc || "",
        });

        const [isSending, setIsSending] = useState(false);
        const [showCc, setShowCc] = useState(!!initialData?.cc);
        const [showBcc, setShowBcc] = useState(!!initialData?.bcc);
        const [animatingField, setAnimatingField] = useState<string | null>(null);

        // Expose methods to parent/AI
        useImperativeHandle(ref, () => ({
            fillForm: (data: Partial<ComposeEmailData>) => {
                setFormData((prev) => ({ ...prev, ...data }));

                // Show animation for AI-filled fields
                if (showAnimation) {
                    Object.keys(data).forEach((key, index) => {
                        setTimeout(() => {
                            setAnimatingField(key);
                            setTimeout(() => setAnimatingField(null), 500);
                        }, index * 200);
                    });
                }
            },
            getFormData: () => formData,
            submit: async () => {
                await handleSubmit();
            },
        }));

        const handleSubmit = async () => {
            if (!formData.to || !formData.subject || !formData.body) {
                toast.error("Please fill in all required fields");
                return;
            }

            setIsSending(true);

            try {
                if (onSend) {
                    await onSend(formData);
                } else {
                    const response = await fetch("/api/mail/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to send email");
                    }
                }

                toast.success("Email sent successfully!");

                // Reset form
                setFormData({
                    to: "",
                    subject: "",
                    body: "",
                    cc: "",
                    bcc: "",
                });
            } catch (error) {
                console.error("Error sending email:", error);
                toast.error("Failed to send email");
            } finally {
                setIsSending(false);
            }
        };

        return (
            <div className="h-full flex flex-col bg-background">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">New Message</h2>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* To Field */}
                    <FormField
                        label="To"
                        value={formData.to}
                        onChange={(value) => setFormData({ ...formData, to: value })}
                        placeholder="recipient@example.com"
                        required
                        isAnimating={animatingField === "to"}
                    />

                    {/* Cc/Bcc Toggle */}
                    <div className="flex gap-2">
                        {!showCc && (
                            <button
                                onClick={() => setShowCc(true)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Cc
                            </button>
                        )}
                        {!showBcc && (
                            <button
                                onClick={() => setShowBcc(true)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Bcc
                            </button>
                        )}
                    </div>

                    {/* Cc Field */}
                    <AnimatePresence>
                        {showCc && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <FormField
                                    label="Cc"
                                    value={formData.cc || ""}
                                    onChange={(value) => setFormData({ ...formData, cc: value })}
                                    placeholder="cc@example.com"
                                    isAnimating={animatingField === "cc"}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bcc Field */}
                    <AnimatePresence>
                        {showBcc && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <FormField
                                    label="Bcc"
                                    value={formData.bcc || ""}
                                    onChange={(value) => setFormData({ ...formData, bcc: value })}
                                    placeholder="bcc@example.com"
                                    isAnimating={animatingField === "bcc"}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Subject Field */}
                    <FormField
                        label="Subject"
                        value={formData.subject}
                        onChange={(value) => setFormData({ ...formData, subject: value })}
                        placeholder="Email subject"
                        required
                        isAnimating={animatingField === "subject"}
                    />

                    {/* Body Field */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <motion.textarea
                            value={formData.body}
                            onChange={(e) =>
                                setFormData({ ...formData, body: e.target.value })
                            }
                            placeholder="Write your message..."
                            rows={12}
                            className={`w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${animatingField === "body" ? "ring-2 ring-primary" : ""
                                }`}
                            animate={
                                animatingField === "body"
                                    ? { scale: [1, 1.01, 1] }
                                    : { scale: 1 }
                            }
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
                        disabled={
                            isSending || !formData.to || !formData.subject || !formData.body
                        }
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        <Send className="w-4 h-4" />
                        {isSending ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        );
    }
);

ComposeForm.displayName = "ComposeForm";

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    isAnimating?: boolean;
}

function FormField({
    label,
    value,
    onChange,
    placeholder,
    required,
    isAnimating,
}: FormFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <motion.input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${isAnimating ? "ring-2 ring-primary" : ""
                    }`}
                animate={isAnimating ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            />
        </div>
    );
}
