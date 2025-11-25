"use client"

import { useEffect, useState } from "react"
import { useDuePayments } from "@/hooks/use-due-payments"
import { DuePaymentDialog } from "./due-payment-dialog"
import { useAuth } from "@/contexts/auth-context"

export function DuePaymentsChecker() {
  const { user } = useAuth()
  const { duePayments, refetch } = useDuePayments()
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (duePayments.length > 0 && currentPaymentIndex < duePayments.length) {
      setIsDialogOpen(true)
    } else if (duePayments.length === 0) {
      setIsDialogOpen(false)
      setCurrentPaymentIndex(0)
    }
  }, [duePayments, currentPaymentIndex])

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    // Move to next payment if there are more
    if (currentPaymentIndex < duePayments.length - 1) {
      setTimeout(() => {
        setCurrentPaymentIndex(currentPaymentIndex + 1)
      }, 300) // Small delay for smooth transition
    } else {
      // All payments processed, reset and refetch
      setCurrentPaymentIndex(0)
      setTimeout(() => {
        refetch()
      }, 500)
    }
  }

  const handleSuccess = () => {
    // After success, move to next or refetch
    if (currentPaymentIndex < duePayments.length - 1) {
      setTimeout(() => {
        setCurrentPaymentIndex(currentPaymentIndex + 1)
      }, 300)
    } else {
      setCurrentPaymentIndex(0)
      setTimeout(() => {
        refetch()
      }, 500)
    }
  }

  const currentPayment = duePayments[currentPaymentIndex]

  if (!currentPayment) {
    return null
  }

  return (
    <DuePaymentDialog
      payment={currentPayment}
      open={isDialogOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}
