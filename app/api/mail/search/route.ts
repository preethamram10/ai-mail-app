import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { searchEmails } from "@/lib/gmail/operations";
import { EmailFilters } from "@/types/email";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const filters: EmailFilters = await request.json();

        // Convert date strings to Date objects
        if (filters.after && typeof filters.after === "string") {
            filters.after = new Date(filters.after);
        }
        if (filters.before && typeof filters.before === "string") {
            filters.before = new Date(filters.before);
        }

        const emails = await searchEmails(session.accessToken, filters);

        return NextResponse.json({ emails });
    } catch (error: any) {
        console.error("Error searching emails:", error);
        return NextResponse.json(
            { error: error.message || "Failed to search emails" },
            { status: 500 }
        );
    }
}
