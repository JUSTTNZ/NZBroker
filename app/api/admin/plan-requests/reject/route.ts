// app/api/admin/plan-requests/reject/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { requestId, reason } = await request.json()

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

    // Update the plan request to rejected
    const { error: updateError } = await supabase
      .from("user_plans")
      .update({
        status: "rejected",
        payment_method: reason ? `Rejected: ${reason}` : "Rejected by admin"
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error rejecting plan:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: planRequest.user_id,
      title: "Plan Upgrade Declined",
      message: `Your upgrade to ${planRequest.plan} plan was declined. ${reason ? `Reason: ${reason}` : "Please contact support for more information."}`,
      type: "plan_upgrade",
      is_read: false
    })

    return NextResponse.json({
      success: true,
      message: "Plan request rejected"
    })

  } catch (error: any) {
    console.error("Reject plan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}