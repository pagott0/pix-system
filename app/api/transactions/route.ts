import { type NextRequest, NextResponse } from "next/server"
import { dbTransactions, dbPixKeys, dbAccounts } from "@/lib/db"
import type { ApiResponse, Transaction } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "userId is required" }, { status: 400 })
    }

    const transactions = await dbTransactions.getAll(userId)
    return NextResponse.json<ApiResponse<Transaction[]>>({ success: true, data: transactions })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverPixKey, amount, description } = body

    if (!senderId || !receiverPixKey || !amount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "senderId, receiverPixKey, and amount are required" },
        { status: 400 },
      )
    }

    // Find receiver by Pix key
    const pixKey = await dbPixKeys.getByValue(receiverPixKey)
    if (!pixKey) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Receiver Pix key not found" },
        { status: 404 },
      )
    }

    const receiverId = pixKey.user_id

    // Get sender and receiver accounts
    const senderAccount = await dbAccounts.getByUserId(senderId)
    const receiverAccount = await dbAccounts.getByUserId(receiverId)

    if (!senderAccount || !receiverAccount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Sender or receiver account not found" },
        { status: 404 },
      )
    }

    // Check balance
    if (senderAccount.balance < amount) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Insufficient balance" }, { status: 400 })
    }

    // Create transaction
    const transaction = await dbTransactions.create(senderId, receiverId, amount, receiverPixKey, description)

    // Update balances
    await dbAccounts.updateBalance(senderId, senderAccount.balance - amount)
    await dbAccounts.updateBalance(receiverId, receiverAccount.balance + amount)

    return NextResponse.json<ApiResponse<Transaction>>({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
