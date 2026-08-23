# DSA Dash

### Adaptive DSA Practice Platform

An adaptive DSA practice platform that personalizes what you practice based on your goals, topics, performance, mastery, and learning history.

- Live Demo: https://the-dsa-dash.vercel.app
- GitHub Repository: https://github.com/yug5/DSA_Dash
  <p align="center">
  <img src="https://github.com/user-attachments/assets/cb69985f-b609-4b56-be8e-963256065f7e" width="32%">
  <img src="https://github.com/user-attachments/assets/31ae48cb-a9fa-42af-adc4-6f87db37b1a5" width="32%">
  <img src="https://github.com/user-attachments/assets/37d9eb72-22fe-4b95-8016-1eb5b1c9c56c" width="32%">
</p>


---

## 1. Executive Summary

DSA Dash is a full-stack, telemetry-driven Data Structures and Algorithms practice platform engineered to solve the inefficiency of static problem lists. Rather than forcing learners through arbitrary problem lists, DSA Dash evaluates user attempt results, tracks topic mastery across 19 core DSA domains, enforces prerequisite dependencies, and recommends the optimal next problem to solve.

---

## 2. The Problem

Traditional DSA practice platforms operate on a static paradigm:

Choose Question -> Solve -> Submit -> Move to Next Question

This model ignores fundamental differences in learner profiles:
- Baseline Knowledge: Beginners and advanced practitioners require different starting points.
- Target Weaknesses: Solving topics already mastered yields diminishing returns.
- Goal Constraints: Interview candidates with 3 weeks require different focus than long-term learners.
- Topic Scoping: Forcing learners into unstudied topics (e.g. Dynamic Programming before Recursion) causes frustration.

Blindly solving more questions does not correlate with better retention. Effective learning requires targeted reinforcement, prerequisite validation, and performance telemetry.

The core philosophy of DSA Dash is:
"The platform should adapt to the learner, not force the learner to adapt to the platform."

---

## 3. Why DSA Dash Is Different

DSA Dash moves away from unguided problem catalogs by introducing a decoupled intelligence layer:

- Goal-Based Learning: Practice is scoped around user-defined daily targets, target dates, and explicit topic selections.
- Controlled Topic Scoping: Beginners can filter practice to specific topics (e.g. Arrays and Two Pointers only), preventing recommendations from topics they haven't studied yet.
- Dynamic Topic Mastery: Tracks real-time mastery scores (0 to 100) per topic based on problem difficulty and solve independence.
- Prerequisite Validation: Enforces prerequisite dependencies before recommending advanced topics.
- Unresolved Gap Tracking: Automatically logs failed attempts and assisted solves to highlight conceptual weak areas.
- Streak Protection Engine: Includes an automated Streak Freezer system rewarding consistency while protecting streaks during missed days.
- App-Aware AI Assistant: Provides step-by-step app navigation guidance and DSA concept explanations.

---

## 4. How the Adaptive Engine Works

The core of DSA Dash is its recommendation engine, which continuously adjusts problem recommendations after every attempt.

### Recommendation Pipeline

```
User Goal & Target
       |
       v
Selected Topic Filter
       |
       v
Prerequisite Check
       |
       v
Score Gap & Difficulty Matching
       |
       v
Question Recommendation
       |
       v
User Attempt Recorded
       |
       v
Mastery & Gap Update
       |
       v
Next Recommendation
```

### Recommendation Factors

The recommendation algorithm in `lib/services/recommendationService.ts` ranks available questions using four primary factors:

1. Topic Mastery Gap Score
   - Calculates candidate score gap: `100 - current_topic_mastery`.
   - Prioritizes topics with lower mastery scores to address weak areas.

2. Prerequisite Readiness Check
   - Inspects `topic_prerequisites` graph.
   - Ensures candidate questions are recommended only if prerequisite topic mastery satisfies minimum thresholds.

3. Rating & Difficulty Match
   - Computes an Elo-like rating delta between the user's current topic rating and question difficulty rating.
   - Prevents recommending Hard questions to users struggling with Easy/Medium fundamentals.

4. User Goal Scoping
   - Filters candidate pool to match `goals.selected_topics` configured by the user.

---

## 5. What I Actually Engineered

Business logic is completely decoupled from React presentation components inside `lib/services/`. This architectural decision ensures pure testability, clean boundaries, and easy maintenance.

### Core Services Breakdown

| Service Module | Engineering Responsibility |
|---|---|
| `recommendationService.ts` | Ranks questions based on score gap, prerequisite trees, rating match, and goal filters. |
| `masteryService.ts` | Calculates mastery deltas per attempt (`SOLVED_INDEPENDENTLY`, `SOLVED_WITH_HELP`, `DID_NOT_SOLVE`) and clamps bounds (`0` to `100`). |
| `streakService.ts` | Handles streak calculations, passive streak decay, 5-day milestone freezers (+1 freezer per 5 days), and freeze consumption. |
| `ratingService.ts` | Implements Elo-style rating adjustments balancing user topic rating against problem difficulty. |
| `gapService.ts` | Tracks open conceptual gaps in `unresolved_gaps` table when attempts fail or require assistance. |
| `goalService.ts` | Manages goal lifecycles, target daily velocity projections, and topic scope filters. |
| `xpService.ts` | Computes experience points per difficulty tier with completion bonuses. |
| `authService.ts` | Manages Supabase 6-digit OTP verification, email confirmation, resend cooldown timers, and 3-step password recovery. |
| `aiChatService.ts` | Combines a structured local knowledge base (`appKnowledge.ts`) for app navigation with Mistral AI API for dynamic DSA answers. |
| `aiCoachService.ts` | Generates telemetry-driven guidance summaries analyzing overall solve rates and weakest topics. |
| `dataService.ts` | Data access layer executing optimized, batch parallel queries against Supabase PostgreSQL. |

---

## 6. Core Features

### Learning & Guidance
- Personalized Onboarding: Configures baseline experience tier (Beginner, Intermediate, Advanced), daily targets, and target dates.
- Scoped Topic Practice: Allows users to restrict recommendations to specific topics.
- Question Recommendation Engine: Ranks next optimal practice problem in real time.
- Attempt Submission: Captures time spent, notes, failure reasons, and solve independence.

### Analytics & Telemetry
- Progress Telemetry: Displays overall mastery score across 19 core DSA topics, consistency index, and independent solve rate.
- Unresolved Gap Detection: Highlights topics requiring reinforcement.
- Streak Freezer System: Grants 1 Streak Freezer per 5 consecutive practice days and automatically protects missed days.
- XP & Leveling Engine: Tracks total experience points earned from attempts and daily target completions.
- Attempt History: Chronological log with filtering by difficulty, result, and keyword search.

### Security & Authentication
- Email & Password Authentication via Supabase Auth.
- 6-Digit OTP Email Verification for account creation.
- 3-Step Password Recovery with OTP verification and 60-second resend cooldown timers.
- Server-Side Route Protection via Next.js middleware (`middleware.ts`).

### AI Assistance
- Navigation Guidance: Provides exact step-by-step navigation paths for app features (e.g. `Goals -> Edit Goal -> Topics`).
- DSA Concept Explanations: Explains topic prerequisites and algorithmic patterns.
- Hybrid Architecture: Uses fast local knowledge matching with optional Mistral AI integration.

---

## 7. Architecture

DSA Dash adopts a multi-tier architecture separating UI presentation, service business logic, data access, and database storage.

```
+-------------------------------------------------------------------+
|                        UI Presentation Layer                      |
|            Next.js 14 App Router, React Components, Tailwind     |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        Service & Business Layer                   |
|       Pure TypeScript Services (lib/services/*), AI Engine        |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        Data Access Layer                          |
|         dataService.ts, Supabase SSR Client (@supabase/ssr)       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        Database & Storage Layer                   |
|            Supabase PostgreSQL with RLS & Schema Migrations       |
+-------------------------------------------------------------------+
```

---

## 8. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | React framework for SSR, routing, and server components |
| Language | TypeScript 5.5 | End-to-end static type safety |
| Styling | Vanilla CSS / TailwindCSS 3.4 | Custom design system and glassmorphic UI |
| Icons | Lucide React | Modern UI iconography |
| Backend & Database | Supabase PostgreSQL | Managed relational database with Row Level Security |
| Authentication | Supabase Auth (`@supabase/ssr`) | Cookie-based session authentication & OTP verification |
| AI Integration | Mistral AI API | Optional LLM integration for dynamic DSA guidance |
| Deployment | Vercel | Edge serverless deployment |

---

## 9. Project Structure

```
DSA_Dash/
├── app/                        # Next.js App Router pages & API routes
│   ├── api/                    # Server endpoints (chat, question sync)
│   ├── dashboard/              # Main telemetry & recommendation dashboard
│   ├── forgot-password/        # 3-step OTP password recovery flow
│   ├── goals/                  # Goal creation & topic selection page
│   ├── history/                # Attempt log & search history
│   ├── login/                  # User authentication login page
│   ├── onboarding/             # Baseline setup workflow
│   ├── practice/               # Manual and recommended practice view
│   ├── progress/               # Telemetry and topic mastery analysis
│   ├── settings/               # Profile & account configuration
│   └── signup/                 # Registration & 6-digit OTP verification
├── components/                 # React UI components
│   ├── ui/                     # Reusable design components (Card, Badge, Toast, Skeleton)
│   ├── AIAssistantWidget.tsx   # Global AI Assistant chat widget
│   ├── AttemptModal.tsx        # Problem attempt submission modal
│   └── Sidebar.tsx             # Main navigation sidebar
├── lib/                        # Core application business logic
│   ├── config/                 # App knowledge & algorithm configuration
│   ├── services/               # Decoupled business logic services
│   ├── supabase/               # Client and server Supabase initializers
│   └── types/                  # TypeScript interface definitions
├── scripts/                    # Automated unit & integration verification test scripts
├── supabase/                   # PostgreSQL schema definitions & SQL migration scripts
└── middleware.ts               # Next.js server middleware for auth route protection
```

---

## 10. Authentication & Security

Security is implemented at the server level using Next.js Middleware and Supabase Row Level Security (RLS).

### Security Mechanisms

1. Server-Side Middleware Protection (`middleware.ts`)
   - Validates user session cookies on every request using `@supabase/ssr`.
   - Protects `/dashboard`, `/practice`, `/progress`, `/goals`, `/history`, `/settings`, and `/onboarding`.
   - Redirects unauthenticated users to `/login`.
   - Enforces onboarding completion before allowing access to core application routes.

2. Database Row Level Security (RLS)
   - Every user-facing PostgreSQL table (`profiles`, `streaks`, `goals`, `attempts`, `daily_activity`, `user_topic_mastery`, `unresolved_gaps`, `xp_transactions`) has RLS enabled.
   - Strict policies ensure users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` rows matching `auth.uid() = user_id`.

3. Secrets & Payload Protection
   - API keys and service-role JWTs remain restricted to server environment variables (`.env.local`).
   - OTP codes and tokens are verified server-side via Supabase Auth without exposing secrets to client bundles.

---

## 11. AI Assistant Architecture

The AI Assistant is designed as a hybrid guidance system answering both app navigation queries and DSA concept questions.

### Capabilities

1. Exact Navigation Guidance
   - User Query: "Where do I change the topics I want to practice?"
   - AI Response: "Go to Goals -> Edit Goal -> Topics. Your selected topics control which topics can appear in your practice recommendations."

2. DSA Concept Guidance
   - User Query: "What should I know before starting DP?"
   - AI Response: Provides structured prerequisite guidance (Recursion, Memoization, 1D/2D Grids) and key takeaways.

3. Unhandled Feature Boundaries
   - User Query: "Where is multiplayer mode?"
   - AI Response: "I don't see that option in the current version of DSA_Dash."

---

## 12. Performance & UX Engineering

### Asynchronous Attempt Submission Pipeline

To eliminate user latency during attempt submission, `recordQuestionAttempt()` in `lib/services/dataService.ts` uses parallel database execution and background loading:

```
User Clicks Submit
       |
       v
Parallel Writes (attempts, activity, mastery, streaks, goals, xp)
       |
       v
Immediate UI Success Display
       |
       v
Background Fetch for Next Recommendation
```

### Optimistic UI & Feedback
- Non-Blocking Notifications: Streak Freezer rewards trigger non-blocking toast notifications without stopping user workflow.
- Cooldown Timers: Resend OTP buttons enforce a 60-second countdown to prevent duplicate API requests.
- Disabled Form States: Input forms disable submission buttons during pending network requests.

---

## 13. System Interface Views

The application provides dedicated interface views for each stage of the practice lifecycle:

- Dashboard: Telemetry overview, daily goal tracker, streak and Streak Freezer balance, recommended problem card, and AI Coach guidance.
- Practice: Interactive problem workspace with difficulty filters, topic selection tags, time tracker, and attempt submission modal.
- Goals: Goal creation and editing interface allowing users to adjust daily target counts, target dates, and scoped topic selection.
- Progress: Detailed telemetry analysis displaying mastery scores (0-100) across 19 core DSA topics, consistency score, and independent solve rate.
- History: Filterable attempt history log with detailed notes, failure reasons, and time spent metrics.
- Onboarding: 3-step setup workflow for configuring initial experience levels and target parameters.

---

## 14. Engineering Context

DSA Dash was built to demonstrate product-oriented engineering, full-stack architecture, and algorithm design. Key engineering decisions include:

- Decoupling domain logic into pure TypeScript services rather than mixing database queries in React components.
- Designing an idempotent Streak Freezer milestone algorithm preventing duplicate rewards across page reloads.
- Implementing Row Level Security policies to enforce user isolation at the database layer.
- Optimizing database writes via parallel promises to minimize attempt submission latency.

---

## 15. Scalability & Future Improvements

Potential future enhancements for the platform include:

- Catalog Expansion: Syncing larger external question datasets via automated worker scripts.
- Machine Learning Recommendation Model: Transitioning from rule-based scoring to collaborative filtering and item-response theory (IRT).
- Automated Learning Path Generation: Dynamic path generation mapping out multi-week study schedules based on target interview dates.
- Peer Practice Mode: Real-time collaborative problem-solving using WebSockets.
- Mobile Client: React Native client leveraging shared service modules.

---

## 16. Current Verification Status

- TypeScript Compilation: 100% Type-safe (`npx tsc --noEmit` exits with 0 errors).
- Automated Test Suite: Verified via `scripts/test-streak-freezer.ts` and `scripts/test-new-features.ts`.

---

## 17. Author

Built and engineered as an adaptive learning platform project.

Repository: https://github.com/yug5/DSA_Dash
