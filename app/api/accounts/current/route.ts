import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let { data: account, error } = await supabase.from("accounts").select("*").eq("user_id", user.id).single()

    if (error && error.code === "PGRST116") {
      // Account doesn't exist, create one
      const { data: newAccount } = await supabase
        .from("accounts")
        .insert([
          {
            user_id: user.id,
            balance: 5000,
            income: 0,
            expense: 0,
          },
        ])
        .select()
        .single()

      account = newAccount
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("[v0] Error fetching account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
