"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { ScheduledPayment } from "@/lib/types"

export function useScheduledPayments() {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchScheduledPayments = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/scheduled-payments")
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled payments")
      }

      const data = await response.json()
      if (data.success && data.data) {
        setScheduledPayments(data.data)
      } else {
        setScheduledPayments([])
      }
    } catch (err) {
      console.error("Error fetching scheduled payments:", err)
      setScheduledPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return { scheduledPayments, loading, refetch: fetchScheduledPayments }
}

