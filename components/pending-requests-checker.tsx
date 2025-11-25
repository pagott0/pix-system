"use client"

import { useEffect, useState } from "react"
import { usePendingRequests } from "@/hooks/use-pending-requests"
import { PendingRequestDialog } from "./pending-request-dialog"
import { useAuth } from "@/contexts/auth-context"

export function PendingRequestsChecker() {
  const { user } = useAuth()
  const { pendingRequests, refetch } = usePendingRequests()
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (pendingRequests.length > 0 && currentRequestIndex < pendingRequests.length) {
      setIsDialogOpen(true)
    } else if (pendingRequests.length === 0) {
      setIsDialogOpen(false)
      setCurrentRequestIndex(0)
    }
  }, [pendingRequests, currentRequestIndex])

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    // Move to next request if there are more
    if (currentRequestIndex < pendingRequests.length - 1) {
      setTimeout(() => {
        setCurrentRequestIndex(currentRequestIndex + 1)
      }, 300) // Small delay for smooth transition
    } else {
      // All requests processed, reset and refetch
      setCurrentRequestIndex(0)
      setTimeout(() => {
        refetch()
      }, 500)
    }
  }

  const handleSuccess = () => {
    // After success, move to next or refetch
    if (currentRequestIndex < pendingRequests.length - 1) {
      setTimeout(() => {
        setCurrentRequestIndex(currentRequestIndex + 1)
      }, 300)
    } else {
      setCurrentRequestIndex(0)
      setTimeout(() => {
        refetch()
      }, 500)
    }
  }

  const currentRequest = pendingRequests[currentRequestIndex]

  if (!currentRequest) {
    return null
  }

  return (
    <PendingRequestDialog
      request={currentRequest}
      open={isDialogOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}
