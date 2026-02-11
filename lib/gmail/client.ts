import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export function createGmailClient(accessToken: string) {
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({
        access_token: accessToken,
    });

    return google.gmail({
        version: "v1",
        auth: oauth2Client,
    });
}

export async function refreshAccessToken(refreshToken: string) {
    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token;
}
