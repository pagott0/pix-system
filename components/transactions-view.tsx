"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"

const categories = ["All", "Food", "Transport", "Health", "Entertainment", "Freelance", "Services", "Personal"]

export function TransactionsView() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const { transactions, loading } = useTransactions({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
  })

  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const total = filteredTransactions.reduce((sum, t) => sum + (t.type === "sent" ? -Math.abs(t.amount) : t.amount), 0)

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
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : filteredTransactions.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            <p>No transactions found</p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                {new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <p className="text-sm font-medium">R$ {Math.abs(total).toFixed(2)}</p>
            </div>

            {filteredTransactions.map((transaction) => (
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
                    <p className="font-medium truncate">{transaction.recipientName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? "text-accent" : "text-foreground"}`}>
                    {transaction.amount > 0 ? "+" : ""}R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
