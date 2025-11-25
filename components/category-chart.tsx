"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = [
  "#dc2626", // red-600
  "#ef4444", // red-500
  "#f87171", // red-400
  "#fca5a5", // red-300
  "#fecaca", // red-200
  "#fee2e2", // red-100
  "#dc2626", // red-600 (repeat)
  "#ef4444", // red-500 (repeat)
]

function calculateCategorySpending(transactions: any[]) {
  const categoryMap = new Map<string, number>()

  transactions.forEach((transaction) => {
    if (transaction.type === "sent" && transaction.category) {
      const amount = Math.abs(transaction.amount)
      const current = categoryMap.get(transaction.category) || 0
      categoryMap.set(transaction.category, current + amount)
    }
  })

  // Convert to array and sort by amount (descending)
  const data = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)

  return data
}

export function CategoryChart() {
  const { transactions, loading } = useTransactions()

  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    return calculateCategorySpending(transactions)
  }, [transactions])

  const totalSpent = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0)
  }, [categoryData])

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (categoryData.length === 0) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Spending by category</p>
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No spending data available
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Spending by category</p>
          <p className="text-2xl font-bold">
            R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]
                  const percent = ((data.value as number) / totalSpent) * 100
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-sm">
                        {Number(data.value).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(1)}% of total</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              formatter={(value, entry: any) => {
                const percent = ((entry.payload.value / totalSpent) * 100).toFixed(0)
                return `${value} (${percent}%)`
              }}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

