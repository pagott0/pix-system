"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/hooks/use-transactions"

function calculateIncomeExpenses(transactions: Transaction[]) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const dataMap = new Map<string, { income: number; expenses: number; date: Date }>()

  transactions.forEach((transaction) => {
    const tDate = new Date(transaction.created_at)
    
    // Group by month
    const key = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, "0")}`

    const existing = dataMap.get(key)

    if (!existing) {
      const monthDate = new Date(tDate.getFullYear(), tDate.getMonth(), 1)
      dataMap.set(key, {
        income: 0,
        expenses: 0,
        date: monthDate,
      })
    }

    const entry = dataMap.get(key)!
    if (transaction.type === "received") {
      entry.income += Math.abs(transaction.amount)
    } else {
      entry.expenses += Math.abs(transaction.amount)
    }
  })

  // Convert to array, sort by date, and only include months with data
  const data = Array.from(dataMap.entries())
    .map(([key, values]) => {
      const label = values.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      return {
        label,
        income: values.income,
        expenses: values.expenses,
        date: values.date,
      }
    })
    .filter((item) => item.income > 0 || item.expenses > 0) // Only show months with data
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by date ascending

  return data
}

export function IncomeExpensesChart() {
  const { transactions, loading } = useTransactions()

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }
    return calculateIncomeExpenses(transactions)
  }, [transactions])

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Monthly Income vs Expenses</p>
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                interval={0}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name === "income" ? "Income" : "Expenses"}:{" "}
                            {Number(entry.value).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                formatter={(value) => (value === "income" ? "Income" : "Expenses")}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

