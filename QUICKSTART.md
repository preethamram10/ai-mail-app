# Quick Start Guide

Get the AI-Powered Mail application running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Google account
- 10 minutes for Google Cloud setup

## Step 1: Install Dependencies ✅

Dependencies are already installed! Skip to Step 2.

## Step 2: Google Cloud Setup (10 minutes)

Follow the detailed guide: [`GOOGLE_CLOUD_SETUP.md`](./GOOGLE_CLOUD_SETUP.md)

**Quick checklist:**
- [ ] Create Google Cloud Project
- [ ] Enable Gmail API
- [ ] Enable Gemini API (Generative Language API)
- [ ] Create OAuth 2.0 credentials
- [ ] Add yourself as test user
- [ ] Copy Client ID, Client Secret, and Gemini API Key

## Step 3: Configure Environment Variables

1. Copy the example file:
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

3. Generate `NEXTAUTH_SECRET`:
   ```bash
   # Mac/Linux:
   openssl rand -base64 32
   
   # Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

## Step 4: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Sign In

1. Click "Continue with Google"
2. If you see "This app isn't verified":
   - Click "Advanced"
   - Click "Go to AI Mail Client (unsafe)" - it's safe, it's your app!
3. Grant permissions
4. You're in!

## Step 6: Try the AI Assistant

Click the "AI Assistant" button and try these commands:

### Compose an Email
```
Send an email to john@example.com with subject "Test" and body "Hello from AI Mail!"
```
Watch the compose form fill automatically with animation!

### Search Emails
```
Show me emails from last week
```
See the inbox filter and update!

### Navigate
```
Open the latest email
```
Watch it navigate to the email detail!

### Context-Aware Reply
1. Open any email
2. In AI assistant: `Reply to this email`
3. Watch the reply form pre-fill!

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check OAuth redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`

### "Error 403: access_denied"
- Add your email as a test user in OAuth consent screen

### No emails showing
- Check browser console for errors
- Verify Gmail API is enabled
- Check OAuth scopes include `gmail.readonly`

### AI not responding
- Verify `GEMINI_API_KEY` is correct
- Check Generative Language API is enabled

## Next Steps

- Read [`README.md`](./README.md) for full documentation
- Check [`walkthrough.md`](./walkthrough.md) for architecture details
- Explore the code in `app/`, `components/`, and `lib/`

## Key Files to Explore

- [`components/ai/AssistantPanel.tsx`](./components/ai/AssistantPanel.tsx) - AI chat interface
- [`lib/ai/executor.ts`](./lib/ai/executor.ts) - How AI controls the UI
- [`components/mail/ComposeForm.tsx`](./components/mail/ComposeForm.tsx) - Form with AI control
- [`lib/gmail/operations.ts`](./lib/gmail/operations.ts) - Gmail API wrapper

---

**You're all set! Enjoy your AI-powered email client!** 🚀
