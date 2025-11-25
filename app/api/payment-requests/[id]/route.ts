import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbPaymentRequests, dbPixKeys, dbAccounts, dbTransactions } from "@/lib/db"
import type { ApiResponse, PaymentRequest } from "@/lib/types"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await request.json()
    const { action } = body // "accept" or "reject"

    const paymentRequest = await dbPaymentRequests.getById(id)

    if (!paymentRequest) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Payment request not found" }, { status: 404 })
    }

    if (paymentRequest.receiver_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Forbidden" }, { status: 403 })
    }

    if (paymentRequest.status !== "pending") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Payment request is not pending" },
        { status: 400 },
      )
    }

    if (action === "reject") {
      const updated = await dbPaymentRequests.update(id, { status: "rejected" })
      return NextResponse.json<ApiResponse<PaymentRequest>>({ success: true, data: updated })
    }

    if (action === "accept") {
      // Get receiver (current user) account - they are the one sending money
      const receiverAccount = await dbAccounts.getByUserId(user.id)
      if (!receiverAccount) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Receiver account not found" },
          { status: 404 },
        )
      }

      // Check balance
      if (receiverAccount.balance < paymentRequest.amount) {
        return NextResponse.json<ApiResponse<null>>({ success: false, error: "Insufficient balance" }, { status: 400 })
      }

      // Get requester account and pix key (need admin client to bypass RLS)
      const adminClient = createAdminClient()
      if (!adminClient) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Service unavailable. SUPABASE_SERVICE_ROLE_KEY not configured" },
          { status: 500 },
        )
      }

      // Get requester's pix key - they are receiving the money
      const { data: requesterPixKeys, error: pixKeyError } = await adminClient
        .from("pix_keys")
        .select("*")
        .eq("user_id", paymentRequest.requester_id)

      if (pixKeyError) {
        console.error("Error fetching requester pix keys:", pixKeyError)
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Error fetching requester pix keys" },
          { status: 500 },
        )
      }

      if (!requesterPixKeys || requesterPixKeys.length === 0) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Requester has no Pix keys" }, 
          { status: 400 },
        )
      }
      const requesterPixKey = requesterPixKeys[0].key_value

      const { data: requesterAccount, error: requesterAccountError } = await adminClient
        .from("accounts")
        .select("*")
        .eq("user_id", paymentRequest.requester_id)
        .maybeSingle()

      if (requesterAccountError) {
        console.error("Error fetching requester account:", requesterAccountError)
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Error fetching requester account" },
          { status: 500 },
        )
      }

      if (!requesterAccount) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Requester account not found" },
          { status: 404 },
        )
      }

      const transaction = await dbTransactions.create(
        user.id, // sender (the one who accepted the request)
        paymentRequest.requester_id, // receiver (the one who requested)
        paymentRequest.amount,
        requesterPixKey,
        paymentRequest.description,
      )

      // Update receiver balance (current user sends money)
      await dbAccounts.updateBalance(user.id, receiverAccount.balance - paymentRequest.amount)

      // Update requester balance (they receive money)
      const { data: updatedRequesterAccount, error: updateError } = await adminClient
        .from("accounts")
        .update({
          balance: requesterAccount.balance + paymentRequest.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", paymentRequest.requester_id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating requester balance:", updateError)
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Transaction created but failed to update requester balance" },
          { status: 500 },
        )
      }

      // Update payment request status to accepted
      const updated = await dbPaymentRequests.update(id, { status: "accepted" })

      return NextResponse.json<ApiResponse<PaymentRequest>>({ success: true, data: updated })
    }

    return NextResponse.json<ApiResponse<null>>({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}

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
    const paymentRequest = await dbPaymentRequests.getById(id)

    if (!paymentRequest) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Payment request not found" }, { status: 404 })
    }

    if (paymentRequest.requester_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await dbPaymentRequests.delete(id)

    return NextResponse.json<ApiResponse<null>>({ success: true, message: "Payment request cancelled" })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
