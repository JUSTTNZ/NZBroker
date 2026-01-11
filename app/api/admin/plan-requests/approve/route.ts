// app/api/admin/plan-requests/approve/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 })
    }

    // Get the request
    const { data: planRequest, error: fetchError } = await supabase
      .from("user_plans")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !planRequest) {
      return NextResponse.json({ error: "Plan request not found" }, { status: 404 })
    }

    if (planRequest.status !== "pending") {
      return NextResponse.json({ error: "Request is not pending" }, { status: 400 })
    }

    // Calculate end date based on plan
    const startsAt = new Date().toISOString()
    let endsAt = null
    
    if (planRequest.plan === "pro") {
      endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (planRequest.plan === "elite") {
      endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Update the plan request to approved
    const { error: updateError } = await supabase
      .from("user_plans")
      .update({
        status: "active",
        starts_at: startsAt,
        ends_at: endsAt
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating plan:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Update user's profile with new plan
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        current_plan: planRequest.plan,
        plan_expires_at: endsAt
      })
      .eq("id", planRequest.user_id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      // Continue anyway - main plan update succeeded
    }

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: planRequest.user_id,
      title: "Plan Upgrade Approved!",
      message: `Your upgrade to ${planRequest.plan} plan has been approved. Your new features are now active!`,
      type: "plan_upgrade",
      is_read: false
    })

    // Invalidate any other pending requests for this user
    await supabase
      .from("user_plans")
      .update({ status: "cancelled" })
      .eq("user_id", planRequest.user_id)
      .eq("status", "pending")
      .neq("id", requestId)

    return NextResponse.json({
      success: true,
      message: "Plan approved successfully"
    })

  } catch (error: any) {
    console.error("Approve plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}