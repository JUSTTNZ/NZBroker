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

    const { from, to, amount } = await request.json()

    // Validate inputs
    if (!from || !to || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid transfer parameters" }, { status: 400 })
    }

    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // Check sufficient balance
    if (wallet[`${from}_balance`] < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Perform atomic transfer
    const updates: Record<string, number> = {}
    updates[`${from}_balance`] = wallet[`${from}_balance`] - amount
    updates[`${to}_balance`] = wallet[`${to}_balance`] + amount

    const { error: updateError } = await supabase.from("wallets").update(updates).eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Transfer failed" }, { status: 500 })
    }

    // Record transaction
    const { error: txError } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type: "transfer",
        from_account: from,
        to_account: to,
        amount,
        status: "completed",
      },
    ])

    // Create notification
    if (!txError) {
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: "transfer",
          title: `Transfer Completed`,
          message: `Transferred $${amount.toFixed(2)} from ${from} to ${to}`,
          read: false,
        },
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Transfer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
