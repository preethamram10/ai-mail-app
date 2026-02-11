"use client";

import { usePathname, useRouter } from "next/navigation";
import { Inbox, Send, Trash2, Edit, Sparkles, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarProps {
    emailCounts?: {
        inbox: number;
        sent: number;
        trash: number;
    };
    onCompose?: () => void;
}

export function Sidebar({ emailCounts, onCompose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const navItems = [
        {
            name: "Inbox",
            icon: Inbox,
            path: "/inbox",
            count: emailCounts?.inbox,
        },
        {
            name: "Sent",
            icon: Send,
            path: "/sent",
            count: emailCounts?.sent,
        },
        {
            name: "Trash",
            icon: Trash2,
            path: "/trash",
            count: emailCounts?.trash,
        },
    ];

    return (
        <div className="w-64 h-full bg-background border-r border-border flex flex-col">
            {/* Profile Section */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm truncate">{session?.user?.name || "User"}</h2>
                        <p className="text-xs text-muted-foreground truncate" title={session?.user?.email || ""}>
                            {session?.user?.email || "user@example.com"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Compose Button */}
            <div className="p-4">
                <button
                    onClick={onCompose || (() => router.push("/compose"))}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                    <Edit className="w-5 h-5" />
                    <span className="font-medium">Compose</span>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <motion.button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors",
                                isActive
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "hover:bg-accent/50 text-muted-foreground"
                            )}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {item.count}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
