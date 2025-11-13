"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Bell } from "lucide-react"
import { BalanceChart } from "@/components/balance-chart"
import { QuickActions } from "@/components/quick-actions"
import { useAccount } from "@/hooks/use-account"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardView() {
  const { account, loading: accountLoading } = useAccount()
  const { transactions, loading: transactionsLoading } = useTransactions({ limit: 3 })

  if (accountLoading) {
    return (
      <div className="px-4 py-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const balanceDisplay = account?.balance ?? 0
  const monthlyIncome = account?.income ?? 0
  const monthlyExpense = account?.expense ?? 0
  const monthlyGrowth = monthlyExpense > 0 ? ((monthlyIncome / monthlyExpense) * 100 - 100).toFixed(1) : 0

  return (
    <div className="px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pix+</h1>
          <p className="text-sm text-muted-foreground">Welcome back</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
        </Button>
      </header>

      <Card className="p-6 bg-primary text-primary-foreground">
        <div className="space-y-2">
          <p className="text-sm opacity-90">Available balance</p>
          <p className="text-4xl font-bold">
            R$ {balanceDisplay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>{monthlyGrowth}% this month</span>
          </div>
        </div>
      </Card>

      <QuickActions />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
          </Button>
        </div>

        <BalanceChart />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent transactions</h2>

        {transactionsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : transactions.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No transactions yet</p>
          </Card>
        ) : (
          transactions.map((transaction) => (
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
                  <p className="font-medium">{transaction.recipientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <p className={`font-semibold ${transaction.type === "received" ? "text-accent" : "text-foreground"}`}>
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
