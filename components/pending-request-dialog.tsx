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
import type { PaymentRequest } from "@/lib/types"
import { toast } from "sonner"

interface PendingRequestDialogProps {
  request: PaymentRequest
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PendingRequestDialog({ request, open, onClose, onSuccess }: PendingRequestDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/payment-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept payment request")
      }

      toast.success("Payment request accepted")
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept payment request")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/payment-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject payment request")
      }

      toast.success("Payment request rejected")
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject payment request")
    } finally {
      setIsProcessing(false)
    }
  }

  const createdDate = new Date(request.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Request</DialogTitle>
          <DialogDescription>
            {request.requester_name || "Someone"} is requesting money from you
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">From:</span>
            <span className="text-sm font-medium">{request.requester_name || "Unknown User"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-medium">R$ {Number(request.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="text-sm font-medium">{createdDate}</span>
          </div>
          {request.description && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Description:</span>
              <span className="text-sm font-medium">{request.description}</span>
            </div>
          )}
        </Card>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReject} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </Button>
          <Button onClick={handleAccept} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Accept"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
