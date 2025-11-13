import { type NextRequest, NextResponse } from "next/server"
import { dbUsers } from "@/lib/db"
import type { ApiResponse, User } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await dbUsers.getById(id)

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<User>>({ success: true, data: user })
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
    const user = await dbUsers.update(id, body)

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<User>>({ success: true, data: user })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
