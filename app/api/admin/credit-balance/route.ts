import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { userId, amount } = await request.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Get target user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 })
    }

    // Credit total available balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({
        total_available_balance: wallet.total_available_balance + amount,
      })
      .eq("user_id", userId)

    if (updateError) {
      return NextResponse.json({ error: "Credit failed" }, { status: 500 })
    }

    // Record transaction
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        type: "admin_credit",
        amount,
        status: "completed",
        admin_id: user.id,
      },
    ])

    // Create notification for user
    await supabase.from("notifications").insert([
      {
        user_id: userId,
        type: "credit",
        title: `Account Credited`,
        message: `Your account has been credited with $${amount.toFixed(2)}`,
        read: false,
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Credit balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
