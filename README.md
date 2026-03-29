# ThinkMate – AI Decision Assistant

ThinkMate is a production-quality AI-powered decision-making assistant that helps users think through complex problems systematically and make better choices. Built with modern web technologies, it combines structured reasoning, intelligent analysis, and a beautiful user interface to guide users through decision-making processes.

## Features

### Core Functionality
- **Structured Decision Analysis**: Break down problems into clear components (problem definition, key factors, options, pros/cons, reflective questions, recommendations)
- **AI-Powered Insights**: Leverages OpenAI's GPT models for intelligent conversation and decision guidance
- **Conversation Persistence**: Save and revisit past conversations and decisions
- **User Authentication**: Secure authentication with Manus OAuth integration
- **Modern Chat Interface**: Beautiful dark mode UI with gradient accents and smooth animations

### Technical Highlights
- **Full-Stack Architecture**: React 19 + Tailwind CSS 4 frontend, Express + tRPC backend
- **Database Integration**: MySQL/TiDB for persistent storage of conversations and messages
- **Real-Time Updates**: Responsive UI with optimistic updates and error handling
- **Structured Responses**: JSON schema validation for consistent, parseable AI responses
- **Voice Input Ready**: Integration points for Whisper API speech-to-text transcription
- **Diagram Generation**: Backend support for Mermaid diagram generation for decision trees

## Tech Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Wouter** - Lightweight routing
- **Streamdown** - Markdown rendering with streaming support
- **Lucide React** - Beautiful icon library

### Backend
- **Express 4** - Web server framework
- **tRPC 11** - End-to-end type-safe APIs
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Google Gemini API** - LLM integration

### Development
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **TypeScript** - Type checking
- **Prettier** - Code formatting

## Project Structure

```
thinkmate/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Landing page
│   │   │   └── Chat.tsx             # Main chat interface
│   │   ├── components/              # Reusable components
│   │   │   ├── StructuredResponseRenderer.tsx
│   │   │   ├── ConversationSidebar.tsx
│   │   │   └── VoiceInputButton.tsx
│   │   ├── lib/                     # Utilities
│   │   │   └── trpc.ts              # tRPC client setup
│   │   ├── App.tsx                  # Route configuration
│   │   ├── index.css                # Global styles
│   │   └── main.tsx                 # Entry point
│   └── public/                      # Static assets
├── server/                          # Express backend
│   ├── routers/
│   │   └── chat.ts                  # Chat tRPC procedures
│   ├── services/
│   │   ├── llmService.ts            # LLM integration
│   │   ├── voiceService.ts          # Voice transcription
│   │   └── diagramService.ts        # Diagram generation
│   ├── db.ts                        # Database queries
│   ├── routers.ts                   # Main router
│   └── _core/                       # Framework internals
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # SQL migrations
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
```

## Getting Started

### Prerequisites
- Node.js 22+ and pnpm
- MySQL/TiDB database
- OpenAI API key (for LLM features)

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd thinkmate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The project uses Manus platform for authentication and Google's Gemini for AI features. Required secrets:
   - `DATABASE_URL` - MySQL/TiDB connection string
   - `JWT_SECRET` - Session cookie signing secret
   - `VITE_APP_ID` - Manus OAuth application ID
   - `VITE_OAUTH_PORTAL_URL` - Manus OAuth portal URL (e.g. `https://auth.manus.app`)
   - `VITE_OAUTH_CALLBACK_URL` - Optional redirect URI, defaults to `http://localhost:3001/api/oauth/callback`
   - `GOOGLE_API_KEY` - Google AI API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

   For local testing without a real Manus OAuth service, you can use `VITE_OAUTH_PORTAL_URL=http://localhost:3001`; the app now mocks `/app-auth` on the local server.

4. **Set up the database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### For Users

1. **Sign In**: Click "Sign In" on the landing page to authenticate with Manus OAuth
2. **Start a Conversation**: Click "New Chat" to begin a new decision analysis
3. **Ask Your Question**: Type your decision problem or question in the input box
4. **Get Structured Analysis**: ThinkMate will provide:
   - Problem understanding and restatement
   - Key factors to consider
   - Available options
   - Pros and cons for each option
   - Reflective questions for deeper thinking
   - Final recommendation with reasoning
5. **Continue Conversation**: Ask follow-up questions to explore the decision further
6. **Save History**: All conversations are automatically saved and can be accessed from the sidebar

### For Developers

#### Running Tests
```bash
pnpm test
```

#### Type Checking
```bash
pnpm check
```

#### Building for Production
```bash
pnpm build
```

#### Starting Production Server
```bash
pnpm start
```

## API Documentation

### tRPC Procedures

#### Chat Router (`trpc.chat.*`)

**Create Conversation**
```typescript
trpc.chat.createConversation.mutate({
  title?: string  // Optional conversation title
})
```

**List Conversations**
```typescript
trpc.chat.listConversations.query()
```

**Get Conversation**
```typescript
trpc.chat.getConversation.query({
  conversationId: number
})
```

**Send Message**
```typescript
trpc.chat.sendMessage.mutate({
  conversationId: number
  message: string
  useStructuredAnalysis?: boolean  // Default: true
})
```

**Update Title**
```typescript
trpc.chat.updateTitle.mutate({
  conversationId: number
  title: string
})
```

**Delete Conversation**
```typescript
trpc.chat.deleteConversation.mutate({
  conversationId: number
})
```

## System Prompt

ThinkMate uses a carefully crafted system prompt to guide the AI's decision-making analysis:

```
You are ThinkMate, an intelligent Decision-Making Assistant designed to help users make better choices through structured reasoning.

When a user presents a decision or problem, respond with a comprehensive analysis in the following format:

1. Problem Understanding: Clearly restate the user's problem or decision
2. Key Factors: Identify 3-5 critical factors influencing the decision
3. Options Analysis: List the main options or paths available
4. Pros and Cons: For each option, provide specific advantages and disadvantages
5. Reflective Questions: Ask thought-provoking questions for deeper thinking
6. Final Recommendation: Provide a clear, reasoned recommendation

Be clear, logical, and structured. Avoid vague answers.
```

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  structuredData TEXT,  -- JSON string for parsed decision analysis
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Architecture Decisions

### Frontend Architecture
- **Component-Based**: Modular, reusable React components
- **Dark Mode First**: Professional dark theme with gradient accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage for better DX

### Backend Architecture
- **tRPC for Type Safety**: End-to-end type-safe APIs without manual contracts
- **Service Layer**: Separation of concerns with dedicated services for LLM, voice, diagrams
- **Database Abstraction**: Drizzle ORM for type-safe queries
- **Structured Responses**: JSON schema validation for consistent AI output

### Data Flow
1. User sends message via Chat component
2. Frontend calls `trpc.chat.sendMessage` mutation
3. Backend receives message and stores it in database
4. LLM service generates structured decision analysis
5. Response is parsed, formatted, and returned to frontend
6. Frontend renders structured response with StructuredResponseRenderer
7. Conversation history is updated in sidebar

## Performance Considerations

- **Message Caching**: tRPC automatically caches queries for better performance
- **Optimistic Updates**: Frontend updates UI immediately while waiting for server
- **Lazy Loading**: Conversation history loads on demand
- **Efficient Rendering**: React 19 with automatic batching
- **CSS Optimization**: Tailwind purges unused styles in production

## Future Enhancements

- **Real-Time Streaming**: Token-by-token response streaming for faster perceived performance
- **Voice Input**: Full Whisper API integration for speech-to-text
- **Diagram Visualization**: Mermaid diagram rendering in chat
- **Dark Mode Toggle**: User preference for theme switching
- **Conversation Export**: Export decisions as PDF or markdown
- **Collaboration**: Share conversations with other users
- **Advanced Analytics**: Track decision patterns and outcomes
- **Custom Models**: Support for different LLM providers

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check database credentials and network access
- Ensure database server is running

### LLM API Errors
- Verify `BUILT_IN_FORGE_API_KEY` is valid
- Check API rate limits
- Review error logs in `.manus-logs/`

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf .vite`
- Restart dev server: `pnpm dev`

## Contributing

This is a demonstration project. For modifications or improvements:

1. Follow the existing code style and structure
2. Add tests for new features
3. Update documentation as needed
4. Test thoroughly before committing

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feedback, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
