// app/api/admin/plan-requests/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin (add your admin check logic)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all plan requests with user profiles
    const { data: requests, error } = await supabase
      .from("user_plans")
      .select(`
        *,
        user_profile:profiles!user_plans_user_id_fkey (
          id,
          email,
          full_name,
          current_plan,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching plan requests:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error: any) {
    console.error("Plan requests error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}