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

const LAUNCH_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

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
  const [aiMessage, setAiMessage] = useState<string>("")
  const [aiLoading, setAiLoading] = useState<boolean>(false)
  const countdown = useCountdown(LAUNCH_DATE)

  const [referredBy, setReferredBy] = useState<string>("")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("r")
    if (ref) {
      setReferredBy(ref)
      localStorage.setItem("referredBy", ref)
    } else {
      const stored = localStorage.getItem("referredBy")
      if (stored) setReferredBy(stored)
    }
  }, [])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  const fetchAiMessage = (position: number) => {
    setAiLoading(true)
    fetch(`${baseUrl}/api/generate-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("AI message data:", data)
        if (data.message) 
}