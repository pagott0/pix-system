"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Transaction } from "@/lib/types"

export interface RecentContact {
  receiver_id: string
  receiver_name: string
  pix_key: string
  last_transaction_date: string
}

export function useRecentContacts() {
  const [contacts, setContacts] = useState<RecentContact[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }

        const data = await response.json()
        if (!data.success || !data.data) {
          setContacts([])
          setLoading(false)
          return
        }

        // Filter transactions where user is the sender
        const sentTransactions = (data.data as Transaction[]).filter((t) => t.sender_id === user.id)

        if (sentTransactions.length === 0) {
          setContacts([])
          setLoading(false)
          return
        }

        // Group by receiver_id and get the most recent transaction for each contact
        const contactsMap = new Map<string, RecentContact>()

        sentTransactions.forEach((transaction) => {
          const existingContact = contactsMap.get(transaction.receiver_id)

          // If this is a more recent transaction, update the contact
          if (!existingContact || new Date(transaction.created_at) > new Date(existingContact.last_transaction_date)) {
            contactsMap.set(transaction.receiver_id, {
              receiver_id: transaction.receiver_id,
              receiver_name: transaction.receiver_name || "Unknown User",
              pix_key: transaction.pix_key_used || "",
              last_transaction_date: transaction.created_at,
            })
          }
        })

        // Filter out contacts without pix keys
        const contactsWithKeys = Array.from(contactsMap.values()).filter((c) => c.pix_key)

        // Validate each pix key to ensure it still exists
        const validatedContacts = await Promise.all(
          contactsWithKeys.map(async (contact) => {
            try {
              const response = await fetch("/api/pix-keys/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pixKey: contact.pix_key }),
              })

              if (!response.ok) {
                return null
              }

              const data = await response.json()
              if (data.success && data.data?.valid) {
                return contact
              }
              return null
            } catch (err) {
              console.error(`Error validating pix key for contact ${contact.receiver_id}:`, err)
              return null
            }
          }),
        )

        // Filter out null values and sort by most recent
        const validContacts = validatedContacts
          .filter((c): c is RecentContact => c !== null)
          .sort((a, b) => new Date(b.last_transaction_date).getTime() - new Date(a.last_transaction_date).getTime())

        setContacts(validContacts)
      } catch (err) {
        console.error("Error fetching recent contacts:", err)
        setContacts([])
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [user])

  return { contacts, loading }
}

