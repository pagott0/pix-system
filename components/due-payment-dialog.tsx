"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader } from "lucide-react"
import type { ScheduledPayment } from "@/lib/types"
import { toast } from "sonner"

interface DuePaymentDialogProps {
  payment: ScheduledPayment
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DuePaymentDialog({ payment, open, onClose, onSuccess }: DuePaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/scheduled-payments/${payment.id}`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute payment")
      }

      toast.success("Payment executed successfully")
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to execute payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/scheduled-payments/${payment.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel payment")
      }

      toast.success("Scheduled payment cancelled")
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const scheduledDate = new Date(payment.scheduled_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scheduled Payment Due</DialogTitle>
          <DialogDescription>
            You have a scheduled payment that is due or overdue. Would you like to execute it now or cancel it?
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Receiver:</span>
            <span className="text-sm font-medium">{payment.receiver_pix_key}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">R$ {Number(payment.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Scheduled Date:</span>
            <span className="text-sm font-medium">{scheduledDate}</span>
          </div>
          {payment.description && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Description:</span>
              <span className="text-sm font-medium">{payment.description}</span>
            </div>
          )}
          {payment.category && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Category:</span>
              <span className="text-sm font-medium">{payment.category}</span>
            </div>
          )}
        </Card>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Payment"
            )}
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Execute Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

