"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader } from "lucide-react"
import { useAllContacts, type Contact } from "@/hooks/use-all-contacts"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface RequestMoneyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestMoneyDialog({ open, onOpenChange }: RequestMoneyDialogProps) {
  const { contacts, loading } = useAllContacts()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
  }

  const handleRequest = async () => {
    if (!selectedContact || !amount) {
      toast.error("Please select a contact and enter an amount")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedContact.user_id,
          amount: amountNum,
          description: description || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment request")
      }

      toast.success("Payment request sent successfully")
      setSelectedContact(null)
      setAmount("")
      setDescription("")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send payment request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSelectedContact(null)
    setAmount("")
    setDescription("")
  }

  if (selectedContact) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Money</DialogTitle>
            <DialogDescription>Request money from {selectedContact.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                  Change
                </Button>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="request-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="request-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request-description">Description (optional)</Label>
              <Input
                id="request-description"
                placeholder="What is this request for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Money</DialogTitle>
          <DialogDescription>Select a contact to request money from</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No contacts found</p>
              <p className="text-xs mt-1">Send or receive a payment to add contacts</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <Button
                key={contact.user_id}
                variant="outline"
                className="w-full h-14 justify-start bg-transparent hover:bg-accent cursor-pointer"
                onClick={() => handleContactSelect(contact)}
              >
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{contact.name}</p>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
