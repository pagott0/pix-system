"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, User, Calendar, Users, Key } from "lucide-react"
import { PixKeysView } from "./pix-keys-view"
import { PaymentForm } from "./payment-form"

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
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Recent contacts</Label>
                <div className="space-y-2">
                  {["Maria Silva", "João Santos", "Ana Costa"].map((name) => (
                    <Button
                      key={name}
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      disabled
                    >
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                        {name.charAt(0)}
                      </div>
                      {name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="contact-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>
            </div>
          </Card>

          <Button className="w-full" size="lg" disabled>
            Send Pix (Coming Soon)
          </Button>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-receiver">Receiver</Label>
                <Input id="scheduled-receiver" placeholder="Receiver's Pix key" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input id="scheduled-amount" type="number" placeholder="0.00" className="pl-10" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Payment date</Label>
                <Input id="scheduled-date" type="date" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-frequency">Frequency</Label>
                <select
                  id="scheduled-frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled
                >
                  <option>Once</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>
          </Card>

          <Button className="w-full" size="lg" disabled>
            Schedule Payment (Coming Soon)
          </Button>
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
