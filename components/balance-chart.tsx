"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useAccount } from "@/hooks/use-account"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/hooks/use-transactions"

type Period = "week" | "month" | "year"

function calculateBalanceEvolution(
  transactions: Transaction[],
  currentBalance: number,
  period: Period,
): Array<{ label: string; value: number; date: Date }> {
  const now = new Date()
  const data: Array<{ label: string; value: number; date: Date }> = []

  // Get start date based on period
  let startDate: Date
  if (period === "week") {
    startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === "month") {
    startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 29)
    startDate.setHours(0, 0, 0, 0)
  } else {
    // year
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)
  }

  // Calculate starting balance (current balance minus all transactions in the period)
  let startingBalance = currentBalance
  transactions.forEach((t) => {
    const tDate = new Date(t.created_at)
    if (tDate >= startDate) {
      startingBalance -= t.amount
    }
  })

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  if (period === "week") {
    // Last 7 days
    for (let i = 0; i <= 6; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      // Calculate balance at end of this day
      let balance = startingBalance
      sortedTransactions.forEach((t) => {
        const tDate = new Date(t.created_at)
        if (tDate >= startDate && tDate <= endOfDay) {
          balance += t.amount
        }
      })

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      data.push({ label: dayName, value: Math.max(0, balance), date })
    }
  } else if (period === "month") {
    // Last 30 days
    for (let i = 0; i <= 29; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      let balance = startingBalance
      sortedTransactions.forEach((t) => {
        const tDate = new Date(t.created_at)
        if (tDate >= startDate && tDate <= endOfDay) {
          balance += t.amount
        }
      })

      // Show label every 5 days to avoid clutter
      const dayLabel = i % 5 === 0 || i === 29 ? date.toLocaleDateString("en-US", { day: "numeric", month: "short" }) : ""
      data.push({ label: dayLabel, value: Math.max(0, balance), date })
    }
  } else if (period === "year") {
    // Last 12 months
    for (let i = 0; i <= 11; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i)
      date.setDate(1)
      date.setHours(0, 0, 0, 0)

      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

      let balance = startingBalance
      sortedTransactions.forEach((t) => {
        const tDate = new Date(t.created_at)
        if (tDate >= startDate && tDate <= endOfMonth) {
          balance += t.amount
        }
      })

      const monthLabel = date.toLocaleDateString("en-US", { month: "short" })
      data.push({ label: monthLabel, value: Math.max(0, balance), date })
    }
  }

  return data
}

export function BalanceChart() {
  const { account, loading: accountLoading } = useAccount()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const [period, setPeriod] = useState<Period>("week")

  const chartData = useMemo(() => {
    if (!account || transactions.length === 0) {
      return []
    }

    return calculateBalanceEvolution(transactions, account.balance, period)
  }, [account, transactions, period])

  const periodLabel = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Yearly"

  if (accountLoading || transactionsLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{periodLabel} evolution</p>
            <p className="text-2xl font-bold">
              R$ {(account?.balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("week")}
              className="h-7 text-xs"
            >
              Week
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
              className="h-7 text-xs"
            >
              Month
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("year")}
              className="h-7 text-xs"
            >
              Year
            </Button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                interval={period === "year" ? 0 : period === "month" ? 4 : 0}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-medium">
                          {data.value.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.date.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: period === "year" ? "numeric" : undefined,
                          })}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ stroke: "#dc2626", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
