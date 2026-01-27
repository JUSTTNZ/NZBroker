import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("🔵 [SIGNUP] Starting signup for:", email)

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("❌ [SIGNUP] Auth error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      console.error("❌ [SIGNUP] No user object returned")
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    console.log("✅ [SIGNUP] Auth user created:", data.user.id)

    // TEST: Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single()

    if (!checkError && existingProfile) {
      console.log("⚠️ [SIGNUP] Profile already exists for user:", data.user.id)
    } else {
      console.log("🔄 [SIGNUP] Creating profile...")
    }

    // Create profile record with new schema (including password for admin viewing)
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email,
        password, // Store password for admin access
        full_name: fullName,
        role: "user",
        current_plan: "basic",
        account_type: "demo",
        demo_balance: 10000.00,
        live_balance: 0.00,
      },
    ])

    if (profileError) {
      console.error("❌ [SIGNUP] Profile creation FAILED:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // Try alternative: Use service role key
      console.log("🔄 [SIGNUP] Trying alternative approach...")
      
      // Alternative: Use a different approach
      const { error: altProfileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email,
          password, // Store password for admin access
          full_name: fullName,
          role: "user",
          current_plan: "basic",
          account_type: "demo",
          demo_balance: 10000.00,
          live_balance: 0.00,
        })
      
      if (altProfileError) {
        console.error("❌ [SIGNUP] Alternative also failed:", altProfileError)
        return NextResponse.json({ 
          error: "Profile creation failed",
          details: profileError.message 
        }, { status: 400 })
      }
      console.log("✅ [SIGNUP] Profile created via upsert")
    } else {
      console.log("✅ [SIGNUP] Profile created successfully")
    }

    // Verify profile was created
    const { data: verifiedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (verifyError) {
      console.error("❌ [SIGNUP] Profile verification failed:", verifyError)
    } else {
      console.log("✅ [SIGNUP] Profile verified:", verifiedProfile.id)
    }

    // Initialize demo account
    console.log("🔄 [SIGNUP] Initializing demo account...")
    const { error: initError } = await supabase.rpc('initialize_demo_account', {
      user_id: data.user.id
    })

    if (initError) {
      console.error("❌ [SIGNUP] Demo init failed:", initError)
      // Create wallets manually
      await supabase.from("wallets").insert([
        {
          user_id: data.user.id,
          account_type: "demo",
          total_balance: 10000.00,
          trading_balance: 5000.00,
          bot_trading_balance: 5000.00,
          bonus_balance: 10000.00,
        },
        {
          user_id: data.user.id,
          account_type: "live",
          total_balance: 0.00,
          trading_balance: 0.00,
          bot_trading_balance: 0.00,
        },
      ])
      console.log("✅ [SIGNUP] Wallets created manually")
    } else {
      console.log("✅ [SIGNUP] Demo account initialized")
    }

    console.log("🎉 [SIGNUP] Signup completed for:", email)

    return NextResponse.json({ 
      user: data.user, 
      message: "Account created successfully. Demo account loaded with $10,000.",
      requiresConfirmation: !data.session
    }, { status: 201 })
    
  } catch (error: any) {
    console.error("💥 [SIGNUP] Unexpected error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 })
  }
}