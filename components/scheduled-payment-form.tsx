"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "lucide-react"
import { toast } from "sonner"

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"]

interface ScheduledPaymentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCancelButton?: boolean
}

export function ScheduledPaymentForm({ onSuccess, onCancel, showCancelButton = false }: ScheduledPaymentFormProps) {
  const [receiver, setReceiver] = useState("")
  const [amount, setAmount] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Food")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSchedulePayment = async () => {
    if (!receiver || !amount || !scheduledDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const dateObj = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dateObj < today) {
      toast.error("Scheduled date must be today or in the future")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/scheduled-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverPixKey: receiver,
          amount: amountNum,
          scheduledDate,
          description,
          category: selectedCategory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule payment")
      }

      toast.success("Payment scheduled successfully")
      setReceiver("")
      setAmount("")
      setScheduledDate("")
      setDescription("")
      setSelectedCategory("Food")
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setReceiver("")
    setAmount("")
    setScheduledDate("")
    setDescription("")
    setSelectedCategory("Food")
    onCancel?.()
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled-receiver">Receiver Pix Key</Label>
            <Input
              id="scheduled-receiver"
              placeholder="CPF, email, phone or random key"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="scheduled-amount"
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
            <Label htmlFor="scheduled-date">Payment Date</Label>
            <Input
              id="scheduled-date"
              type="date"
              min={today}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-description">Description (optional)</Label>
            <Input
              id="scheduled-description"
              placeholder="What is this payment for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-category">Category</Label>
            <select
              id="scheduled-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {showCancelButton && (
          <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          className={showCancelButton ? "flex-1" : "w-full"}
          size="lg"
          onClick={handleSchedulePayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Payment"
          )}
        </Button>
      </div>
    </div>
  )
}

