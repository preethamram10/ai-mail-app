import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    } else if (days === 1) {
        return "Yesterday";
    } else if (days < 7) {
        return dateObj.toLocaleDateString("en-US", { weekday: "short" });
    } else {
        return dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }
}

export function extractEmailAddress(emailString: string): string {
    const match = emailString.match(/<(.+?)>/);
    return match ? match[1] : emailString;
}

export function extractDisplayName(emailString: string): string {
    const match = emailString.match(/^(.+?)\s*</);
    return match ? match[1].replace(/"/g, "") : emailString;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}
