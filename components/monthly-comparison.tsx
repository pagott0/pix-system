"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"

function calculateMonthlyData(transactions: any[]) {
  const now = new Date()
  
  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  currentMonthStart.setHours(0, 0, 0, 0)
  
  // Previous month
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  previousMonthStart.setHours(0, 0, 0, 0)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  let currentIncome = 0
  let currentExpenses = 0
  let previousIncome = 0
  let previousExpenses = 0

  transactions.forEach((transaction) => {
    const tDate = new Date(transaction.created_at)
    
    if (tDate >= currentMonthStart) {
      // Current month
      if (transaction.type === "received") {
        currentIncome += Math.abs(transaction.amount)
      } else {
        currentExpenses += Math.abs(transaction.amount)
      }
    } else if (tDate >= previousMonthStart && tDate <= previousMonthEnd) {
      // Previous month
      if (transaction.type === "received") {
        previousIncome += Math.abs(transaction.amount)
      } else {
        previousExpenses += Math.abs(transaction.amount)
      }
    }
  })

  const currentNet = currentIncome - currentExpenses
  const previousNet = previousIncome - previousExpenses

  const incomeChange = previousIncome > 0 
    ? (((currentIncome - previousIncome) / previousIncome) * 100).toFixed(1)
    : currentIncome > 0 ? "100.0" : "0.0"

  const expensesChange = previousExpenses > 0
    ? (((currentExpenses - previousExpenses) / previousExpenses) * 100).toFixed(1)
    : currentExpenses > 0 ? "100.0" : "0.0"

  const netChange = previousNet !== 0
    ? (((currentNet - previousNet) / Math.abs(previousNet)) * 100).toFixed(1)
    : currentNet > 0 ? "100.0" : "0.0"

  return {
    current: {
      income: currentIncome,
      expenses: currentExpenses,
      net: currentNet,
    },
    previous: {
      income: previousIncome,
      expenses: previousExpenses,
      net: previousNet,
    },
    changes: {
      income: Number.parseFloat(incomeChange),
      expenses: Number.parseFloat(expensesChange),
      net: Number.parseFloat(netChange),
    },
  }
}

export function MonthlyComparison() {
  const { transactions, loading } = useTransactions()

  const monthlyData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null
    }
    return calculateMonthlyData(transactions)
  }, [transactions])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!monthlyData) {
    return null
  }

  const { current, changes } = monthlyData

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Income</p>
            {changes.income !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${changes.income > 0 ? "text-green-600" : "text-red-600"}`}>
                {changes.income > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(changes.income)}%</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold">
            R$ {current.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowDownLeft className="h-3 w-3 text-green-600" />
            <span>This month</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Expenses</p>
            {changes.expenses !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${changes.expenses > 0 ? "text-red-600" : "text-green-600"}`}>
                {changes.expenses > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(changes.expenses)}%</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold">
            R$ {current.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 text-red-600" />
            <span>This month</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Net Change</p>
            {changes.net !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${changes.net > 0 ? "text-green-600" : "text-red-600"}`}>
                {changes.net > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(changes.net)}%</span>
              </div>
            )}
          </div>
          <p className={`text-2xl font-bold ${current.net >= 0 ? "text-green-600" : "text-red-600"}`}>
            {current.net >= 0 ? "+" : ""}R$ {Math.abs(current.net).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>This month</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

