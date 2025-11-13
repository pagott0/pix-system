import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbTransactions, dbPixKeys, dbAccounts } from "@/lib/db"
import type { ApiResponse, Transaction } from "@/lib/types"

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

    const category = request.nextUrl.searchParams.get("category")
    const limitParam = request.nextUrl.searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    let transactions = await dbTransactions.getAll(user.id, category || undefined)
    
    // Get admin client to fetch receiver names
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminClient = createAdminClient()
    
    if (adminClient) {
      // Enrich transactions with receiver names
      const enrichedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          // Get the other user's ID (receiver if user is sender, sender if user is receiver)
          const otherUserId = transaction.sender_id === user.id ? transaction.receiver_id : transaction.sender_id
          
          // Fetch other user's name from auth.users
          let receiverName = "Unknown User"
          try {
            const { data: otherUser, error: userError } = await adminClient.auth.admin.getUserById(otherUserId)
            if (!userError && otherUser?.user) {
              receiverName = otherUser.user.email || otherUser.user.id
            }
          } catch (err) {
            console.error(`Error fetching user name for ${otherUserId}:`, err)
          }
          
          return {
            ...transaction,
            receiver_name: receiverName,
          }
        })
      )
      
      transactions = enrichedTransactions
    } else {
      // Fallback: set receiver name to unknown
      transactions = transactions.map((transaction) => ({
        ...transaction,
        receiver_name: "Unknown User",
      }))
    }
    
    if (limit) {
      transactions = transactions.slice(0, limit)
    }

    return NextResponse.json<ApiResponse<Transaction[]>>({ success: true, data: transactions })
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
    const { receiverPixKey, amount, description, category } = body

    if (!receiverPixKey || !amount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "receiverPixKey and amount are required" },
        { status: 400 },
      )
    }

    const senderId = user.id

    // Find receiver by Pix key (trim whitespace and normalize)
    const normalizedPixKey = receiverPixKey.trim()
    const pixKey = await dbPixKeys.getByValue(normalizedPixKey)
    if (!pixKey) {
      console.error(`Pix key not found: ${normalizedPixKey}`)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Receiver Pix key "${normalizedPixKey}" not found` },
        { status: 404 },
      )
    }
    const receiverId = pixKey.user_id

    // Get sender account (can use regular client since it's the current user)
    const senderAccount = await dbAccounts.getByUserId(senderId)
    if (!senderAccount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Sender account not found" },
        { status: 404 },
      )
    }

    // Get receiver account (need admin client to bypass RLS)
    const { createAdminClient } = await import("@/lib/supabase/admin")
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

    // Check balance
    if (senderAccount.balance < amount) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Insufficient balance" }, { status: 400 })
    }

    // Create transaction
    const transaction = await dbTransactions.create(senderId, receiverId, amount, receiverPixKey, description, category)

    // Update sender balance (can use regular client)
    await dbAccounts.updateBalance(senderId, senderAccount.balance - amount)

    // Update receiver balance (need admin client to bypass RLS)
    const { data: updatedReceiverAccount, error: updateError } = await adminClient
      .from("accounts")
      .update({ 
        balance: receiverAccount.balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", receiverId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating receiver balance:", updateError)
      // Note: Transaction was already created, but balance update failed
      // In a production system, you might want to rollback the transaction
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Transaction created but failed to update receiver balance" },
        { status: 500 },
      )
    }

    return NextResponse.json<ApiResponse<Transaction>>({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 },
    )
  }
}
