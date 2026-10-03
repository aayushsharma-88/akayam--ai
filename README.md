# Akayam AI

**A universal AI workspace — chat, create, analyze, and build — all in one intelligent platform.**

Akayam AI is a production-grade, full-stack AI platform built with Next.js 16, TypeScript, Prisma, and PostgreSQL. It is designed to be modular and provider-agnostic, allowing new AI capabilities to be plugged in without rebuilding the application.

---

## Features

| Category | Capabilities |
|---|---|
| **Chat** | Streaming AI chat, conversation history, search, pin, archive |
| **Vision** | Image upload and analysis, multi-image comparison |
| **Image Generation** | (Not supported yet) image generation with download/save |
| **Voice** | Speech-to-text ((Not supported yet)), text-to-speech (Google Gemini TTS) |
| **Documents** | PDF, DOCX, TXT, CSV upload and analysis |
| **Data** | CSV/JSON/XLSX parsing, chart generation (Recharts) |
| **Code** | Syntax-highlighted code generation with copy button |
| **Projects** | Workspaces to organize conversations, files, assets |
| **Library** | Saved images, videos, audio, charts |
| **Memory** | Conversation context + optional long-term memory |
| **Authentication** | Email/password, session management, protected routes |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js v5 |
| AI (Text/Vision) | Google Gemini gemini-2.5-flash |
| AI (Images) | Google Gemini (Not supported yet) |
| AI (Speech) | Google Gemini (Not supported yet) + TTS |
| Charts | Recharts |
| Markdown | react-markdown + rehype-highlight |
| File Storage | Local filesystem (dev), S3-compatible (production) |

---

## Architecture

```
akayam-ai/
├── prisma/
│   └── schema.prisma          # Full PostgreSQL schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── page.tsx       # Home screen
│   │   │   ├── chat/[id]/     # Chat interface
│   │   │   ├── library/       # Generated assets library
│   │   │   ├── projects/      # Project workspaces
│   │   │   └── settings/      # User settings
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth + register
│   │       ├── chat/          # AI streaming chat
│   │       ├── conversations/ # CRUD conversations
│   │       ├── images/        # Image generation
│   │       ├── audio/         # STT + TTS
│   │       ├── files/         # Upload + serve
│   │       ├── projects/      # Projects CRUD
│   │       ├── library/       # Asset library
│   │       ├── memory/        # Memory CRUD
│   │       ├── search/        # Global search
│   │       └── user/          # Profile + settings
│   ├── components/
│   │   ├── animations/        # Butterfly, rainbow glow
│   │   ├── brand/             # Logo, wordmark
│   │   ├── chat/              # Chat UI, messages, input bar
│   │   ├── home/              # Home screen
│   │   ├── sidebar/           # Navigation sidebar
│   │   └── ui/                # Base design system
│   └── lib/
│       ├── ai/                # AI provider abstraction layer
│       │   ├── providers/     # Google Gemini implementations
│       │   ├── router.ts      # Provider routing
│       │   └── types.ts       # Provider interfaces
│       ├── auth/              # Auth config + utilities
│       ├── db/                # Prisma client singleton
│       ├── storage/           # File storage abstraction
│       └── utils.ts           # Shared utilities
└── public/                    # Static assets
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd akayam-ai
npm install --legacy-peer-deps
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required environment variables:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/akayam_ai"
AUTH_SECRET="your-secret-here"    # Run: openssl rand -base64 32
GEMINI_API_KEY="sk-..."           # Required for AI features
```

### 3. Set up PostgreSQL database

```bash
# Create database
createdb akayam_ai

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create your account

Navigate to `/register` to create the first account, or run:

```bash
# Optional: seed admin account
npx prisma studio
```

---

## Environment Variables Reference

See [`.env.example`](.env.example) for the complete list.

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret key (min 32 chars) |
| `AUTH_URL` | Base URL of your app |

### AI Providers (at least one required for AI features)

| Variable | Provider | Features |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini | Chat, vision, DALL-E, (Not supported yet), TTS |

### Storage

| Variable | Description |
|---|---|
| `STORAGE_PROVIDER` | `local` (dev) or `s3` (production) |
| `STORAGE_LOCAL_PATH` | Local upload directory (default: `./uploads`) |

---

## Database Setup

Akayam AI uses **PostgreSQL** with **Prisma ORM**.

```bash
# First-time setup
npx prisma migrate dev --name init
npx prisma generate

# View database in browser
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Schema Overview

| Model | Purpose |
|---|---|
| `User` | Authentication + profile |
| `Account` / `Session` | OAuth sessions |
| `Conversation` | Chat threads |
| `Message` | Individual messages |
| `File` | Uploaded files |
| `Attachment` | File → Message links |
| `GeneratedAsset` | AI-generated images/video/audio |
| `Project` | Workspace organization |
| `Memory` | Long-term AI memory |
| `UserPreference` | Settings per user |
| `Usage` | Token/API usage tracking |
| `Feedback` | Message thumbs up/down |
| `Notification` | System notifications |

---

## AI Provider Configuration

Akayam AI uses a **provider abstraction layer** so you can swap or add AI providers without changing the application logic.

### Current Implementations

- `Google GeminiTextProvider` — gemini-2.5-flash chat
- `Google GeminiVisionProvider` — gemini-2.5-flash vision
- `Google GeminiImageProvider` — (Not supported yet)
- `Google GeminiSpeechProvider` — (Not supported yet) STT
- `Google GeminiTTSProvider` — Google Gemini TTS

### Adding a New Provider

1. Implement the appropriate interface from `src/lib/ai/providers/base-provider.ts`
2. Register it in `src/lib/ai/router.ts`
3. Add the API key to `.env.example` and `.env.local`

Example:
```typescript
// src/lib/ai/providers/anthropic-provider.ts
export class AnthropicTextProvider implements TextProvider {
  // ... implement generateText, streamText, isConfigured, getInfo
}
```

---

## API Reference

See [`API.md`](./API.md) for the complete API documentation.

Key endpoints:

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Streaming AI chat |
| `GET/POST` | `/api/conversations` | List/create conversations |
| `GET/PATCH/DELETE` | `/api/conversations/[id]` | Manage conversation |
| `POST` | `/api/images/generate` | Generate image |
| `POST` | `/api/audio/transcribe` | Speech to text |
| `POST` | `/api/audio/synthesize` | Text to speech |
| `POST` | `/api/files/upload` | Upload file |
| `GET` | `/api/files/[id]` | Serve file |
| `GET/POST` | `/api/projects` | List/create projects |
| `GET/POST` | `/api/memory` | Memory management |
| `GET` | `/api/search` | Global search |

---

## Production Deployment

### Environment

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
AUTH_SECRET=<strong-secret>
GEMINI_API_KEY=sk-...
STORAGE_PROVIDER=s3
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=akayam-ai
```

### Build

```bash
npm run build
npm start
```

### Database Migration

```bash
npx prisma migrate deploy
```

---

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check
npx prisma studio    # Database browser
npx prisma migrate dev # Run migrations
```

---

## Troubleshooting

### "Cannot connect to database"
Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### "AI features not working"
Check that `GEMINI_API_KEY` is set in `.env.local`.

### "File upload fails"
Check that `uploads/` directory exists and is writable, or configure S3.

### "Build fails on Google Fonts"
Fonts are served via system stack — no Google Fonts dependency in production build.

### npm install fails
Use: `npm install --legacy-peer-deps`

---

## Contributing

This is a private project. See `ARCHITECTURE.md` for design decisions.

---

## License

Proprietary — Akayam AI

---

*Built with ♦ using Next.js, TypeScript, Prisma, and Google Gemini.*
