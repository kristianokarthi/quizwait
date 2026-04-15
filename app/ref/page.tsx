"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function RefPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("r")
    if (code) {
      // Store in localStorage so homepage can read it
      localStorage.setItem("referredBy", code)
    }
    // Redirect to homepage with the ref param preserved
    router.replace(`/?r=${code ?? ""}`)
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Redirecting...</p>
      </div>
    </main>
  )
}