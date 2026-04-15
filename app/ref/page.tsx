"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Brain } from "lucide-react"

function RefRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("r")
    if (code) {
      localStorage.setItem("referredBy", code)
    }
    router.replace(`/?r=${code ?? ""}`)
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
        <Brain className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Redirecting...</p>
      </div>
    </main>
  )
}

export default function RefPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <span className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    }>
      <RefRedirect />
    </Suspense>
  )
}