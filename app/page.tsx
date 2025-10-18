"use client"

import { useState } from "react"
import { DashboardView } from "@/components/dashboard-view"
import { TransactionsView } from "@/components/transactions-view"
import { PaymentView } from "@/components/payment-view"
import { BottomNav } from "@/components/bottom-nav"

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "transactions" | "payment">("dashboard")

  return (
    <main className="min-h-screen bg-background pb-20">
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "transactions" && <TransactionsView />}
      {activeView === "payment" && <PaymentView />}

      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </main>
  )
}
