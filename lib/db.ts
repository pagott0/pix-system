import { createClient } from "@/lib/supabase/server"
import type { PixKey, Transaction } from "./types"

// User operations
export const dbUsers = {
  async getAll() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) throw new Error(`Failed to fetch users: ${error.message}`)
    return data.users
  },

  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.admin.getUserById(id)

    if (error) return null
    return data.user
  },

  async update(id: string, updates: Record<string, any>) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.admin.updateUserById(id, updates)

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data.user
  },
}

// Account operations
export const dbAccounts = {
  async getByUserId(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("[v0] Error fetching account:", error)
      return null
    }
    return data
  },

  async updateBalance(userId: string, newBalance: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("accounts")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update balance: ${error.message}`)
    return data
  },
}

// Pix Key operations
export const dbPixKeys = {
  async getAll(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("pix_keys").select("*").eq("user_id", userId)

    if (error) throw new Error(`Failed to fetch pix keys: ${error.message}`)
    return data as PixKey[]
  },

  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("pix_keys").select("*").eq("id", id).single()

    if (error) return null
    return data as PixKey
  },

  async create(userId: string, keyType: string, keyValue: string) {
    const supabase = await createClient()

    // Check if single-use key type already exists
    if (["phone", "email", "cpf"].includes(keyType)) {
      const { data: existing } = await supabase
        .from("pix_keys")
        .select("id")
        .eq("user_id", userId)
        .eq("key_type", keyType)
        .single()

      if (existing) {
        throw new Error(`A ${keyType} Pix key already exists for this user`)
      }
    }

    const { data, error } = await supabase
      .from("pix_keys")
      .insert({
        user_id: userId,
        key_type: keyType,
        key_value: keyValue,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create pix key: ${error.message}`)
    return data as PixKey
  },

  async delete(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("pix_keys").delete().eq("id", id).select().single()

    if (error) throw new Error(`Failed to delete pix key: ${error.message}`)
    return data as PixKey
  },

  async getByValue(value: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("pix_keys").select("*").eq("key_value", value).single()

    if (error) return null
    return data as PixKey
  },
}

// Transaction operations
export const dbTransactions = {
  async getAll(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
    return data as Transaction[]
  },

  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single()

    if (error) return null
    return data as Transaction
  },

  async create(senderId: string, receiverId: string, amount: number, pixKeyUsed: string, description?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
        pix_key_used: pixKeyUsed,
        description: description || null,
        status: "completed",
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create transaction: ${error.message}`)
    return data as Transaction
  },

  async update(id: string, updates: Partial<Transaction>) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update transaction: ${error.message}`)
    return data as Transaction
  },
}
