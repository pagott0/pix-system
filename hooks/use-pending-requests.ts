"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { PaymentRequest } from "@/lib/types"

export function usePendingRequests() {
  const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const checkPendingRequests = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/payment-requests/pending")
      if (!response.ok) {
        throw new Error("Failed to fetch pending requests")
      }

      const data = await response.json()
      if (data.success && data.data) {
        setPendingRequests(data.data)
      } else {
        setPendingRequests([])
      }
    } catch (err) {
      console.error("Error checking pending requests:", err)
      setPendingRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPendingRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return { pendingRequests, loading, refetch: checkPendingRequests }
}

