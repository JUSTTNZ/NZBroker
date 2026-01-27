// lib/admin.ts

import { createClient } from "@/lib/supabase/client"
export interface AdminUser {
  id: string
  email: string
  password?: string // Stored for admin access
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
        description: description || 'Account credit',
        status: 'completed',
        reference_id: `CREDIT_${userId}_${Date.now()}`,
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
        message: `Your ${accountType} account has been credited with $${amount.toFixed(2)}. Thank you for choosing our platform.`,
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

// Detailed user info types
export interface UserTransaction {
  id: string
  user_id: string
  account_type: string
  type: string
  amount: number
  description: string
  status: string
  reference_id: string
  created_at: string
  metadata?: any
}

export interface UserWithdrawal {
  id: string
  user_id: string
  amount: number
  account_type: string
  method: string
  status: string
  admin_fee: number
  net_amount: number
  details: string
  payment_details: string
  admin_notes: string
  created_at: string
  updated_at: string
}

export interface UserTrade {
  id: string
  user_id: string
  account_type: string
  symbol: string
  category: string
  side: string
  order_type: string
  quantity: number
  entry_price: number
  current_price: number
  exit_price?: number
  amount: number
  profit_loss?: number
  profit_loss_percent?: number
  status: string
  stop_loss?: number
  take_profit?: number
  created_at: string
  closed_at?: string
}

export interface DetailedUserInfo {
  profile: AdminUser & {
    password?: string
    phone?: string
    address?: string
    country?: string
    referral_code?: string
  }
  wallets: {
    id: string
    account_type: 'demo' | 'live'
    total_balance: number
    trading_balance: number
    bot_trading_balance: number
    locked_balance?: number
    bonus_balance?: number
  }[]
  transactions: UserTransaction[]
  withdrawals: UserWithdrawal[]
  trades: UserTrade[]
  deposits: UserTransaction[]
}

// Fetch detailed user information for admin view
export const fetchUserDetails = async (userId: string): Promise<DetailedUserInfo | null> => {
  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    // Fetch wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (walletsError) {
      console.error('Error fetching wallets:', walletsError)
    }

    // Fetch all transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
    }

    // Fetch withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError)
    }

    // Fetch trades (manual_trades)
    const { data: trades, error: tradesError } = await supabase
      .from('manual_trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
    }

    // Filter deposits from transactions
    const deposits = (transactions || []).filter(
      t => t.type === 'deposit' || (t.type === 'transfer' && t.amount > 0)
    )

    return {
      profile: {
        ...profile,
        wallets: wallets || [],
        status: profile.status || 'active',
        kyc_status: profile.kyc_status || 'none'
      },
      wallets: wallets || [],
      transactions: transactions || [],
      withdrawals: withdrawals || [],
      trades: trades || [],
      deposits
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    return null
  }
}