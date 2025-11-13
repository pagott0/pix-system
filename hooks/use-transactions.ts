"use client"

import { useEffect, useState } from "react"

export interface Transaction {
  id: string
  userId: string
  type: "sent" | "received"
  amount: number
  description: string
  category: string
  recipientName: string
  createdAt: string
}

interface UseTransactionsOptions {
  category?: string
  limit?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (options.category) params.append("category", options.category)
        if (options.limit) params.append("limit", options.limit.toString())

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch transactions")
        const data = await response.json()
        setTransactions(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [options.category, options.limit])

  const sendTransaction = async (recipientPixKey: string, amount: number, description: string, category: string) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientPixKey, amount, description, category }),
      })
      if (!response.ok) throw new Error("Failed to send transaction")
      const newTransaction = await response.json()
      setTransactions([newTransaction, ...transactions])
      return newTransaction
    } catch (err) {
      throw err
    }
  }

  return { transactions, loading, error, sendTransaction }
}
