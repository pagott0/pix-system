"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react"

const transactions = [
  { id: 1, type: "received", name: "Maria Silva", category: "Freelance", date: "Today, 14:32", amount: 150.0 },
  { id: 2, type: "sent", name: "Extra Supermarket", category: "Food", date: "Today, 11:20", amount: -87.4 },
  { id: 3, type: "sent", name: "João Santos", category: "Personal", date: "Yesterday, 18:45", amount: -200.0 },
  { id: 4, type: "received", name: "Client XYZ", category: "Services", date: "Yesterday, 15:30", amount: 450.0 },
  { id: 5, type: "sent", name: "Popular Pharmacy", category: "Health", date: "Jan 15, 10:15", amount: -65.8 },
  { id: 6, type: "sent", name: "Netflix", category: "Entertainment", date: "Jan 14, 09:00", amount: -39.9 },
  { id: 7, type: "received", name: "Ana Costa", category: "Refund", date: "Jan 13, 16:20", amount: 120.0 },
  { id: 8, type: "sent", name: "Uber", category: "Transport", date: "Jan 12, 22:30", amount: -28.5 },
]

const categories = ["All", "Food", "Transport", "Health", "Entertainment", "Freelance", "Services"]

export function TransactionsView() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="px-4 py-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-10" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">January 2025</h2>
          <p className="text-sm font-medium">R$ 298.40</p>
        </div>

        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  transaction.type === "received" ? "bg-accent" : "bg-secondary"
                }`}
              >
                {transaction.type === "received" ? (
                  <ArrowDownLeft
                    className={`h-5 w-5 ${
                      transaction.type === "received" ? "text-accent-foreground" : "text-secondary-foreground"
                    }`}
                  />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-secondary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${transaction.amount > 0 ? "text-accent" : "text-foreground"}`}>
                {transaction.amount > 0 ? "+" : ""}R$ {Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
