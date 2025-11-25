"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Transaction } from "@/lib/types"

export interface Contact {
  user_id: string
  name: string
  pix_key?: string
  last_transaction_date: string
}

export function useAllContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const lastUserIdRef = useRef<string>("")

  useEffect(() => {
    // Prevent refetch on window focus - only refetch if user changed
    if (lastUserIdRef.current === user?.id && lastUserIdRef.current !== "") {
      return
    }
    lastUserIdRef.current = user?.id || ""

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

        // Get all transactions where user is sender or receiver
        const allTransactions = data.data as Transaction[]

        if (allTransactions.length === 0) {
          setContacts([])
          setLoading(false)
          return
        }

        // Group by the other user's ID and get the most recent transaction for each contact
        const contactsMap = new Map<string, Contact>()

        allTransactions.forEach((transaction) => {
          // Get the other user's ID (receiver if user is sender, sender if user is receiver)
          const otherUserId = transaction.sender_id === user.id ? transaction.receiver_id : transaction.sender_id
          // Get the other user's name - if user is sender, use receiver_name, otherwise we need to fetch sender name
          // For now, we'll use receiver_name if available, or "Unknown User"
          const otherUserName = transaction.receiver_name || "Unknown User"
          const existingContact = contactsMap.get(otherUserId)

          // If this is a more recent transaction, update the contact
          if (!existingContact || new Date(transaction.created_at) > new Date(existingContact.last_transaction_date)) {
            contactsMap.set(otherUserId, {
              user_id: otherUserId,
              name: otherUserName,
              pix_key: transaction.pix_key_used,
              last_transaction_date: transaction.created_at,
            })
          }
        })

        // Sort by most recent
        const sortedContacts = Array.from(contactsMap.values()).sort(
          (a, b) => new Date(b.last_transaction_date).getTime() - new Date(a.last_transaction_date).getTime(),
        )

        setContacts(sortedContacts)
      } catch (err) {
        console.error("Error fetching contacts:", err)
        setContacts([])
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [user])

  return { contacts, loading }
}
