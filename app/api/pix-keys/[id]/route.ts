import { type NextRequest, NextResponse } from "next/server"
import { dbPixKeys } from "@/lib/db"
import type { ApiResponse, PixKey } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pixKey = await dbPixKeys.getById(id)

    if (!pixKey) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Pix key not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<PixKey>>({ success: true, data: pixKey })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const pixKey = await dbPixKeys.delete(id)

    if (!pixKey) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Pix key not found" }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<PixKey>>({ success: true, data: pixKey })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
