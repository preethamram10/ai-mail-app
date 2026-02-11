# AI-Powered Mail Web Application

An intelligent email client with an AI assistant that can control the UI programmatically through natural language commands.

![AI Mail](https://img.shields.io/badge/AI-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Gmail API](https://img.shields.io/badge/Gmail-API-red) ![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple)

## 🌟 Features

### ✅ Core Email Functionality
- **Inbox & Sent Views** - Browse received and sent emails with real-time updates
- **Email Detail** - Read full email content with HTML rendering (sanitized)
- **Compose & Send** - Write and send emails with To, Subject, and Body fields
- **Search & Filter** - Advanced filtering by sender, date range, read/unread status, and keywords

### 🤖 AI Assistant - **The Star Feature**
The AI assistant doesn't just answer questions—it **controls the UI** and executes actions:

- **Compose Emails** - "Send an email to john@example.com with subject 'Meeting Tomorrow' and body 'Let's meet at 3pm'"
  - Opens compose view
  - Fills fields visibly with animation
  - Waits for user confirmation before sending

- **Search & Display** - "Show me emails from the last 10 days"
  - Queries emails with filters
  - Updates main UI to show results (not just text response)

- **Navigate** - "Open the latest email from David"
  - Navigates to and displays specific email in detail view

- **Context Awareness** - "Reply to this" (while reading an email)
  - Knows which email is open
  - Pre-fills reply with context

- **Human-in-the-Loop** - Confirmation dialogs for sensitive actions like sending emails

### 🎨 Premium UI/UX
- Modern, vibrant design with glassmorphism effects
- Dark mode support
- Smooth animations with Framer Motion
- Responsive layout
- Custom scrollbars and micro-interactions

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Email Integration**: Gmail API, googleapis
- **AI**: Google Gemini API with function calling
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **Authentication**: NextAuth.js with Google OAuth

### Project Structure
```
client-assign/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── mail/          # Mail operations
│   │   └── ai/            # AI assistant
│   ├── inbox/             # Inbox page
│   ├── sent/              # Sent page
│   ├── compose/           # Compose page
│   └── email/[id]/        # Email detail page
├── components/            # React components
│   ├── mail/             # Email components
│   └── ai/               # AI assistant components
├── lib/                  # Core libraries
│   ├── gmail/            # Gmail API wrapper
│   └── ai/               # AI integration
├── store/                # Zustand stores
└── types/                # TypeScript types
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with:
  - Gmail API enabled
  - Gemini API enabled
  - OAuth 2.0 credentials configured

### Step 1: Google Cloud Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Gmail API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it

3. **Enable Gemini API**
   - In the API Library, search for "Generative Language API"
   - Enable it and create an API key

4. **Set up OAuth 2.0**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret

5. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - User Type: "External" (for testing)
   - Add test users (your Gmail accounts)
   - Scopes: Add Gmail scopes (will be requested automatically)

### Step 2: Local Setup

1. **Clone and Install**
   ```bash
   cd "Client Assign"
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your credentials:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-here
   
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   GEMINI_API_KEY=your-gemini-api-key
   ```

   Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Sign in with your Google account
   - Grant Gmail permissions

## 🎯 How to Use

### Basic Email Operations
1. **View Inbox** - See all received emails on the main page
2. **Read Email** - Click any email to view full content
3. **Compose** - Click "Compose" or navigate to `/compose`
4. **Send** - Fill in To, Subject, Body and click Send

### AI Assistant Commands

Click the "AI Assistant" button to open the assistant panel. Try these commands:

**Compose & Send:**
```
Send an email to john@example.com with subject "Project Update" and body "The project is on track"
```

**Search:**
```
Show me emails from Sarah
Find emails from last week
Show unread emails
```

**Navigate:**
```
Open the latest email
Open the email from David about the meeting
```

**Filter:**
```
Show me emails from the last 10 days
Filter emails from john@example.com
Show only unread emails
```

**Context-Aware:**
```
(While viewing an email)
Reply to this email
```

## 🏆 Assignment Criteria Met

| Criteria | Status | Implementation |
|----------|--------|----------------|
| Mail integration works | ✅ | Gmail API with OAuth 2.0 |
| Inbox and Sent views | ✅ | Full email list with metadata |
| Compose and send via UI | ✅ | Complete form with validation |
| **AI composes/fills form** | ✅ | **Visible field filling with animation** |
| **AI searches and updates UI** | ✅ | **Main UI updates with filtered results** |
| **AI is context-aware** | ✅ | **Knows current view and open email** |
| Real-time mail sync | ⏳ | Planned with Pub/Sub (see below) |

### Bonus Features Implemented
- ✅ Reply/forward via assistant (+5 points)
- ✅ Confirmation before sending (+5 points)
- ✅ Rich UI in assistant panel (+5 points)
- ✅ Polished UI with dark mode (+2 points)
- ⏳ Tests (planned, +3 points)
- ⏳ Deployed demo (planned, +2 points)

**Total Bonus: +17 points (out of +25 possible)**

## 🎨 Design Decisions

### Why Next.js?
- **Server-Side Rendering** for better performance
- **API Routes** eliminate need for separate backend
- **App Router** for modern React patterns
- Built-in optimization for production

### Why Gemini over OpenAI?
- **Native Google integration** - Same ecosystem as Gmail
- **Function calling** - Perfect for structured UI control
- **Assignment requirement** - Specifically requested
- **Cost-effective** - Competitive pricing

### Why Zustand?
- **Lightweight** - Minimal boilerplate
- **Simple API** - Easy to learn
- **Performance** - No unnecessary re-renders
- **TypeScript** - Excellent type inference

### AI Function Calling Architecture
The AI assistant uses Gemini's function calling feature to control the UI:

1. User sends natural language command
2. Gemini analyzes intent and calls appropriate function
3. Function executor updates Zustand stores
4. React components re-render with new state
5. UI updates visibly (with animations for AI-triggered changes)

This creates a seamless experience where the AI **paints the UI** rather than just responding with text.

## 🔧 What Would Be Improved with More Time

### Real-Time Sync (Partially Implemented)
- **Current**: Manual refresh required
- **Planned**: Google Cloud Pub/Sub integration
  - Set up Gmail push notifications
  - Webhook endpoint to receive notifications
  - Server-Sent Events (SSE) to push updates to clients
  - Instant inbox updates when new emails arrive

### Additional Features
- **Thread/Conversation View** - Group related emails
- **Attachment Support** - Upload and download files
- **Rich Text Editor** - Better compose experience with formatting
- **Email Templates** - Pre-defined email formats
- **Advanced Search** - More filter options and saved searches
- **Offline Support** - Service worker for offline access
- **Email Scheduling** - Send emails later
- **AI Suggestions** - Smart compose, auto-categorization
- **Email Labels/Folders** - Better organization
- **Bulk Actions** - Select multiple emails

### Testing
- Unit tests for core functions (Gmail operations, AI executor)
- Integration tests for API routes
- E2E tests with Playwright for critical user flows
- Component tests with React Testing Library

### Deployment
- Deploy to Vercel with production environment variables
- Configure OAuth for production (not just testing mode)
- Set up CI/CD pipeline
- Add monitoring and error tracking (Sentry)

## 📸 Screenshots

(Add screenshots here showing:)
1. Login page
2. Inbox with emails
3. AI assistant composing an email
4. Email detail view
5. AI assistant searching emails

## 🎥 Demo Video

(Add link to demo video showing:)
- Login flow
- AI composing and sending email
- AI searching and filtering
- AI navigating to specific email
- Context-aware reply

## 🐛 Known Issues

1. **Real-time sync not implemented** - Requires Pub/Sub setup (planned)
2. **No attachment support** - Can view attachment info but not download
3. **Limited error handling** - Some edge cases may not be handled gracefully
4. **OAuth in testing mode** - Limited to test users until verified

## 📝 License

This project is created for the AI-Powered Mail Web Application technical assignment.

## 🙏 Acknowledgments

- Gmail API documentation
- Google Gemini AI documentation
- Next.js team for excellent framework
- Vercel for deployment platform

---

**Built with ❤️ using Next.js, TypeScript, and Google AI**
