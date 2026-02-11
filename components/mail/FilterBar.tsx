"use client";

import { useState } from "react";
import { EmailFilters } from "@/types/email";
import { Search, Filter, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
    onFilterChange: (filters: EmailFilters) => void;
    initialFilters?: EmailFilters;
}

export function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
    const [filters, setFilters] = useState<EmailFilters>(initialFilters);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const updateFilters = (newFilters: Partial<EmailFilters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const hasActiveFilters = Object.keys(filters).some(
        (key) => filters[key as keyof EmailFilters] !== undefined
    );

    return (
        <div className="border-b border-border bg-background">
            <div className="px-6 py-3">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={filters.query || ""}
                            onChange={(e) => updateFilters({ query: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`p-2 rounded-lg transition-colors ${showAdvanced ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            }`}
                        title="Advanced filters"
                    >
                        <Filter className="w-4 h-4" />
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Clear filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Advanced Filters */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-border"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* From Filter */}
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                                        From
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="sender@example.com"
                                        value={filters.from || ""}
                                        onChange={(e) => updateFilters({ from: e.target.value })}
                                        className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                                        After Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type="date"
                                            value={
                                                filters.after
                                                    ? new Date(filters.after).toISOString().split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                updateFilters({
                                                    after: e.target.value ? new Date(e.target.value) : undefined,
                                                })
                                            }
                                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                                        Before Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type="date"
                                            value={
                                                filters.before
                                                    ? new Date(filters.before).toISOString().split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                updateFilters({
                                                    before: e.target.value ? new Date(e.target.value) : undefined,
                                                })
                                            }
                                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-4 mt-3">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.isUnread || false}
                                        onChange={(e) => updateFilters({ isUnread: e.target.checked || undefined })}
                                        className="rounded border-border"
                                    />
                                    <span>Unread only</span>
                                </label>

                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.hasAttachment || false}
                                        onChange={(e) =>
                                            updateFilters({ hasAttachment: e.target.checked || undefined })
                                        }
                                        className="rounded border-border"
                                    />
                                    <span>Has attachments</span>
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
