import { type NextRequest, NextResponse } from "next/server"
import { dbPixKeys } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pixKey } = body

    if (!pixKey) {
      return NextResponse.json<ApiResponse<{ valid: boolean }>>(
        { success: false, error: "pixKey is required" },
        { status: 400 },
      )
    }

    // Check if pix key exists
    const foundPixKey = await dbPixKeys.getByValue(pixKey)

    return NextResponse.json<ApiResponse<{ valid: boolean }>>({
      success: true,
      data: { valid: foundPixKey !== null },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

