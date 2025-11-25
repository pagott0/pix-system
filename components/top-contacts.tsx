"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import type { Transaction } from "@/hooks/use-transactions"

interface ContactSummary {
  user_id: string
  name: string
  totalReceived: number
  totalSent: number
  transactionCount: number
  lastTransactionDate: string
}

function calculateTopContacts(transactions: Transaction[], currentUserId: string) {
  const contactMap = new Map<string, ContactSummary>()

  transactions.forEach((transaction) => {
    // Get the other user's ID - if user is sender, other is receiver; if user is receiver, other is sender
    const otherUserId = transaction.sender_id === currentUserId ? transaction.receiver_id : transaction.sender_id
    const otherUserName = transaction.receiver_name || "Unknown User"

    let existing = contactMap.get(otherUserId)

    if (!existing) {
      existing = {
        user_id: otherUserId,
        name: otherUserName,
        totalReceived: 0,
        totalSent: 0,
        transactionCount: 0,
        lastTransactionDate: transaction.created_at,
      }
    }

    // Update name if this transaction is more recent (in case name changed)
    const transactionDate = new Date(transaction.created_at)
    const existingDate = new Date(existing.lastTransactionDate)
    if (transactionDate >= existingDate) {
      existing.name = otherUserName
      existing.lastTransactionDate = transaction.created_at
    }

    if (transaction.type === "received") {
      existing.totalReceived += Math.abs(transaction.amount)
    } else {
      existing.totalSent += Math.abs(transaction.amount)
    }
    existing.transactionCount += 1

    contactMap.set(otherUserId, existing)
  })

  // Convert to array, sort by total transaction amount (sent + received), and take top 5
  const contacts = Array.from(contactMap.values())
    .map((contact) => ({
      ...contact,
      totalAmount: contact.totalReceived + contact.totalSent,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)

  return contacts
}

export function TopContacts() {
  const { transactions, loading } = useTransactions()
  const { user } = useAuth()

  const topContacts = useMemo(() => {
    if (!transactions || transactions.length === 0 || !user) {
      return []
    }
    return calculateTopContacts(transactions, user.id)
  }, [transactions, user])

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (topContacts.length === 0) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Top Contacts</p>
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            No contacts data available
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Top Contacts</p>
        <div className="space-y-3">
          {topContacts.map((contact, index) => (
            <div key={contact.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contact.transactionCount} transaction{contact.transactionCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium">
                  R$ {contact.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {contact.totalReceived > 0 && (
                    <span className="text-green-600">+{contact.totalReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  )}
                  {contact.totalSent > 0 && (
                    <span className="text-red-600">-{contact.totalSent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
