import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEmail, markAsRead } from "@/lib/gmail/operations";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = await getEmail(session.accessToken, params.id);

        return NextResponse.json({ email });
    } catch (error: any) {
        console.error("Error fetching email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch email" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action } = await request.json();

        if (action === "markAsRead") {
            await markAsRead(session.accessToken, params.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update email" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { trashEmail } = await import("@/lib/gmail/operations");
        await trashEmail(session.accessToken, params.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete email" },
            { status: 500 }
        );
    }
}

