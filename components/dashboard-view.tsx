"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Bell } from "lucide-react"
import { BalanceChart } from "@/components/balance-chart"
import { QuickActions } from "@/components/quick-actions"

export function DashboardView() {
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
          <p className="text-4xl font-bold">R$ 4,287.50</p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>+12.5% this month</span>
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

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Received from Maria Silva</p>
              <p className="text-sm text-muted-foreground">Today, 14:32</p>
            </div>
            <p className="font-semibold text-accent">+R$ 150.00</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Payment - Supermarket</p>
              <p className="text-sm text-muted-foreground">Today, 11:20</p>
            </div>
            <p className="font-semibold text-foreground">-R$ 87.40</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Transfer - João Santos</p>
              <p className="text-sm text-muted-foreground">Yesterday, 18:45</p>
            </div>
            <p className="font-semibold text-foreground">-R$ 200.00</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
