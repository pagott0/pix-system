// Type definitions for Pix+ application

export type PixKeyType = "phone" | "email" | "cpf" | "random"

export interface PixKey {
  id: string
  user_id: string
  key_type: PixKeyType
  key_value: string
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  balance: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  description?: string
  status: "pending" | "completed" | "failed"
  pix_key_used: string
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  balance: number
  institution_name: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
