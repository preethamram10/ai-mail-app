import { create } from "zustand";

interface UIStore {
    sidebarOpen: boolean;
    assistantOpen: boolean;
    theme: "light" | "dark";

    toggleSidebar: () => void;
    toggleAssistant: () => void;
    setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    assistantOpen: true,
    theme: "light",

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleAssistant: () =>
        set((state) => ({ assistantOpen: !state.assistantOpen })),
    setTheme: (theme) => set({ theme }),
}));
