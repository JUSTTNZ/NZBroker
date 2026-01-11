// app/api/upgrade/route.ts
import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. Get the authenticated user from the session
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // if (authError || !user) {
    //   console.error("❌ Auth error:", authError)
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
    
    // console.log("👤 Authenticated user:", user.id, user.email)
    
    // 2. Get request body
    const {
      requestedPlan,
      planName,
      planPrice,
    } = await request.json()

    if (!requestedPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("📝 Processing upgrade request:", {
      userId: user.id,
      requestedPlan,
    })

    // 3. Check if user exists in profiles
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      console.error("❌ Profile error:", profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // 4. Check if already on requested plan
    if (userProfile.current_plan === requestedPlan) {
      return NextResponse.json(
        { error: "You are already on this plan" },
        { status: 400 }
      )
    }

    // 5. Check for existing pending request
    const { data: existingRequests } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: "You already have a pending upgrade request" },
        { status: 400 }
      )
    }

    // 6. Create upgrade request record
    const { error: insertError } = await supabase.from("user_plans").insert([
      {
        user_id: user.id,
        plan: requestedPlan,
        amount_paid: 0,
        payment_method: "upgrade_request",
        status: "pending",
        starts_at: null,
        ends_at: null,
        metadata: {
          requested_at: new Date().toISOString(),
          current_plan: userProfile.current_plan,
          plan_name: planName,
          plan_price: planPrice,
          user_email: user.email,
          user_name: userProfile.full_name || user.email
        }
      },
    ])

    if (insertError) {
      console.error("❌ Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // 7. Update user's profile to show requested plan (temporarily)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        current_plan: requestedPlan,
        plan_expires_at: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("⚠️ Profile update error:", updateError)
    }

    // 8. Create notification for user
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Upgrade Request Submitted",
      message: `Your request to upgrade to ${planName} plan has been received. Our admin team will review it shortly.`,
      type: "plan_upgrade",
      is_read: false,
      created_at: new Date().toISOString()
    })

    console.log("✅ Upgrade request created for:", user.email)

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
      { error: "Internal server error: " + error.message },
      { status: 500 }
    )
  }
}