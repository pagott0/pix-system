"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, User, Calendar, Users, Key, Loader } from "lucide-react"
import { PixKeysView } from "./pix-keys-view"
import { PaymentForm } from "./payment-form"
import { useRecentContacts } from "@/hooks/use-recent-contacts"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ScheduledPaymentForm } from "@/components/scheduled-payment-form"
import { useScheduledPayments } from "@/hooks/use-scheduled-payments"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

function ContactPaymentView() {
  const { contacts, loading } = useRecentContacts()
  const [selectedContact, setSelectedContact] = useState<{ name: string; pixKey: string } | null>(null)

  const handleContactSelect = (contact: { receiver_name: string; pix_key: string }) => {
    setSelectedContact({
      name: contact.receiver_name,
      pixKey: contact.pix_key,
    })
  }

  const handlePaymentSuccess = () => {
    setSelectedContact(null)
  }

  if (selectedContact) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {selectedContact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{selectedContact.name}</p>
              <p className="text-sm text-muted-foreground">{selectedContact.pixKey}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
              Change
            </Button>
          </div>
        </Card>

        <PaymentForm
          defaultReceiver={selectedContact.pixKey}
          receiverReadOnly={true}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Recent contacts</Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No recent contacts found</p>
              <p className="text-xs mt-1">Send a payment to someone to add them to your contacts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <Button
                  key={contact.receiver_id}
                  variant="outline"
                  className="w-full h-14 justify-start bg-transparent hover:bg-accent cursor-pointer"
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    {contact.receiver_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{contact.receiver_name}</p>
                    <p className="text-xs text-muted-foreground">{contact.pix_key}</p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function ScheduledPaymentView() {
  const { scheduledPayments, loading, refetch } = useScheduledPayments()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled payment?")) {
      return
    }

    try {
      const response = await fetch(`/api/scheduled-payments/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel scheduled payment")
      }

      toast.success("Scheduled payment cancelled")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel scheduled payment")
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const pendingPayments = scheduledPayments.filter((p) => p.status === "pending")

  return (
    <div className="space-y-4">
      <ScheduledPaymentForm onSuccess={handleSuccess} />

      {pendingPayments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Scheduled Payments</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {pendingPayments.map((payment) => {
                const scheduledDate = new Date(payment.scheduled_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })

                const isOverdue = new Date(payment.scheduled_date) < new Date()

                return (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{payment.receiver_pix_key}</p>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>R$ {Number(payment.amount).toFixed(2)}</span>
                          <span>{scheduledDate}</span>
                          {payment.category && (
                            <Badge variant="secondary" className="text-xs">
                              {payment.category}
                            </Badge>
                          )}
                        </div>
                        {payment.description && (
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(payment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PaymentView() {
  return (
    <div className="px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">New Payment</h1>
        <p className="text-sm text-muted-foreground">Choose how you want to pay</p>
      </header>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pix">
            <QrCode className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="contact">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="split">
            <Users className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Key className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6">
          <PixKeysView />
        </TabsContent>

        <TabsContent value="pix" className="space-y-4 mt-6">
          <PaymentForm />

          <div className="flex items-center justify-center py-4">
            <div className="text-center space-y-2">
              <div className="h-32 w-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">or scan a QR Code</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-6">
          <ContactPaymentView />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <ScheduledPaymentView />
        </TabsContent>

        <TabsContent value="split" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="split-amount">Total amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input id="split-amount" type="number" placeholder="0.00" className="pl-10" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="split-people">Split between</Label>
                <Input id="split-people" type="number" placeholder="Number of people" min="2" disabled />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Amount per person</p>
                <p className="text-2xl font-bold">R$ 0.00</p>
              </div>

              <div className="space-y-2">
                <Label>Add participants</Label>
                <Button variant="outline" className="w-full bg-transparent" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  Select contacts
                </Button>
              </div>
            </div>
          </Card>

          <Button className="w-full" size="lg" disabled>
            Create Split (Coming Soon)
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
