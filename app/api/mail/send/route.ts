import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendEmail } from "@/lib/gmail/operations";
import { ComposeEmailData } from "@/types/email";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const emailData: ComposeEmailData = await request.json();

        // Validate email data
        if (!emailData.to || !emailData.subject || !emailData.body) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const emailId = await sendEmail(session.accessToken, emailData);

        return NextResponse.json({ success: true, emailId });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send email" },
            { status: 500 }
        );
    }
}
