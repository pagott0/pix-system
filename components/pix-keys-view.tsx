"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, CreditCard, Key, Plus, Trash2, Copy, Check } from "lucide-react"

type PixKeyType = "phone" | "email" | "cpf" | "random"

interface PixKey {
  id: string
  type: PixKeyType
  value: string
  createdAt: Date
}

export function PixKeysView() {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([
    {
      id: "1",
      type: "phone",
      value: "+55 11 98765-4321",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      type: "email",
      value: "user@example.com",
      createdAt: new Date("2024-02-20"),
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState<PixKeyType>("phone")
  const [keyValue, setKeyValue] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const getKeyIcon = (type: PixKeyType) => {
    switch (type) {
      case "phone":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "cpf":
        return <CreditCard className="h-4 w-4" />
      case "random":
        return <Key className="h-4 w-4" />
    }
  }

  const getKeyLabel = (type: PixKeyType) => {
    switch (type) {
      case "phone":
        return "Phone Number"
      case "email":
        return "Email"
      case "cpf":
        return "CPF"
      case "random":
        return "Random Key"
    }
  }

  const canAddKeyType = (type: PixKeyType) => {
    if (type === "random") return true
    return !pixKeys.some((key) => key.type === type)
  }

  const generateRandomKey = () => {
    const chars = "0123456789abcdef"
    let key = ""
    for (let i = 0; i < 32; i++) {
      key += chars[Math.floor(Math.random() * chars.length)]
      if ([7, 11, 15, 19].includes(i)) key += "-"
    }
    return key
  }

  const handleAddKey = () => {
    if (!keyValue.trim() && selectedType !== "random") return

    const newKey: PixKey = {
      id: Date.now().toString(),
      type: selectedType,
      value: selectedType === "random" ? generateRandomKey() : keyValue,
      createdAt: new Date(),
    }

    setPixKeys([...pixKeys, newKey])
    setKeyValue("")
    setShowAddForm(false)
  }

  const handleDeleteKey = (id: string) => {
    setPixKeys(pixKeys.filter((key) => key.id !== id))
  }

  const handleCopyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPlaceholder = (type: PixKeyType) => {
    switch (type) {
      case "phone":
        return "+55 11 98765-4321"
      case "email":
        return "your@email.com"
      case "cpf":
        return "123.456.789-00"
      case "random":
        return "Will be generated automatically"
    }
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Pix Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your registered keys</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Key
        </Button>
      </header>

      {showAddForm && (
        <Card className="p-6 space-y-4 border-primary">
          <div className="space-y-2">
            <Label>Key Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["phone", "email", "cpf", "random"] as PixKeyType[]).map((type) => {
                const disabled = !canAddKeyType(type)
                return (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className="justify-start bg-transparent"
                    onClick={() => setSelectedType(type)}
                    disabled={disabled}
                  >
                    {getKeyIcon(type)}
                    <span className="ml-2">{getKeyLabel(type)}</span>
                    {disabled && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Added
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {selectedType !== "random" && (
            <div className="space-y-2">
              <Label htmlFor="key-value">{getKeyLabel(selectedType)}</Label>
              <Input
                id="key-value"
                placeholder={getPlaceholder(selectedType)}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                type={selectedType === "email" ? "email" : "text"}
              />
            </div>
          )}

          {selectedType === "random" && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                A random key will be automatically generated for you. You can have multiple random keys.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAddKey} className="flex-1">
              {selectedType === "random" ? "Generate Key" : "Add Key"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="bg-transparent">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <Label className="text-base">Registered Keys ({pixKeys.length})</Label>

        {pixKeys.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Key className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No Pix keys registered yet</p>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="bg-transparent">
                Add your first key
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {pixKeys.map((key) => (
              <Card key={key.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getKeyIcon(key.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{getKeyLabel(key.type)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {key.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground break-all">{key.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">Added {key.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyKey(key.id, key.value)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === key.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteKey(key.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="space-y-2">
          <p className="text-sm font-medium">About Pix Keys</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• You can register one phone number, one email, and one CPF</li>
            <li>• Random keys can be registered multiple times</li>
            <li>• Keys are used to receive Pix payments instantly</li>
            <li>• You can delete and re-register keys at any time</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
