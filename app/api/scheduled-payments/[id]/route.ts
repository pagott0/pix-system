import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbScheduledPayments, dbPixKeys, dbAccounts, dbTransactions } from "@/lib/db"
import type { ApiResponse, ScheduledPayment } from "@/lib/types"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const scheduledPayment = await dbScheduledPayments.getById(id)

    if (!scheduledPayment) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Scheduled payment not found" }, { status: 404 })
    }

    if (scheduledPayment.sender_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await dbScheduledPayments.delete(id)

    return NextResponse.json<ApiResponse<null>>({ success: true, message: "Scheduled payment cancelled" })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const scheduledPayment = await dbScheduledPayments.getById(id)

    if (!scheduledPayment) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Scheduled payment not found" }, { status: 404 })
    }

    if (scheduledPayment.sender_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Forbidden" }, { status: 403 })
    }

    if (scheduledPayment.status !== "pending") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Scheduled payment is not pending" },
        { status: 400 },
      )
    }

    const senderId = user.id
    const receiverId = scheduledPayment.receiver_id

    // Get sender account
    const senderAccount = await dbAccounts.getByUserId(senderId)
    if (!senderAccount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Sender account not found" },
        { status: 404 },
      )
    }

    // Check balance
    if (senderAccount.balance < scheduledPayment.amount) {
      await dbScheduledPayments.update(id, { status: "failed" })
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Insufficient balance" }, { status: 400 })
    }

    // Get receiver account (need admin client to bypass RLS)
    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Service unavailable. SUPABASE_SERVICE_ROLE_KEY not configured" },
        { status: 500 },
      )
    }

    const { data: receiverAccount, error: receiverAccountError } = await adminClient
      .from("accounts")
      .select("*")
      .eq("user_id", receiverId)
      .maybeSingle()

    if (receiverAccountError) {
      console.error("Error fetching receiver account:", receiverAccountError)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error fetching receiver account" },
        { status: 500 },
      )
    }

    if (!receiverAccount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Receiver account not found" },
        { status: 404 },
      )
    }

    // Create transaction
    const transaction = await dbTransactions.create(
      senderId,
      receiverId,
      scheduledPayment.amount,
      scheduledPayment.receiver_pix_key,
      scheduledPayment.description,
      scheduledPayment.category,
    )

    // Update sender balance
    await dbAccounts.updateBalance(senderId, senderAccount.balance - scheduledPayment.amount)

    // Update receiver balance (need admin client to bypass RLS)
    const { data: updatedReceiverAccount, error: updateError } = await adminClient
      .from("accounts")
      .update({
        balance: receiverAccount.balance + scheduledPayment.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", receiverId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating receiver balance:", updateError)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Transaction created but failed to update receiver balance" },
        { status: 500 },
      )
    }

    // Update scheduled payment status to completed
    await dbScheduledPayments.update(id, { status: "completed" })

    return NextResponse.json<ApiResponse<ScheduledPayment>>({
      success: true,
      data: { ...scheduledPayment, status: "completed" },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
