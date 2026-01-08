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

    const { amount, bankDetails } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 })
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Check sufficient balance in total available only
    if (wallet.total_available_balance < amount) {
      return NextResponse.json({ error: "Insufficient balance in Total Available" }, { status: 400 })
    }

    // Deduct from total available balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({
        total_available_balance: wallet.total_available_balance - amount,
      })
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 })
    }

    // Create withdrawal transaction
    const { error: txError } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type: "withdrawal",
        amount,
        status: "pending",
        bank_details: bankDetails,
      },
    ])

    if (!txError) {
      // Create notification
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: "withdrawal",
          title: `Withdrawal Initiated`,
          message: `Withdrawal of $${amount.toFixed(2)} is being processed`,
          read: false,
        },
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Withdrawal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
