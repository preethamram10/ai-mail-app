import { create } from "zustand";
import { EmailListItem, EmailDetail, EmailFilters } from "@/types/email";

interface MailStore {
    emails: EmailListItem[];
    currentEmail: EmailDetail | null;
    filters: EmailFilters;
    currentView: "inbox" | "sent" | "compose" | "trash";
    isLoading: boolean;

    setEmails: (emails: EmailListItem[]) => void;
    setCurrentEmail: (email: EmailDetail | null) => void;
    updateFilters: (filters: Partial<EmailFilters>) => void;
    setCurrentView: (view: "inbox" | "sent" | "compose" | "trash") => void;
    setIsLoading: (loading: boolean) => void;
    addEmail: (email: EmailListItem) => void;
    reset: () => void;
}

export const useMailStore = create<MailStore>((set) => ({
    emails: [],
    currentEmail: null,
    filters: {},
    currentView: "inbox",
    isLoading: false,

    setEmails: (emails) => set({ emails }),
    setCurrentEmail: (email) => set({ currentEmail: email }),
    updateFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
    setCurrentView: (view) => set({ currentView: view }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    addEmail: (email) =>
        set((state) => ({ emails: [email, ...state.emails] })),
    reset: () =>
        set({
            emails: [],
            currentEmail: null,
            filters: {},
            currentView: "inbox",
            isLoading: false,
        }),
}));
