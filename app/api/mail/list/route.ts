import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { listEmails } from "@/lib/gmail/operations";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const labelId = searchParams.get("labelId") || "INBOX";
        const maxResults = parseInt(searchParams.get("maxResults") || "50");

        const emails = await listEmails(session.accessToken, labelId, maxResults);

        return NextResponse.json({ emails });
    } catch (error: any) {
        console.error("Error fetching emails:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch emails" },
            { status: 500 }
        );
    }
}
