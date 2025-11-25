"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, LogOut } from "lucide-react"
import { BalanceChart } from "@/components/balance-chart"
import { CategoryChart } from "@/components/category-chart"
import { IncomeExpensesChart } from "@/components/income-expenses-chart"
import { MonthlyComparison } from "@/components/monthly-comparison"
import { TopContacts } from "@/components/top-contacts"
import { QuickActions } from "@/components/quick-actions"
import { useAccount } from "@/hooks/use-account"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardView() {
  const { account, loading: accountLoading } = useAccount()
  const { transactions: allTransactions } = useTransactions() // Get all transactions for monthly calculation
  const { transactions: recentTransactions, loading: transactionsLoading } = useTransactions({ limit: 3 })
  const { logout } = useAuth()

  if (accountLoading) {
    return (
      <div className="px-4 py-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const balanceDisplay = account?.balance ?? 0
  
  // Calculate monthly return based on current month transactions
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyTransactions = allTransactions.filter((t) => {
    const tDate = new Date(t.created_at)
    return tDate >= startOfMonth
  })

  // Calculate starting balance for the month (current balance minus all transactions this month)
  let startingBalance = balanceDisplay
  monthlyTransactions.forEach((t) => {
    startingBalance -= t.amount
  })

  // Calculate monthly return percentage
  const monthlyReturn = startingBalance > 0 
    ? (((balanceDisplay - startingBalance) / startingBalance) * 100).toFixed(1)
    : balanceDisplay > startingBalance 
      ? "100.0" 
      : "0.0"

  return (
    <div className="px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pix+</h1>
          <p className="text-sm text-muted-foreground">Welcome back</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Card className="p-6 bg-primary text-primary-foreground">
        <div className="space-y-2">
          <p className="text-sm opacity-90">Available balance</p>
          <p className="text-4xl font-bold">
            R$ {balanceDisplay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>{monthlyReturn}% this month</span>
          </div>
        </div>
      </Card>

      <QuickActions />

      <MonthlyComparison />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
          </Button>
        </div>

        <BalanceChart />
        <CategoryChart />
        <IncomeExpensesChart />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Top Contacts</h2>
        <TopContacts />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent transactions</h2>

        {transactionsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : recentTransactions.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No transactions yet</p>
          </Card>
        ) : (
          recentTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.type === "received" ? "bg-accent" : "bg-secondary"
                  }`}
                >
                  {transaction.type === "received" ? (
                    <ArrowDownLeft className="h-5 w-5 text-accent-foreground" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-secondary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{transaction.receiver_name || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className={`font-semibold ${transaction.type === "received" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type === "received" ? "+" : "-"}R$ {Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
