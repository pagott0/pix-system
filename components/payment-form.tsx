"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"]

interface PaymentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  showCancelButton?: boolean
}

export function PaymentForm({ onSuccess, onCancel, showCancelButton = false }: PaymentFormProps) {
  const [amount, setAmount] = useState("")
  const [receiver, setReceiver] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Food")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const { sendTransaction } = useTransactions()

  const handleSendPix = async () => {
    if (!amount || !receiver) {
      setSubmitError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

      await sendTransaction(receiver, Number.parseFloat(amount), description, selectedCategory)

      setSubmitSuccess(true)
      setAmount("")
      setReceiver("")
      setDescription("")
      setTimeout(() => {
        setSubmitSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setAmount("")
    setReceiver("")
    setDescription("")
    setSubmitError(null)
    setSubmitSuccess(false)
    onCancel?.()
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pix-key">Pix Key</Label>
            <Input
              id="pix-key"
              placeholder="CPF, email, phone or random key"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="amount"
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
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What is this payment for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
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

      {submitError && <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">{submitError}</div>}
      {submitSuccess && (
        <div className="p-3 bg-green-500/10 text-green-600 rounded text-sm">Payment sent successfully!</div>
      )}

      <div className="flex gap-2">
        {showCancelButton && (
          <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button className={showCancelButton ? "flex-1" : "w-full"} size="lg" onClick={handleSendPix} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Send Payment"
          )}
        </Button>
      </div>
    </div>
  )
}

