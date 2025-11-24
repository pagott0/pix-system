"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Download, QrCode, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PaymentForm } from "@/components/payment-form"
import { ScheduledPaymentForm } from "@/components/scheduled-payment-form"

export function QuickActions() {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="flex-col h-auto py-4 gap-2 bg-transparent"
          onClick={() => setIsSendDialogOpen(true)}
        >
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-xs">Send</span>
        </Button>

      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <Download className="h-5 w-5" />
        </div>
        <span className="text-xs">Receive</span>
      </Button>

      <Button variant="outline" className="flex-col h-auto py-4 gap-2 bg-transparent">
        <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
          <QrCode className="h-5 w-5" />
        </div>
        <span className="text-xs">QR Code</span>
      </Button>

      <Button
        variant="outline"
        className="flex-col h-auto py-4 gap-2 bg-transparent"
        onClick={() => setIsScheduleDialogOpen(true)}
      >
        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <Calendar className="h-5 w-5" />
        </div>
        <span className="text-xs">Schedule</span>
      </Button>
    </div>

    <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Payment</DialogTitle>
          <DialogDescription>Enter the receiver's Pix key and payment details</DialogDescription>
        </DialogHeader>
        <PaymentForm
          onSuccess={() => setIsSendDialogOpen(false)}
          onCancel={() => setIsSendDialogOpen(false)}
          showCancelButton={true}
        />
      </DialogContent>
    </Dialog>

    <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Payment</DialogTitle>
          <DialogDescription>Schedule a payment for a future date</DialogDescription>
        </DialogHeader>
        <ScheduledPaymentForm
          onSuccess={() => setIsScheduleDialogOpen(false)}
          onCancel={() => setIsScheduleDialogOpen(false)}
          showCancelButton={true}
        />
      </DialogContent>
    </Dialog>
    </>
  )
}
