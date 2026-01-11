// lib/admin.ts

import { createClient } from "@/lib/supabase/client"
export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  account_type: 'demo' | 'live'
  demo_balance: number
  live_balance: number
  current_plan: 'basic' | 'pro' | 'elite'
  status: 'active' | 'pending' | 'inactive'
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected'
  created_at: string
  wallets: {
    id: string
    account_type: 'demo' | 'live'
    total_balance: number
    trading_balance: number
    bot_trading_balance: number
  }[]
}
 const supabase = createClient()
// Fetch all users with their wallets
export const fetchAllUsers = async (): Promise<AdminUser[]> => {
  try {
    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }

    // Fetch wallets for each user
    const usersWithWallets = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: wallets } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', profile.id)

        return {
          ...profile,
          wallets: wallets || [],
          status: 'active' as const, // You might want to add status field to profiles table
          kyc_status: 'none' as const // You might want to add KYC field to profiles table
        }
      })
    )

    return usersWithWallets
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Credit user's wallet
export const creditUserWallet = async (
  userId: string,
  amount: number,
  accountType: 'demo' | 'live',
  description?: string
) => {
  try {
    // 1. Get current wallet
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('account_type', accountType)
      .single()

    if (walletError || !walletData) {
      throw new Error(`Wallet not found for user ${userId}`)
    }

    const newTotalBalance = walletData.total_balance + amount

    // 2. Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        total_balance: newTotalBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletData.id)

    if (updateError) {
      throw updateError
    }

    // 3. Update profile balance
    const balanceField = accountType === 'demo' ? 'demo_balance' : 'live_balance'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        [balanceField]: newTotalBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.warn('Could not update profile balance:', profileError)
      // Continue anyway since wallet was updated
    }

    // 4. Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_type: accountType,
        type: 'deposit',
        amount: amount,
        description: description || 'Admin credit',
        status: 'completed',
        reference_id: `ADMIN_CREDIT_${userId}_${Date.now()}`,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.warn('Could not create transaction record:', transactionError)
      // Continue anyway since balance was updated
    }

    // 5. Create notification for user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Account Credited',
        message: `Admin credited your ${accountType} account with $${amount.toFixed(2)}`,
        type: 'credit',
        read: false,
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.warn('Could not create notification:', notificationError)
    }

    return { success: true, newBalance: newTotalBalance }
  } catch (error) {
    console.error('Error crediting user:', error)
    return { success: false, error }
  }
}

// Toggle user status
export const toggleUserStatus = async (userId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  
  // Note: You'll need to add 'status' field to your profiles table
  // Or create a separate user_status table
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId)

  return { success: !error, newStatus, error }
}