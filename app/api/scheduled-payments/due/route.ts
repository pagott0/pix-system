import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { dbScheduledPayments } from "@/lib/db"
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

    const duePayments = await dbScheduledPayments.getDuePayments(user.id)

    return NextResponse.json<ApiResponse<ScheduledPayment[]>>({ success: true, data: duePayments })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
