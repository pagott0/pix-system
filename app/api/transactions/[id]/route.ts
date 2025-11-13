import { type NextRequest, NextResponse } from "next/server"
import { dbTransactions } from "@/lib/db"
import type { ApiResponse, Transaction } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transaction = await dbTransactions.getById(id)

    if (!transaction) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<Transaction>>({ success: true, data: transaction })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const transaction = await dbTransactions.update(id, body)

    if (!transaction) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<Transaction>>({ success: true, data: transaction })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
