"use client"

import { Card } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useAccount } from "@/hooks/use-account"
import { Skeleton } from "@/components/ui/skeleton"

export function BalanceChart() {
  const { account, loading } = useAccount()

  const data = [
    { day: "Mon", value: 3200 },
    { day: "Tue", value: 3800 },
    { day: "Wed", value: 3500 },
    { day: "Thu", value: 4100 },
    { day: "Fri", value: 3900 },
    { day: "Sat", value: 4500 },
    { day: "Sun", value: account?.balance ?? 4287.5 },
  ]

  if (loading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Weekly evolution</p>
            <p className="text-2xl font-bold">
              R$ {(account?.balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
