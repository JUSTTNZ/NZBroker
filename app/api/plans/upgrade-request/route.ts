import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const {
      userId,
      userEmail,
      userName,
      currentPlan,
      requestedPlan,
      planName,
      planPrice,
    } = await request.json()

    if (!userId || !requestedPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("📝 Processing upgrade request:", {
      userId,
      currentPlan,
      requestedPlan,
    })

    // 1. Check if user already has a pending request
    const { data: existingRequests, error: checkError } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (checkError) {
      console.error("❌ Check error:", checkError)
    }

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: "You already have a pending upgrade request" },
        { status: 400 }
      )
    }

    // 2. Create upgrade request record
    const { error: insertError } = await supabase.from("user_plans").insert([
      {
        user_id: userId,
        plan: requestedPlan,
        amount_paid: 0,
        payment_method: "upgrade_request",
        status: "pending",
        starts_at: null, // Will be set when admin approves
        ends_at: null,
      },
    ])

    if (insertError) {
      console.error("❌ Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // 3. TODO: Send notification to admin (you can add this later)
    // Could be email, Discord webhook, Slack, etc.
    console.log("🔔 Admin notification needed for user:", userEmail)

    // 4. Optionally, update user's profile to show requested plan
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        current_plan: requestedPlan,
        plan_expires_at: null, // Clear expiry since this is pending
      })
      .eq("id", userId)

    if (updateError) {
      console.error("⚠️ Profile update error (non-critical):", updateError)
    }

    console.log("✅ Upgrade request created for:", userEmail)

    return NextResponse.json(
      {
        success: true,
        message: "Upgrade request submitted successfully",
        requestedPlan,
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("💥 Upgrade request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}