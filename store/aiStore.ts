import { create } from "zustand";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    action?: PendingAction;
}

export interface PendingAction {
    type: "compose" | "search" | "navigate" | "filter" | "send" | "reply";
    data: any;
    confirmed: boolean;
}

export interface AIContext {
    currentEmailId?: string;
    currentView: "inbox" | "sent" | "compose";
    lastAction?: string;
}

interface AIStore {
    messages: ChatMessage[];
    pendingAction: PendingAction | null;
    context: AIContext;
    isProcessing: boolean;

    addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
    setPendingAction: (action: PendingAction | null) => void;
    confirmAction: () => void;
    cancelAction: () => void;
    updateContext: (context: Partial<AIContext>) => void;
    setIsProcessing: (processing: boolean) => void;
    reset: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
    messages: [],
    pendingAction: null,
    context: {
        currentView: "inbox",
    },
    isProcessing: false,

    addMessage: (message) =>
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    ...message,
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date(),
                },
            ],
        })),

    setPendingAction: (action) => set({ pendingAction: action }),

    confirmAction: () =>
        set((state) => ({
            pendingAction: state.pendingAction
                ? { ...state.pendingAction, confirmed: true }
                : null,
        })),

    cancelAction: () => set({ pendingAction: null }),

    updateContext: (context) =>
        set((state) => ({
            context: { ...state.context, ...context },
        })),

    setIsProcessing: (processing) => set({ isProcessing: processing }),

    reset: () =>
        set({
            messages: [],
            pendingAction: null,
            context: { currentView: "inbox" },
            isProcessing: false,
        }),
}));
