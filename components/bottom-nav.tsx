"use client"

import { Button } from "@/components/ui/button"
import { Home, Receipt, Send } from "lucide-react"

interface BottomNavProps {
  activeView: "dashboard" | "transactions" | "payment"
  onViewChange: (view: "dashboard" | "transactions" | "payment") => void
}

export function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around px-4 py-3">
        <Button
          variant="ghost"
          className={`flex-col h-auto py-2 gap-1 ${
            activeView === "dashboard" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onViewChange("dashboard")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-col h-auto py-2 gap-1 ${
            activeView === "transactions" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onViewChange("transactions")}
        >
          <Receipt className="h-5 w-5" />
          <span className="text-xs">Transactions</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-col h-auto py-2 gap-1 ${
            activeView === "payment" ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => onViewChange("payment")}
        >
          <Send className="h-5 w-5" />
          <span className="text-xs">Pay</span>
        </Button>
      </div>
    </nav>
  )
}
