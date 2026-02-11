"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailList } from "@/components/mail/EmailList";
import { FilterBar } from "@/components/mail/FilterBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ComposeModal } from "@/components/mail/ComposeModal";
import { useMailStore } from "@/store/mailStore";
import type { EmailFilters } from "@/types/email";
import { Inbox as InboxIcon } from "lucide-react";

export default function InboxPage() {
    const [composeOpen, setComposeOpen] = useState(false);
    const { emails, setEmails, updateFilters, setCurrentView } = useMailStore();
    const [filters, setFilters] = useState<EmailFilters>({});

    useEffect(() => {
        setCurrentView("inbox");
    }, [setCurrentView]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["emails", "inbox"],
        queryFn: async () => {
            const response = await fetch("/api/mail/list?labelId=INBOX");
            if (!response.ok) throw new Error("Failed to fetch emails");
            return response.json();
        },
    });

    useEffect(() => {
        if (data?.emails) {
            setEmails(data.emails);
        }
    }, [data, setEmails]);

    const handleFilterChange = async (newFilters: EmailFilters) => {
        setFilters(newFilters);
        updateFilters(newFilters);

        if (Object.keys(newFilters).length === 0) {
            refetch();
            return;
        }

        const response = await fetch("/api/mail/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFilters),
        });

        if (response.ok) {
            const { emails: filteredEmails } = await response.json();
            setEmails(filteredEmails);
        }
    };

    return (
        <div className="h-screen flex bg-background">
            {/* Sidebar */}
            <Sidebar
                emailCounts={{ inbox: emails.length, sent: 0, trash: 0 }}
                onCompose={() => setComposeOpen(true)}
            />

            {/* Compose Modal */}
            <ComposeModal
                isOpen={composeOpen}
                onClose={() => setComposeOpen(false)}
                initialAIOpen={true}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <InboxIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <p className="text-sm text-muted-foreground">
                                {emails.length} email{emails.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setComposeOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:opacity-90"
                    >
                        <span className="text-sm font-medium">✨ AI Compose</span>
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Email List */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-muted-foreground">Loading emails...</p>
                                    </div>
                                </div>
                            ) : (
                                <EmailList emails={emails} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
