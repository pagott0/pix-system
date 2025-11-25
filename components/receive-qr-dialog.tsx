"use client"

import { QrCode } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReceiveQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveQrDialog({ open, onOpenChange }: ReceiveQrDialogProps) {
  const { user } = useAuth()
  const accountName = user?.email || "your account"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Receive via Pix QR</DialogTitle>
          <DialogDescription>Show this QR code to let someone pay you instantly.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/50">
            <QrCode className="h-24 w-24 text-muted-foreground" />
          </div>
          <p className="text-center text-sm">
            Scan this to make a payment to <span className="font-semibold">{accountName}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
