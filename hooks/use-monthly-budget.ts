"use client"

import { useEffect, useState } from "react"
import type { MonthlyBudget } from "@/lib/types"

export function useMonthlyBudget() {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudget = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/budget")
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch budget")
      }
      const data = await response.json()
      if (data.success) {
        setBudget(data.data ?? null)
        setError(null)
      } else {
        setError(data.error || "Failed to fetch budget")
        setBudget(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch budget")
      setBudget(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudget()
  }, [])

  const saveBudget = async (amount: number, description?: string) => {
    try {
      setSaving(true)
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save budget")
      }

      setBudget(data.data)
      setError(null)
      return data.data as MonthlyBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget")
      throw err
    } finally {
      setSaving(false)
    }
  }

  return { budget, loading, saving, error, refetch: fetchBudget, saveBudget }
}

