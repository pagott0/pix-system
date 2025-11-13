"use client"

import { useEffect, useState } from "react"
import type { Transaction as DbTransaction } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export interface Transaction {
  id: string
  sender_id: string
  receiver_id: string
  type: "sent" | "received"
  amount: number
  description: string
  category: string
  receiver_name: string
  created_at: string
}

interface UseTransactionsOptions {
  category?: string
  limit?: number
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (options.category) params.append("category", options.category)
        if (options.limit) params.append("limit", options.limit.toString())

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch transactions")
        }
        const data = await response.json()
        if (data.success && data.data && user) {
          // Transform database transactions to client format
          const transformed = data.data.map((t: DbTransaction) => {
            const isReceived = t.receiver_id === user.id
            const isSent = t.sender_id === user.id
            
            return {
              id: t.id,
              sender_id: t.sender_id,
              receiver_id: t.receiver_id,
              type: isSent ? "sent" : "received",
              amount: isReceived ? Math.abs(t.amount) : -Math.abs(t.amount),
              description: t.description || "",
              category: t.category || "",
              receiver_name: t.receiver_name || "Unknown User",
              created_at: t.created_at,
            }
          })
          setTransactions(transformed)
        } else {
          throw new Error(data.error || "Failed to fetch transactions")
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTransactions()
    }
  }, [options.category, options.limit, user])

  const sendTransaction = async (receiverPixKey: string, amount: number, description: string, category: string) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverPixKey, amount, description, category }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send transaction")
      }
      const data = await response.json()
      if (data.success && data.data && user) {
        // Transform the new transaction to match client format
        const t = data.data as DbTransaction
        const isReceived = t.receiver_id === user.id
        const isSent = t.sender_id === user.id
        
        const transformed: Transaction = {
          id: t.id,
          sender_id: t.sender_id,
          receiver_id: t.receiver_id,
          type: isSent ? "sent" : "received",
          amount: isReceived ? Math.abs(t.amount) : -Math.abs(t.amount),
          description: t.description || "",
          category: t.category || "",
          receiver_name: t.receiver_name || "Unknown User",
          created_at: t.created_at,
        }
        setTransactions([transformed, ...transactions])
        return transformed
      } else {
        throw new Error(data.error || "Failed to send transaction")
      }
    } catch (err) {
      throw err
    }
  }

  return { transactions, loading, error, sendTransaction }
}
