// Client-side API helper functions

import type { ApiResponse, User, PixKey, Transaction } from "./types"

const API_BASE = "/api"

export const apiClient = {
  // Users
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`)
    const data: ApiResponse<User> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`)
    const data: ApiResponse<User[]> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  // Pix Keys
  async getPixKeys(userId: string): Promise<PixKey[]> {
    const response = await fetch(`${API_BASE}/pix-keys?userId=${userId}`)
    const data: ApiResponse<PixKey[]> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  async createPixKey(userId: string, keyType: string, keyValue: string): Promise<PixKey> {
    const response = await fetch(`${API_BASE}/pix-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, keyType, keyValue }),
    })
    const data: ApiResponse<PixKey> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  async deletePixKey(id: string): Promise<PixKey> {
    const response = await fetch(`${API_BASE}/pix-keys/${id}`, { method: "DELETE" })
    const data: ApiResponse<PixKey> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE}/transactions?userId=${userId}`)
    const data: ApiResponse<Transaction[]> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },

  async createTransaction(
    senderId: string,
    receiverPixKey: string,
    amount: number,
    description?: string,
  ): Promise<Transaction> {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId,
        receiverPixKey,
        amount,
        description,
      }),
    })
    const data: ApiResponse<Transaction> = await response.json()
    if (!data.success) throw new Error(data.error)
    return data.data!
  },
}
