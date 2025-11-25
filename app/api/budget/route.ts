import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { dbBudgets } from "@/lib/db"
import type { ApiResponse, MonthlyBudget } from "@/lib/types"

function getMonthStart(dateInput?: string | null) {
  const now = dateInput ? new Date(dateInput) : new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)
  return monthStart.toISOString().split("T")[0]
}

async function getAuthenticatedUser(request: NextRequest) {
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

  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const monthParam = request.nextUrl.searchParams.get("month")
    const monthYear = getMonthStart(monthParam)

    const budget = await dbBudgets.getForMonth(user.id, monthYear)

    return NextResponse.json<ApiResponse<MonthlyBudget | null>>({
      success: true,
      data: budget,
    })
  } catch (error) {
    console.error("[API] Failed to fetch budget:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json<ApiResponse<null>>({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, month } = body

    const parsedAmount = Number(amount)

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Amount must be a number greater than zero" },
        { status: 400 },
      )
    }

    const monthYear = getMonthStart(month)

    const budget = await dbBudgets.upsert(user.id, monthYear, parsedAmount, description)

    return NextResponse.json<ApiResponse<MonthlyBudget>>({ success: true, data: budget }, { status: 201 })
  } catch (error) {
    console.error("[API] Failed to save budget:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

