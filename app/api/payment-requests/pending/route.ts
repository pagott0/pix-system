import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbPaymentRequests } from "@/lib/db"
import type { ApiResponse, PaymentRequest } from "@/lib/types"
import { createAdminClient } from "@/lib/supabase/admin"

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

    let pendingRequests = await dbPaymentRequests.getPendingForUser(user.id)

    // Enrich with requester names
    const adminClient = createAdminClient()
    if (adminClient) {
      const enrichedRequests = await Promise.all(
        pendingRequests.map(async (request) => {
          let requesterName = "Unknown User"
          try {
            const { data: requesterUser, error: userError } = await adminClient.auth.admin.getUserById(
              request.requester_id,
            )
            if (!userError && requesterUser?.user) {
              requesterName = requesterUser.user.email || requesterUser.user.id
            }
          } catch (err) {
            console.error(`Error fetching requester name for ${request.requester_id}:`, err)
          }

          return {
            ...request,
            requester_name: requesterName,
          }
        }),
      )

      pendingRequests = enrichedRequests
    } else {
      pendingRequests = pendingRequests.map((request) => ({
        ...request,
        requester_name: "Unknown User",
      }))
    }

    return NextResponse.json<ApiResponse<PaymentRequest[]>>({ success: true, data: pendingRequests })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
