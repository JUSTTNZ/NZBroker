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

    const { userId, plan } = await request.json()

    if (!userId || !["basic", "pro", "elite"].includes(plan)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Update plan
    const { error: updateError } = await supabase.from("profiles").update({ plan }).eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: "Plan update failed" }, { status: 500 })
    }

    // Record transaction
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        type: "plan_upgrade",
        amount: 0,
        status: "completed",
        admin_id: user.id,
      },
    ])

    // Create notification
    await supabase.from("notifications").insert([
      {
        user_id: userId,
        type: "plan_update",
        title: `Plan Updated`,
        message: `Your plan has been upgraded to ${plan}`,
        read: false,
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Plan update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
