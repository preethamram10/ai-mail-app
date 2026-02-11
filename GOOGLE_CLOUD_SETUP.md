# Google Cloud Setup Guide

This guide walks you through setting up Google Cloud services for the AI-Powered Mail application.

## Prerequisites
- Google account
- Credit card (for Google Cloud - free tier available)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: "AI Mail Client"
5. Click "Create"
6. Wait for project creation to complete

## Step 2: Enable Gmail API

1. In the Google Cloud Console, ensure your new project is selected
2. Navigate to "APIs & Services" > "Library" (left sidebar)
3. Search for "Gmail API"
4. Click on "Gmail API" from results
5. Click "Enable"
6. Wait for activation

## Step 3: Enable Gemini API

1. Still in "APIs & Services" > "Library"
2. Search for "Generative Language API"
3. Click on it
4. Click "Enable"
5. After enabling, go to "Credentials" tab
6. Click "Create Credentials" > "API Key"
7. Copy the API key and save it securely
8. (Optional) Click "Restrict Key" to limit usage to Generative Language API only

## Step 4: Configure OAuth 2.0 Credentials

### 4.1: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required fields:
   - **App name**: AI Mail Client
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Filter for Gmail scopes and add:
   - `.../auth/gmail.readonly`
   - `.../auth/gmail.send`
   - `.../auth/gmail.modify`
   - `.../auth/gmail.compose`
8. Click "Update" then "Save and Continue"
9. On "Test users" page, click "Add Users"
10. Add your Gmail address(es) that you'll use for testing
11. Click "Save and Continue"
12. Review and click "Back to Dashboard"

### 4.2: Create OAuth Client ID

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: Select "Web application"
4. Name: "AI Mail Web Client"
5. Under "Authorized redirect URIs", click "Add URI"
6. Add: `http://localhost:3000/api/auth/callback/google`
7. For production, also add your deployed URL:
   - `https://your-domain.com/api/auth/callback/google`
8. Click "Create"
9. **Important**: Copy the Client ID and Client Secret
10. Click "OK"

## Step 5: Set Up Environment Variables

1. In your project directory, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-random-secret>
   
   GOOGLE_CLIENT_ID=<your-oauth-client-id>
   GOOGLE_CLIENT_SECRET=<your-oauth-client-secret>
   
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

3. Generate NEXTAUTH_SECRET:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser

3. Click "Continue with Google"

4. You should see the OAuth consent screen

5. **Important**: If you see a warning "This app isn't verified":
   - This is normal for apps in testing mode
   - Click "Advanced"
   - Click "Go to AI Mail Client (unsafe)"
   - This is safe because it's your own app

6. Grant the requested permissions

7. You should be redirected to the inbox

8. If you see emails, congratulations! Setup is complete.

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that the redirect URI in Google Cloud Console exactly matches:
  - `http://localhost:3000/api/auth/callback/google`
- No trailing slash
- Exact protocol (http vs https)

### "Error 403: access_denied"
- Make sure your email is added as a test user in OAuth consent screen
- Check that all required Gmail scopes are added

### "Invalid API Key" for Gemini
- Verify the API key is correct in `.env.local`
- Check that Generative Language API is enabled
- Make sure there are no extra spaces in the key

### No emails showing
- Check browser console for errors
- Verify Gmail API is enabled
- Check that OAuth scopes include `gmail.readonly`

### AI Assistant not responding
- Check that GEMINI_API_KEY is set correctly
- Verify Generative Language API is enabled
- Check browser console for errors

## Production Deployment

When deploying to production:

1. **Update OAuth Redirect URIs**:
   - Add your production URL to authorized redirect URIs
   - Example: `https://your-app.vercel.app/api/auth/callback/google`

2. **Verify OAuth Consent Screen**:
   - For public use, submit for verification
   - This process can take several days
   - Until verified, users will see "unverified app" warning

3. **Update Environment Variables**:
   - Set `NEXTAUTH_URL` to your production URL
   - Use the same OAuth credentials
   - Keep NEXTAUTH_SECRET secure

4. **Enable Production APIs**:
   - Consider setting up billing alerts
   - Monitor API usage
   - Set up quotas if needed

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** periodically
3. **Use environment-specific credentials** for dev/staging/prod
4. **Enable 2FA** on your Google Cloud account
5. **Monitor API usage** for unusual activity
6. **Set up billing alerts** to avoid unexpected charges

## Cost Considerations

- **Gmail API**: Free for up to 1 billion quota units/day
- **Gemini API**: Free tier available, then pay-per-use
- **Google Cloud**: Free tier includes $300 credit for 90 days

For this assignment, you should stay well within free tier limits.

## Support

If you encounter issues:
1. Check the [Gmail API documentation](https://developers.google.com/gmail/api)
2. Review [Gemini API docs](https://ai.google.dev/docs)
3. Check [NextAuth.js documentation](https://next-auth.js.org/)

---

**Setup complete! You're ready to build with AI-powered email.** 🚀
