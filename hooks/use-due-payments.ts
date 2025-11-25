"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { ScheduledPayment } from "@/lib/types"

export function useDuePayments() {
  const [duePayments, setDuePayments] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const lastUserIdRef = useRef<string>("")

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
    // Prevent refetch on window focus - only refetch if user changed
    if (lastUserIdRef.current === user?.id && lastUserIdRef.current !== "") {
      return
    }
    lastUserIdRef.current = user?.id || ""
    checkDuePayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return { duePayments, loading, refetch: checkDuePayments }
}

