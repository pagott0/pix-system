"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardView } from "@/components/dashboard-view"
import { TransactionsView } from "@/components/transactions-view"
import { PaymentView } from "@/components/payment-view"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "transactions" | "payment">("dashboard")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "transactions" && <TransactionsView />}
      {activeView === "payment" && <PaymentView />}

      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </main>
  )
}
