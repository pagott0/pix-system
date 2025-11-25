import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbPaymentRequests, dbPixKeys } from "@/lib/db"
import type { ApiResponse, PaymentRequest } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const paymentRequests = await dbPaymentRequests.getAll(user.id)

    return NextResponse.json<ApiResponse<PaymentRequest[]>>({ success: true, data: paymentRequests })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, amount, description } = body

    if (!receiverId || !amount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "receiverId and amount are required" },
        { status: 400 },
      )
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Invalid amount" }, { status: 400 })
    }

    // Validate that requester (current user) has at least one pix key
    const requesterPixKeys = await dbPixKeys.getAll(user.id)
    if (requesterPixKeys.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "You need to have at least one Pix key to request money" },
        { status: 400 },
      )
    }

    // Create payment request
    const paymentRequest = await dbPaymentRequests.create(user.id, receiverId, amountNum, description)

    return NextResponse.json<ApiResponse<PaymentRequest>>({ success: true, data: paymentRequest }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
