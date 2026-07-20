# Lalang 🇲🇺 🇷🇪

**AI translation for the languages of the Indian Ocean** — English, French,
Mauritian Creole (*Kreol Morisien*) and Réunion Creole (*Kréol Réyoné*).

> *lalang* means "tongue / language" in Kreol Morisien.

This is the **foundation scaffold**: a runnable Next.js 15 app with a working
translation pipeline, the full database schema, auth wiring, and the core pages.
It's built to grow — many features from the product spec are scaffolded as
working stubs, ready to be fleshed out.

## The one thing worth knowing

**It runs with zero configuration.** No API key, no database, no accounts
needed to start. The translation pipeline uses a built-in Creole dictionary, so
`npm run dev` gives you a working translator immediately. Add a database for
history/accounts, and an OpenAI key for fluent AI translation — each is optional
and the app degrades gracefully without them.

Try the example from the spec — "I'm very tired today" →
- Mauritian Creole: **Mo bien fatige zordi**
- Réunion Creole: **Mi lé bien fatigué azordi**

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + shadcn/ui-style components + **Framer Motion**
- **PostgreSQL** + **Prisma**
- **NextAuth / Auth.js v5** (email/password + Google)
- **OpenAI** (optional) with an offline dictionary fallback
- **Jest** + Testing Library

## Prerequisites (no Docker)

- **Node.js 18.18+** (20 LTS recommended)
- **PostgreSQL** running locally *(optional — only for history/auth/community)*
  - macOS: `brew install postgresql@16 && brew services start postgresql@16`
  - Ubuntu/Debian: `sudo apt install postgresql && sudo service postgresql start`
  - Then create a database: `createdb lalang`

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure environment
cp .env.example .env
#   Edit .env — set DATABASE_URL if you have Postgres, OPENAI_API_KEY for AI.

# 3. (Optional) set up the database
npm run db:migrate      # creates tables
npm run db:seed         # loads the Creole dictionary + an admin user

# 4. Run it
npm run dev             # http://localhost:3000
```

If you skip steps 2–3, the app still runs — you just won't have saved history,
accounts, or AI translation (the offline dictionary is used instead).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Run the test suite |
| `npm run db:migrate` | Create/apply database migrations |
| `npm run db:seed` | Seed dictionary + admin user |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Lint |

## Environment variables

All optional — see `.env.example` for the full list.

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | History, accounts, community features |
| `AUTH_SECRET` | Auth (generate with `npx auth secret`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | "Sign in with Google" |
| `OPENAI_API_KEY` | AI translation (falls back to dictionary if unset) |
| `OPENAI_MODEL` | Override the model (default `gpt-4o-mini`) |

## The translation pipeline

The engine lives in `src/services/translation/` and follows the spec's flow.
Each stage is a small, independently testable module:

```
input → language-detection → context-analysis → ai-translator
      → grammar-correction → cultural-adaptation → output
```

- **language-detection** — heuristic marker scoring; distinguishes the two
  Creoles by their function words (mo/to/pe vs mi/lé/i).
- **context-analysis** — resolves the register (casual, business, slang…).
- **ai-translator** — calls OpenAI when a key is present; returns `null`
  otherwise so the pipeline falls back.
- **dictionary-fallback** — offline phrase/word lookup (`dictionary-data.ts`).
- **grammar-correction** — conservative surface normalisation.
- **cultural-adaptation** — attaches usage notes.

Provider-agnostic: swap OpenAI for Anthropic, Mistral or a local model by
editing `ai-translator.ts` only.

## Project structure

```
src/
├── app/                    # App Router pages + API routes
│   ├── api/                # /translate, /dictionary, /health, /auth
│   ├── translator/         # main translator
│   ├── dictionary/         # cultural dictionary (search)
│   ├── learn/              # word of the day + quiz
│   ├── profile/ login/     # account + history
│   └── admin/              # role-gated dashboard
├── components/             # UI + feature components
├── services/translation/   # the pipeline (see above)
├── lib/                    # prisma, auth, rate-limit, utils
├── hooks/ utils/ types/    # client hooks, zod schemas, shared types
prisma/                     # schema + seed
```

## What's built vs. what's next

**Working now**
- Translation pipeline (offline + AI) with the 4 languages and 7 registers
- Live translator UI: detect/swap languages, register, copy, text-to-speech
- Cultural dictionary with search + categories
- Learn page (word of the day + quiz)
- Full Prisma schema + seed
- Auth wiring (email/password + Google) and login page
- History persistence + role-gated admin dashboard
- API rate limiting, input validation, tests

**Scaffolded stubs / next up**
- Voice input (speech-to-text) — TTS output already works
- AI conversation practice mode
- Community suggestion + voting UI (schema is ready)
- Favourites and feedback endpoints (models are ready)
- Expanding the dictionary (ideally via the community flow)

## Notes

- **Auth.js v5 is in beta.** If install complains about the version, run
  `npm install next-auth@beta`. Email/password uses the JWT session strategy
  (required alongside Credentials).
- **The seeded admin is `admin@lalang.mu` / `changeme123`.** Change it before
  deploying anywhere real.
- The Creole dictionary is a small, real seed — treat entries as *a* correct
  form, not the only one. These are living languages with spelling variation.
```
