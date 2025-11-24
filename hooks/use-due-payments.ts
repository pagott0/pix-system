"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { ScheduledPayment } from "@/lib/types"

export function useDuePayments() {
  const [duePayments, setDuePayments] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const checkDuePayments = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/scheduled-payments/due")
      if (!response.ok) {
        throw new Error("Failed to fetch due payments")
      }

      const data = await response.json()
      if (data.success && data.data) {
        setDuePayments(data.data)
      } else {
        setDuePayments([])
      }
    } catch (err) {
      console.error("Error checking due payments:", err)
      setDuePayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDuePayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return { duePayments, loading, refetch: checkDuePayments }
}

