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
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId).maybeSingle()

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
    const { data, error } = await supabase.from("pix_keys").select("*").eq("id", id).maybeSingle()

    if (error) return null
    return data as PixKey | null
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
        .maybeSingle()

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
    // Use admin client to bypass RLS since we need to search for any user's pix key
    // This is needed when a sender wants to find a receiver's pix key
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()
    
    // If admin client is not available, fall back to regular client (will only find own keys)
    const supabase = adminClient || await createClient()
    
    // Trim whitespace from the value
    const trimmedValue = value.trim()
    
    // Search for exact match (case-sensitive for phone/CPF, but emails should be case-insensitive)
    // For emails, we'll try both exact and case-insensitive
    let { data, error } = await supabase
      .from("pix_keys")
      .select("*")
      .eq("key_value", trimmedValue)
      .maybeSingle()

    // If not found and it looks like an email, try case-insensitive search
    if (!data && !error && trimmedValue.includes("@")) {
      const { data: emailData, error: emailError } = await supabase
        .from("pix_keys")
        .select("*")
        .ilike("key_value", trimmedValue)
        .maybeSingle()
      
      if (emailData) {
        data = emailData
      }
      if (emailError) {
        error = emailError
      }
    }

    if (error) {
      console.error("Error fetching pix key by value:", error)
      return null
    }
    
    if (!data) {
      console.log(`Pix key not found for value: "${trimmedValue}"`)
    }
    
    return data as PixKey | null
  },
}

// Transaction operations
export const dbTransactions = {
  async getAll(userId: string, category?: string) {
    const supabase = await createClient()
    let query = supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
    return data as Transaction[]
  },

  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle()

    if (error) return null
    return data as Transaction | null
  },

  async create(senderId: string, receiverId: string, amount: number, pixKeyUsed: string, description?: string, category?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
        pix_key_used: pixKeyUsed,
        description: description || null,
        category: category || null,
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
