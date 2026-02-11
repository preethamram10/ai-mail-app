"use client";

import { useEffect, useRef } from "react";
import { ComposeForm, ComposeFormRef } from "@/components/mail/ComposeForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { useMailStore } from "@/store/mailStore";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComposePage() {
    const router = useRouter();
    const composeFormRef = useRef<ComposeFormRef>(null);
    const { setCurrentView } = useMailStore();

    useEffect(() => {
        setCurrentView("compose");
    }, [setCurrentView]);

    return (
        <div className="h-screen flex bg-background">
            {/* Sidebar */}
            <Sidebar emailCounts={{ inbox: 0, sent: 0, trash: 0 }} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Edit className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Compose Email</h1>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <ComposeForm
                        ref={composeFormRef}
                        showAnimation={true}
                        onCancel={() => router.back()}
                    />
                </div>
            </div>
        </div>
    );
}
