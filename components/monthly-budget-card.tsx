"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useMonthlyBudget } from "@/hooks/use-monthly-budget"
import { toast } from "sonner"

interface MonthlyBudgetCardProps {
  monthlySpent: number
}

export function MonthlyBudgetCard({ monthlySpent }: MonthlyBudgetCardProps) {
  const { budget, loading, saving, saveBudget } = useMonthlyBudget()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (budget) {
      setAmount(budget.amount.toString())
      setDescription(budget.description ?? "")
    }
  }, [budget])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedAmount = Number(amount)

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Budget amount must be greater than zero")
      return
    }

    try {
      await saveBudget(parsedAmount, description)
      toast.success("Budget saved")
      setIsEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save budget")
    }
  }

  if (loading) {
    return <Skeleton className="h-44 w-full" />
  }

  const hasBudget = !!budget && !isEditing
  const displaySpent = monthlySpent
  const displayBudget = budget?.amount ?? 0
  const spentExceeds = displayBudget > 0 && displaySpent > displayBudget

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Monthly budget</p>
          <h3 className="text-xl font-semibold">
            {hasBudget ? `R$ ${displayBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Set a budget"}
          </h3>
        </div>
        {hasBudget && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit budget
          </Button>
        )}
      </div>

      {hasBudget ? (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${spentExceeds ? "text-red-600" : "text-green-600"}`}>
            R$ {displaySpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R${" "}
            {displayBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          {budget?.description && (
            <p className="text-sm text-muted-foreground">Goal: {budget.description}</p>
          )}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Budget amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={saving}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-description">Description (optional)</Label>
            <Input
              id="budget-description"
              placeholder="e.g. Food & leisure"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save budget"}
          </Button>
        </form>
      )}

      {isEditing && (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="budget-amount-edit">Budget amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="budget-amount-edit"
                type="number"
                min="0"
                step="0.01"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-description-edit">Description (optional)</Label>
            <Input
              id="budget-description-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Update budget"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
