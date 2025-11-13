import { type NextRequest, NextResponse } from "next/server"
import { dbUsers } from "@/lib/db"
import type { ApiResponse, User } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("id")

    if (userId) {
      const user = await dbUsers.getById(userId)
      if (!user) {
        return NextResponse.json<ApiResponse<null>>({ success: false, error: "User not found" }, { status: 404 })
      }
      return NextResponse.json<ApiResponse<User>>({ success: true, data: user })
    }

    const users = await dbUsers.getAll()
    return NextResponse.json<ApiResponse<User[]>>({ success: true, data: users })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
