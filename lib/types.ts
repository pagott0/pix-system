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
  category?: string
  status: "pending" | "completed" | "failed"
  pix_key_used: string
  created_at: string
  receiver_name?: string
}

export interface Account {
  id: string
  user_id: string
  balance: number
  institution_name: string
  created_at: string
  updated_at: string
}

export interface ScheduledPayment {
  id: string
  sender_id: string
  receiver_pix_key: string
  receiver_id: string
  amount: number
  description?: string
  category?: string
  scheduled_date: string
  status: "pending" | "completed" | "cancelled" | "failed"
  created_at: string
  updated_at: string
}

export interface PaymentRequest {
  id: string
  requester_id: string
  receiver_id: string
  amount: number
  description?: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  created_at: string
  updated_at: string
  requester_name?: string
  receiver_name?: string
}

export interface MonthlyBudget {
  id: string
  user_id: string
  month_year: string
  amount: number
  description?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
