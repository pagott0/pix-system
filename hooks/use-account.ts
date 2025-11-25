"use client"

import { useEffect, useState, useRef } from "react"

interface Account {
  id: string
  user_id: string
  balance: number
  institution_name: string
  created_at: string
  updated_at: string
}

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent refetch on window focus
    if (hasFetched.current) return

    const fetchAccount = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/accounts/current")
        if (!response.ok) throw new Error("Failed to fetch account")
        const data = await response.json()
        setAccount(data)
        setError(null)
        hasFetched.current = true
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setAccount(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  return { account, loading, error }
}
