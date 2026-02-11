import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { listTrashedEmails, restoreEmail } from "@/lib/gmail/operations";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const emails = await listTrashedEmails(session.accessToken);

        return NextResponse.json({ emails });
    } catch (error: any) {
        console.error("Error fetching trashed emails:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch trashed emails" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { emailId } = await req.json();

        if (!emailId) {
            return NextResponse.json(
                { error: "Email ID is required" },
                { status: 400 }
            );
        }

        await restoreEmail(session.accessToken, emailId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error restoring email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to restore email" },
            { status: 500 }
        );
    }
}
