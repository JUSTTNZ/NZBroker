// app/actions/bot-trading.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BotTradeConfig {
  symbol: string;
  strategy: 'scalper' | 'trend' | 'ai' | 'premium';
  riskPercent: number;
  takeProfit: number;
  stopLoss: number;
  leverage: number;
  maxPositionSize: number;
  tradingHours: '24/7' | 'market_hours';
  autoTrade: boolean;
  botType: string;
  autoReinvest: boolean;
  tradingMode: 'conservative' | 'balanced' | 'aggressive';
  startDate: string;
  endDate: string;
  durationDays: number;
  expectedProfit: number;
  status: 'running' | 'completed' | 'paused';
  progress: number;
}

export interface BotTrade {
  id: string;
  user_id: string;
  symbol: string;
  category: 'stocks' | 'crypto' | 'forex';
  strategy: string;
  status: 'active' | 'paused' | 'stopped' | 'completed' | 'running';
  entry_price: number;
  current_price?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  config: BotTradeConfig;
  metadata?: any;
  created_at: string;
  updated_at: string;
  account_type?: 'demo' | 'live';
}

// Admin function to stop bot trade (admin can stop any bot)
export async function adminStopBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    
    // Get bot trade details
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('id', botTradeId)
      .single()
      
    if (fetchError || !botTrade) {
      throw new Error('Bot trade not found')
    }
    
    // Calculate profit based on progress
    const allocatedAmount = botTrade.metadata?.allocated_balance || 0
    const expectedProfit = botTrade.config?.expectedProfit || 0
    const currentProgress = botTrade.metadata?.progress || 0
    
    // Profit is proportional to progress
    const finalProfit = (expectedProfit * currentProgress) / 100
    const totalPayout = allocatedAmount + finalProfit
    
    // Update bot trade status
    const { error: updateError } = await supabase
      .from('bot_trades')
      .update({
        status: 'completed',
        profit_loss: finalProfit,
        profit_loss_percent: (finalProfit / allocatedAmount) * 100,
        updated_at: new Date().toISOString(),
        metadata: {
          ...botTrade.metadata,
          progress: 100,
          current_profit: finalProfit,
          final_profit: finalProfit,
          completed_at: new Date().toISOString(),
          admin_stopped: true
        }
      })
      .eq('id', botTradeId)
      
    if (updateError) {
      throw new Error('Failed to stop bot trade')
    }
    
    // Get current wallet balance
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('bot_trading_balance, total_balance')
      .eq('user_id', botTrade.user_id)
      .eq('account_type', botTrade.account_type || 'demo')
      .single()
    
    if (!currentWallet) {
      throw new Error('Wallet not found')
    }
    
    // Return allocated funds to bot trading balance plus profit
    const accountType = botTrade.account_type || 'demo'
    
    const newBotBalance = currentWallet.bot_trading_balance + totalPayout
    const newTotalBalance = currentWallet.total_balance + finalProfit
    
    // Update wallet
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({
        bot_trading_balance: newBotBalance,
        total_balance: newTotalBalance
      })
      .eq('user_id', botTrade.user_id)
      .eq('account_type', accountType)
    
    if (balanceError) {
      throw new Error(`Failed to update trading balance: ${balanceError.message}`)
    }
    
    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: botTrade.user_id,
      account_type: accountType,
      type: 'bot_completion',
      amount: finalProfit,
      description: `Bot trade completed for ${botTrade.symbol}. Progress: ${currentProgress.toFixed(1)}%, Profit: $${finalProfit.toFixed(2)}`,
      status: 'completed',
      metadata: {
        bot_trade_id: botTradeId,
        symbol: botTrade.symbol,
        strategy: botTrade.strategy,
        progress: currentProgress,
        allocated_returned: allocatedAmount,
        profit: finalProfit,
        total_payout: totalPayout,
        admin_stopped: true
      },
      reference_id: `BOT_COMPLETE_${botTradeId}`
    })
    
    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: botTrade.user_id,
      title: 'Bot Trade Completed',
      message: `Your ${botTrade.strategy} bot for ${botTrade.symbol} has been completed. Progress: ${currentProgress.toFixed(1)}%. Profit: $${finalProfit.toFixed(2)}. Total payout: $${totalPayout.toFixed(2)}`,
      type: 'bot_trade_completed',
      metadata: {
        symbol: botTrade.symbol,
        profit: finalProfit,
        progress: currentProgress,
        new_balance: newBotBalance,
        admin_stopped: true
      }
    })
    
    revalidatePath('/dashboard/bot-trading')
    revalidatePath('/admin/bot')
    
    return { 
      success: true, 
      profitLoss: finalProfit, 
      progress: currentProgress,
      newBotBalance,
      newTotalBalance
    }
  } catch (error: any) {
    throw error
  }
}

// Admin function to pause bot trade (admin can pause any bot)
export async function adminPauseBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('user_id, symbol, strategy, status, metadata')
      .eq('id', botTradeId)
      .single()
    
    if (fetchError || !botTrade) {
      throw new Error('Bot trade not found')
    }
    
    if (botTrade.status !== 'running') {
      throw new Error('Bot is not running')
    }
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
        metadata: {
          ...botTrade.metadata,
          admin_paused: true,
          admin_paused_at: new Date().toISOString()
        }
      })
      .eq('id', botTradeId)
      
    if (error) throw error
    
    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: botTrade.user_id,
      title: 'Bot Trade Paused',
      message: `Your ${botTrade.strategy} bot for ${botTrade.symbol} has been temporarily paused. It will resume operations shortly.`,
      type: 'bot_trade_paused',
      metadata: {
        symbol: botTrade.symbol,
        admin_paused: true
      }
    })
    
    revalidatePath('/dashboard/bot-trading')
    revalidatePath('/admin/bot')
    
    return { success: true }
  } catch (error: any) {
    throw error
  }
}

// Admin function to resume bot trade (admin can resume any paused bot)
export async function adminResumeBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('user_id, symbol, strategy, status, metadata')
      .eq('id', botTradeId)
      .single()
    
    if (fetchError || !botTrade) {
      throw new Error('Bot trade not found')
    }
    
    if (botTrade.status !== 'paused') {
      throw new Error('Bot is not paused')
    }
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'running',
        updated_at: new Date().toISOString(),
        metadata: {
          ...botTrade.metadata,
          admin_resumed: true,
          admin_resumed_at: new Date().toISOString()
        }
      })
      .eq('id', botTradeId)
      
    if (error) throw error
    
    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: botTrade.user_id,
      title: 'Bot Trade Resumed',
      message: `Your ${botTrade.strategy} bot for ${botTrade.symbol} has resumed trading operations. Thank you for your patience.`,
      type: 'bot_trade_resumed',
      metadata: {
        symbol: botTrade.symbol,
        admin_resumed: true
      }
    })
    
    revalidatePath('/dashboard/bot-trading')
    revalidatePath('/admin/bot')
    
    return { success: true }
  } catch (error: any) {
    throw error
  }
}

// Admin function to get all bot trades (admin can see all users' bots)
export async function adminGetAllBotTrades() {
  try {
    const supabase = await createClient()
    
    const { data: botTrades, error } = await supabase
      .from('bot_trades')
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      
    if (error) {
      throw new Error('Failed to fetch bot trades')
    }
    
    // Parse JSON strings in config and metadata
    const parsedBotTrades = botTrades?.map(bot => ({
      ...bot,
      config: typeof bot.config === 'string' ? JSON.parse(bot.config) : bot.config,
      metadata: typeof bot.metadata === 'string' ? JSON.parse(bot.metadata) : bot.metadata
    })) || []
    
    return parsedBotTrades
  } catch (error: any) {
    throw error
  }
}

// Admin function to get bot trade by ID
export async function adminGetBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    
    const { data: botTrade, error } = await supabase
      .from('bot_trades')
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .eq('id', botTradeId)
      .single()
      
    if (error || !botTrade) {
      throw new Error('Bot trade not found')
    }
    
    // Parse JSON strings in config and metadata
    const parsedBotTrade = {
      ...botTrade,
      config: typeof botTrade.config === 'string' ? JSON.parse(botTrade.config) : botTrade.config,
      metadata: typeof botTrade.metadata === 'string' ? JSON.parse(botTrade.metadata) : botTrade.metadata
    }
    
    return parsedBotTrade
  } catch (error: any) {
    throw error
  }
}

// Admin function to update bot progress or profit directly
// Can pass either progress percentage OR direct profit amount
export async function adminUpdateBotProgress(
  botTradeId: string,
  value: number,
  options?: {
    valueType?: 'progress' | 'profit'; // 'progress' = percentage, 'profit' = direct dollar amount
    newDurationDays?: number;
  }
) {
  const valueType = options?.valueType || 'progress' // Default to progress percentage for backwards compatibility

  try {
    const supabase = await createClient()

    // Fetch bot trade details
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('metadata, status, user_id, config, created_at')
      .eq('id', botTradeId)
      .single()

    if (fetchError || !botTrade) {
      throw new Error('Bot trade not found')
    }

    const expectedProfit = botTrade.config?.expectedProfit || 0
    const allocatedBalance = botTrade.metadata?.allocated_balance || 0

    let currentProfit: number
    let validatedProgress: number

    if (valueType === 'profit') {
      // Admin set a direct profit amount
      currentProfit = Math.max(0, value)
      validatedProgress = expectedProfit > 0 ? Math.min(100, (currentProfit / expectedProfit) * 100) : 0
      console.log('[adminUpdateBotProgress] Direct profit set:', currentProfit, 'Calculated progress:', validatedProgress + '%')
    } else {
      // Admin set a progress percentage
      validatedProgress = Math.min(100, Math.max(0, value))
      currentProfit = (expectedProfit * validatedProgress) / 100
      console.log('[adminUpdateBotProgress] Progress set:', validatedProgress + '%', 'Calculated profit:', currentProfit)
    }

    // Handle duration adjustment
    let newEndDate = botTrade.metadata?.endDate
    let newDurationDays = botTrade.metadata?.durationDays || 7

    if (options?.newDurationDays && options.newDurationDays > 0) {
      newDurationDays = options.newDurationDays
      const startDate = botTrade.metadata?.startDate ? new Date(botTrade.metadata.startDate) : new Date(botTrade.created_at)
      newEndDate = new Date(startDate.getTime() + newDurationDays * 24 * 60 * 60 * 1000).toISOString()
    }

    // Update bot with admin values - set BOTH admin_profit and admin_progress
    const { error: updateError } = await supabase
      .from('bot_trades')
      .update({
        // Update profit_loss directly on the record
        profit_loss: currentProfit,
        profit_loss_percent: allocatedBalance > 0 ? (currentProfit / allocatedBalance) * 100 : 0,
        metadata: {
          ...botTrade.metadata,
          progress: validatedProgress,
          current_profit: currentProfit,
          admin_profit: currentProfit, // This is what getActiveBotTrades looks for!
          admin_progress: validatedProgress,
          admin_updated: true,
          admin_updated_at: new Date().toISOString(),
          endDate: newEndDate,
          durationDays: newDurationDays
        }
      })
      .eq('id', botTradeId)

    if (updateError) {
      console.error('[adminUpdateBotProgress] Update error:', updateError)
      throw new Error('Failed to update bot')
    }

    console.log('[adminUpdateBotProgress] Bot updated. Profit:', currentProfit, 'Progress:', validatedProgress + '%')

    // If progress reaches 100% and bot is still running, auto-complete it
    if (validatedProgress >= 100 && botTrade.status === 'running') {
      await adminStopBotTrade(botTradeId)
    }

    // Create notification for user (don't mention admin)
    await supabase.from('notifications').insert({
      user_id: botTrade.user_id,
      title: 'Trading Bot Update',
      message: `Your trading bot is performing excellently! Current profit: $${currentProfit.toLocaleString()} (${validatedProgress.toFixed(1)}% of target)`,
      type: 'bot_progress_updated',
      metadata: {
        bot_trade_id: botTradeId,
        new_progress: validatedProgress,
        current_profit: currentProfit
      }
    })

    revalidatePath('/dashboard/bot-trading')
    revalidatePath('/dashboard/analysis-bot')
    revalidatePath('/admin/bot')
    revalidatePath('/admin/updatebot')

    return { success: true, progress: validatedProgress, currentProfit }
  } catch (error: any) {
    console.error('[adminUpdateBotProgress] Error:', error)
    throw error
  }
}