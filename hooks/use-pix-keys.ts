"use client"

import { useEffect, useState, useRef } from "react"

export type PixKeyType = "phone" | "email" | "cpf" | "random"

export interface PixKey {
  id: string
  user_id: string
  key_type: PixKeyType
  key_value: string
  created_at: string
}

export function usePixKeys() {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  useEffect(() => {
    // Prevent refetch on window focus
    if (hasFetched.current) return
    hasFetched.current = true
    fetchPixKeys()
  }, [])

  const fetchPixKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/pix-keys")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch Pix keys")
      }
      const data = await response.json()
      if (data.success && data.data) {
        setPixKeys(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch Pix keys")
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPixKeys([])
    } finally {
      setLoading(false)
    }
  }

  const addPixKey = async (type: PixKeyType, value?: string) => {
    try {
      const response = await fetch("/api/pix-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add Pix key")
      }
      const data = await response.json()
      if (data.success && data.data) {
        setPixKeys([...pixKeys, data.data])
        return data.data
      } else {
        throw new Error(data.error || "Failed to add Pix key")
      }
    } catch (err) {
      throw err
    }
  }

  const deletePixKey = async (id: string) => {
    try {
      const response = await fetch(`/api/pix-keys/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete Pix key")
      }
      setPixKeys(pixKeys.filter((key) => key.id !== id))
    } catch (err) {
      throw err
    }
  }

  return { pixKeys, loading, error, addPixKey, deletePixKey, refetch: fetchPixKeys }
}
