import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbScheduledPayments, dbPixKeys, dbAccounts, dbTransactions } from "@/lib/db"
import type { ApiResponse, ScheduledPayment } from "@/lib/types"

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

    const scheduledPayments = await dbScheduledPayments.getAll(user.id)

    return NextResponse.json<ApiResponse<ScheduledPayment[]>>({ success: true, data: scheduledPayments })
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
    const { receiverPixKey, amount, scheduledDate, description, category } = body

    if (!receiverPixKey || !amount || !scheduledDate) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "receiverPixKey, amount, and scheduledDate are required" },
        { status: 400 },
      )
    }

    // Validate scheduled date is in the future
    const scheduledDateObj = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (scheduledDateObj < today) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Scheduled date must be today or in the future" },
        { status: 400 },
      )
    }

    // Find receiver by Pix key
    const normalizedPixKey = receiverPixKey.trim()
    const pixKey = await dbPixKeys.getByValue(normalizedPixKey)
    if (!pixKey) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Receiver Pix key "${normalizedPixKey}" not found` },
        { status: 404 },
      )
    }
    const receiverId = pixKey.user_id

    // Create scheduled payment
    const scheduledPayment = await dbScheduledPayments.create(
      user.id,
      receiverId,
      normalizedPixKey,
      amount,
      scheduledDate,
      description,
      category,
    )

    return NextResponse.json<ApiResponse<ScheduledPayment>>({ success: true, data: scheduledPayment }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}

