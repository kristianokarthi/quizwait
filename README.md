# QuizWait 🧠

> The waitlist that rewards you for what you know — and who you bring.

**Live Demo:** [quizwait.vercel.app](https://quizwait.vercel.app)

---

## What is QuizWait?

A referral-powered waitlist for an AI assessment platform. Users join, share their referral link, and compete for a spot in the **Top 50** — whoever is in the top 50 at launch wins **3 years free** of ChatGPT Plus or Claude Pro.

Built for students, job seekers, career switchers, and self-learners who want access to premium AI tools but can't afford them.

---

## How It Works

1. Enter your email → get your live queue position instantly
2. An AI (powered by Groq + Llama 3.3) generates a personalized welcome message based on your position
3. Share your referral link → each referral moves you **10 spots up**
4. Top 50 at launch → win 3 years free AI subscription of your choice
5. Refer 3 / 6 / 10 friends → unlock 1 / 3 / 6 months free subscription
6. After launch → pass an AI assessment on your track → earn real API credits

---

## AI Integration

When a user joins the waitlist, a **free LLM (Llama 3.3 via Groq API)** generates a personalized welcome message in real time based on their queue position. Top 50 users get an energetic winning message. Others get an urgency-driven motivational push to share their referral link.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS |
| Database | Neon Serverless PostgreSQL |
| Email | Resend |
| AI | Groq API — Llama 3.3 70B |
| Deployment | Vercel |

---

## Local Setup

```bash
git clone https://github.com/kristianokarthi/quizwait
cd quizwait
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` variables:
```
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
GROQ_API_KEY=
```

---

## Database Setup

Run in Neon SQL Editor:

```sql
CREATE TABLE waitlist (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  referral_code  TEXT UNIQUE,
  referred_by    TEXT,
  referral_count INTEGER DEFAULT 0,
  score          INTEGER DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

> Position is never stored — calculated live via `RANK() OVER (ORDER BY score ASC)`

---

## AI Tools Used

Used **Claude (Anthropic)** throughout — UI components, API logic, DB schema, and debugging. **Groq API (Llama 3.3)** powers the live welcome message on signup. Most valuable AI use was in the debugging loop where the score-based ranking approach emerged as a simpler alternative to position-shifting logic.

---

*Built in 2 days as a take-home assessment. Updated with AI welcome message feature based on team feedback.*