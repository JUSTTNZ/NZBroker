import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: wallet, error } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

    if (error) {
      return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("[v0] Wallet fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
