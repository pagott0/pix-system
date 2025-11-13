import { type NextRequest, NextResponse } from "next/server"
import { dbPixKeys } from "@/lib/db"
import type { ApiResponse, PixKey } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "userId is required" }, { status: 400 })
    }

    const pixKeys = await dbPixKeys.getAll(userId)
    return NextResponse.json<ApiResponse<PixKey[]>>({ success: true, data: pixKeys })
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
    const { userId, keyType, keyValue } = body

    if (!userId || !keyType || !keyValue) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "userId, keyType, and keyValue are required" },
        { status: 400 },
      )
    }

    const pixKey = await dbPixKeys.create(userId, keyType, keyValue)
    return NextResponse.json<ApiResponse<PixKey>>({ success: true, data: pixKey }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
