"use client"

import { useState, useEffect } from "react"
import {
  Brain, Users, Zap, Trophy, ArrowRight, Sparkles,
  Clock, GraduationCap, Briefcase, Code2, FlaskConical,
  Lock, CheckCircle2, Mail, Crown, TrendingUp, Copy, Check
} from "lucide-react"

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(targetDate: Date): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now
      if (distance <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])
  return time
}

const LAUNCH_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

const AUDIENCE_CARDS = [
  { icon: <GraduationCap className="w-4 h-4" />, label: "Students", context: "Syllabus-based Q&A", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: <Briefcase className="w-4 h-4" />, label: "Job Seekers", context: "JD-based mock interviews", bg: "bg-blue-500/10 border-blue-500/20" },
  { icon: <Code2 className="w-4 h-4" />, label: "Career Switchers", context: "Skill gap assessment", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: <FlaskConical className="w-4 h-4" />, label: "Self-Learners", context: "Topic-based deep dives", bg: "bg-orange-500/10 border-orange-500/20" },
]

const REFERRAL_TIERS = [
  { refs: 3, reward: "1 Month Free", platform: "ChatGPT Plus or Claude Pro — your pick", icon: <Zap className="w-5 h-5" />, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10 border-blue-500/20", tag: "Early Mover" },
  { refs: 6, reward: "3 Months Free", platform: "ChatGPT Plus or Claude Pro — your pick", icon: <Trophy className="w-5 h-5" />, color: "from-purple-500 to-pink-500", bg: "bg-purple-500/10 border-purple-500/20", tag: "Popular" },
  { refs: 10, reward: "6 Months Free", platform: "ChatGPT Plus or Claude Pro — your pick", icon: <Sparkles className="w-5 h-5" />, color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10 border-amber-500/20", tag: "Power Sharer" },
]

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const countdown = useCountdown(LAUNCH_DATE)

  // Read referral code from URL if someone opened a referral link
  const [referredBy, setReferredBy] = useState<string>("")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("r")
    if (ref) {
      setReferredBy(ref)
      localStorage.setItem("referredBy", ref)
    } else {
      // Fallback: check localStorage if they landed via redirect
      const stored = localStorage.getItem("referredBy")
      if (stored) setReferredBy(stored)
    }
  }, [])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${baseUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          referredBy: referredBy || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        return
      }

      // Already registered — show their existing position
      if (data.alreadyRegistered) {
        setError("")
        setAlreadyRegistered(true)
        setQueuePosition(data.position)
        setReferralCode(data.referralCode)
        setSubmitted(true)
        return
      }

      setQueuePosition(data.position)
      setReferralCode(data.referralCode)
      setSubmitted(true)
      localStorage.removeItem("referredBy")

    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const referralUrl = `${baseUrl}/ref?r=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🏆 I just joined QuizWait — the AI that tests you and rewards you!\n\nTop 50 at launch wins 3 years of ChatGPT Plus or Claude Pro FREE.\n\nJoin using my link and help me climb the queue 👇\n${referralUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join QuizWait",
        text: "Top 50 at launch wins 3 years of ChatGPT Plus or Claude Pro FREE. Join using my referral link!",
        url: referralUrl,
      })
    }
  }

  const isTop50 = queuePosition !== null && queuePosition <= 50
  const referralsNeeded = queuePosition !== null ? Math.ceil((queuePosition - 50) / 10) : 0

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Quiz<span className="text-violet-400">Wait</span></span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Early Access Open
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-14 pb-10 max-w-4xl mx-auto">

        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          The AI that tests YOU — not just answers you
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-5">
          Know What You Know.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Prove It. Earn It.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl leading-relaxed mb-8">
          QuizWait is an AI-powered assessment companion for anyone who wants to learn with purpose —
          students, job seekers, career switchers, and self-learners.
          Get tested on your own goals. Track your gaps. Unlock real rewards.
        </p>

        {/* Audience chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {AUDIENCE_CARDS.map((a, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${a.bg}`}>
              <span className="text-white/60">{a.icon}</span>
              <span className="text-white/70">{a.label}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/40">{a.context}</span>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3 mb-10 w-full">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/30" />
            <span className="text-xs text-white/30 uppercase tracking-widest">Launching in</span>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hrs", value: countdown.hours },
              { label: "Min", value: countdown.minutes },
              { label: "Sec", value: countdown.seconds },
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest">{unit.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email form or success card */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-violet-500/25"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <> Notify Me <ArrowRight className="w-4 h-4" /> </>
                }
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-2 text-left">{error}</p>
            )}
            <p className="text-xs text-white/25 mt-3">No spam. No credit card. Unsubscribe anytime.</p>
          </form>
        ) : (
          <div className="w-full max-w-md flex flex-col gap-3">

            {/* Already registered notice */}
            {alreadyRegistered && (
              <div className="rounded-xl bg-cyan-500/8 border border-cyan-500/20 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-xs text-white/60">
                  You&apos;re already on the list — here&apos;s your current position and referral link.
                </p>
              </div>
            )}

            {/* Position card */}
            <div className={`rounded-2xl border p-6 text-center ${isTop50
              ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
              : "bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-violet-500/20"}`}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Your position</p>
              <p className={`text-6xl font-extrabold mb-2 ${isTop50
                ? "bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"}`}
              >
                #{queuePosition}
              </p>
              {isTop50 ? (
                <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-300">Inside Top 50 — You&apos;re winning 🏆</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <TrendingUp className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-white/50">
                    Refer <span className="text-white font-semibold">{referralsNeeded} friends</span> to enter Top 50
                  </span>
                </div>
              )}
            </div>

            {/* Top 50 prize */}
            <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 px-4 py-3.5 flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Top 50 at launch wins</p>
                <p className="text-xs text-white/50 mt-0.5">3 years free — ChatGPT Plus or Claude Pro, your choice</p>
              </div>
            </div>

            {/* How spots move */}
            <div className="rounded-xl bg-white/3 border border-white/8 px-4 py-3.5 flex items-center gap-3">
              <Zap className="w-4 h-4 text-violet-400 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                Each referral moves you <span className="text-white font-semibold">10 spots up.</span>{" "}
                Positions are live — anyone below you can climb and take your spot.
              </p>
            </div>

            {/* Email update notice */}
            <div className="rounded-xl bg-white/3 border border-white/8 px-4 py-3.5 flex items-center gap-3">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                We&apos;ll email you whenever your <span className="text-white font-semibold">position changes</span> — so you always know where you stand.
              </p>
            </div>

            {/* Share row */}
            <div className="flex gap-2">
              {/* Copy referral link */}
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl px-4 py-3.5 transition-all duration-200 active:scale-95"
              >
                {copied
                  ? <Check className="w-4 h-4 text-white shrink-0" />
                  : <Copy className="w-4 h-4 text-white/80 shrink-0" />
                }
                <span className="text-sm font-semibold text-white">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>

              {/* WhatsApp share */}
              <button
                onClick={handleWhatsApp}
                title="Share on WhatsApp"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-all duration-200 active:scale-95 shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>

              {/* Native share (mobile) */}
              {typeof navigator !== "undefined" && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  title="Share"
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 active:scale-95 shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white/70 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              )}
            </div>

            <p className="text-[11px] text-white/20 text-center">
              📩 Confirmation sent to <span className="text-white/35">{email}</span>
            </p>
          </div>
        )}
      </section>

      {/* Top 50 Prize Banner — visible to everyone */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/25 shrink-0">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Grand Prize</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Top 50 win 3 Years Free
            </h3>
            <p className="text-sm text-white/50">
              ChatGPT Plus or Claude Pro — your choice. Whoever is in the top 50 at launch day wins.
              Spots are live and change in real time as people refer friends.
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-extrabold bg-gradient-to-br from-amber-400 to-orange-400 bg-clip-text text-transparent">50</p>
            <p className="text-xs text-white/30 mt-0.5">spots only</p>
          </div>
        </div>
      </section>

      {/* How spots work */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 text-center mb-6">
          How Your Spot Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <TrendingUp className="w-5 h-5" />,
              color: "from-violet-500 to-purple-500",
              title: "Live Queue",
              desc: "Your position updates in real time. Every new referral from anyone in the queue reshuffles the order.",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              color: "from-blue-500 to-cyan-500",
              title: "10 Spots Per Referral",
              desc: "Every friend who signs up using your link moves you 10 positions forward instantly.",
            },
            {
              icon: <Mail className="w-5 h-5" />,
              color: "from-emerald-500 to-teal-500",
              title: "Email Alerts",
              desc: "We notify you by email whenever your position changes — so you never miss a move.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/3 border border-white/8 p-5 flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Referral tiers */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-6">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Users className="w-5 h-5 text-white/30" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
            Refer Friends → Unlock Real AI Subscriptions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {REFERRAL_TIERS.map((tier, i) => (
            <div key={i} className={`relative rounded-2xl border p-5 flex flex-col gap-3 ${tier.bg} transition-transform hover:-translate-y-1 duration-200`}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg`}>
                {tier.icon}
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">Refer {tier.refs} friends</p>
                <p className="text-base font-bold text-white leading-tight">{tier.reward}</p>
                <p className="text-xs text-white/50 mt-1">{tier.platform}</p>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                {tier.tag}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-white/20 mt-5 leading-relaxed max-w-xl mx-auto">
          * Referral rewards are subject to terms & conditions. Subscription credits are distributed post-launch based on verified referral count. QuizWait reserves the right to modify reward tiers. Rewards apply to new subscriptions only.
        </p>
      </section>

      {/* API Credits */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-16">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Real API Credits — Earned, Not Referred</h3>
              <p className="text-xs text-white/40 mt-0.5">
                OpenAI & Claude API credits are unlocked only by passing your track assessment. No shortcuts.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { step: "Step 1", title: "Take Your Assessment", desc: "Complete a proctored AI quiz tailored to your track — syllabus, JD, skill goal, or custom topic." },
              { step: "Step 2", title: "Hit the Passing Score", desc: "Each track has its own score threshold. Pass it honestly — the system checks for integrity." },
              { step: "Step 3", title: "Receive API Credits", desc: "Unlock real OpenAI + Claude API credits to power your own projects, workflows, and builds." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-2 bg-white/3 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400/50" />
                  <span className="text-xs font-semibold text-amber-300/80">{s.step}</span>
                </div>
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/20 leading-relaxed">
            * API credit rewards are subject to terms & conditions. Credits are allocated based on available quota, track difficulty, and assessment integrity verification. Referrals do not count toward API credit eligibility. QuizWait reserves the right to modify reward thresholds at launch.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { step: "01", title: "Join the Waitlist", desc: "Enter your email. Get your queue position instantly.", color: "from-violet-500 to-purple-500" },
            { step: "02", title: "Refer & Climb", desc: "Each referral moves you 10 spots up. Race to Top 50.", color: "from-blue-500 to-cyan-500" },
            { step: "03", title: "Get Early Access", desc: "On launch day you're in first. Pick your track and start.", color: "from-emerald-500 to-teal-500" },
            { step: "04", title: "Crack the Test", desc: "Pass the hard assessment on your track. Earn real API credits.", color: "from-amber-500 to-orange-500" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-1`}>
                <span className="text-sm font-extrabold text-white">{item.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold">Quiz<span className="text-violet-400">Wait</span></span>
        </div>
        <p className="text-xs text-white/20">© 2026 QuizWait. Built for those who prove themselves.</p>
      </footer>

    </main>
  )
}