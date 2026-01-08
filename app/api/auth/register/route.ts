import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email,
        full_name: fullName,
        role: "user",
        plan: "basic",
      },
    ])

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Create wallet record
    const { error: walletError } = await supabase.from("wallets").insert([
      {
        user_id: data.user.id,
        total_available_balance: 0,
        trading_balance: 0,
        bot_trading_balance: 0,
      },
    ])

    if (walletError) {
      return NextResponse.json({ error: walletError.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
