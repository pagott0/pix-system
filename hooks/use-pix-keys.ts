"use client"

import { useEffect, useState } from "react"

export type PixKeyType = "phone" | "email" | "cpf" | "random"

export interface PixKey {
  id: string
  userId: string
  type: PixKeyType
  value: string
  createdAt: string
}

export function usePixKeys() {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPixKeys()
  }, [])

  const fetchPixKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/pix-keys")
      if (!response.ok) throw new Error("Failed to fetch Pix keys")
      const data = await response.json()
      setPixKeys(data)
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
      const newKey = await response.json()
      setPixKeys([...pixKeys, newKey])
      return newKey
    } catch (err) {
      throw err
    }
  }

  const deletePixKey = async (id: string) => {
    try {
      const response = await fetch(`/api/pix-keys/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete Pix key")
      setPixKeys(pixKeys.filter((key) => key.id !== id))
    } catch (err) {
      throw err
    }
  }

  return { pixKeys, loading, error, addPixKey, deletePixKey, refetch: fetchPixKeys }
}
