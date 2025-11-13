import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Error creating user" }, { status: 400 })
    }

    try {
      const adminClient = createAdminClient()
      if (adminClient) {
        const { error: confirmError } = await adminClient.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        })

        if (confirmError) {
          console.error("[auth] Error confirming user:", confirmError)
        }
      } else {
        console.warn(
          "[auth] SUPABASE_SERVICE_ROLE_KEY not set. Email confirmation disabled in Supabase dashboard is required.",
        )
      }
    } catch (adminError) {
      console.error("[auth] Error confirming user:", adminError)
    }

    return NextResponse.json({ user: data.user, message: "Account created successfully" })
  } catch (error) {
    console.error("[auth] Error registering user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

