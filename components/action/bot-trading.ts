// app/actions/bot-trading.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BotTradeConfig {
  symbol: string;
  strategy: 'scalping' | 'swing' | 'martingale' | 'custom';
  riskPercent: number;
  takeProfit: number;
  stopLoss: number;
  leverage: number;
  maxPositionSize: number;
  tradingHours: '24/7' | 'market_hours';
  autoTrade: boolean;
  botType:string 
  autoReinvest:any
  tradingMode:any
}

export interface BotTrade {
  id: string;
  user_id: string;
  symbol: string;
  category: 'stocks' | 'crypto' | 'forex';
  strategy: string;
  status: 'active' | 'paused' | 'stopped' | 'completed';
  entry_price: number;
  current_price?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  config: BotTradeConfig;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function createBotTrade(
  symbol: string,
  category: 'stocks' | 'crypto' | 'forex',
  strategy: BotTradeConfig['strategy'],
  config: Partial<BotTradeConfig>
) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    // First get user profile to know account_type
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      throw new Error('User profile not found')
    }
    
    // Check if user has bot trading balance for the current account type
    const { data: wallet } = await supabase
      .from('wallets')
      .select('bot_trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    if (!wallet) {
      throw new Error('Wallet not found')
    }
    
    console.log('Current bot trading balance:', wallet.bot_trading_balance)
    
    if (wallet.bot_trading_balance <= 0) {
      throw new Error('Insufficient bot trading balance. Please transfer funds first.')
    }
    
    // Get current market price (simulated)
    const currentPrice = await getCurrentMarketPrice(symbol, category)
    
    // Calculate position size
    const riskAmount = (wallet.bot_trading_balance * (config.riskPercent || 2)) / 100
    const positionSize = riskAmount * (config.leverage || 1)
    
    console.log('Position size calculated:', {
      botBalance: wallet.bot_trading_balance,
      riskPercent: config.riskPercent || 2,
      riskAmount,
      leverage: config.leverage || 1,
      positionSize
    })
    
    // Validate position size
    if (positionSize > wallet.bot_trading_balance * 0.5) {
      throw new Error('Position size exceeds 50% of bot trading balance')
    }
    
    if (positionSize < 10) {
      throw new Error('Minimum position size is $10')
    }
    
    if (positionSize > wallet.bot_trading_balance) {
      throw new Error('Position size exceeds available bot trading balance')
    }
    
    // Create bot trade
    const { data: botTrade, error: createError } = await supabase
      .from('bot_trades')
      .insert({
        user_id: user.id,
        symbol,
        category,
        strategy,
        entry_price: currentPrice,
        status: 'active',
        account_type: profile.account_type,
        config: {
          riskPercent: config.riskPercent || 2,
          takeProfit: config.takeProfit || 5,
          stopLoss: config.stopLoss || 2,
          leverage: config.leverage || 1,
          maxPositionSize: config.maxPositionSize || wallet.bot_trading_balance * 0.1,
          tradingHours: config.tradingHours || 'market_hours',
          autoTrade: config.autoTrade || true,
        },
        metadata: {
          quantity: positionSize / currentPrice,
          risk_amount: riskAmount,
          allocated_balance: positionSize,
          account_type: profile.account_type,
          starting_balance: wallet.bot_trading_balance
        }
      })
      .select()
      .single()
      
    if (createError) {
      console.error('Create bot trade error:', createError)
      throw new Error(`Failed to create bot trade: ${createError.message}`)
    }
    
    console.log('Bot trade created, ID:', botTrade.id)
    console.log('Attempting to deduct:', positionSize, 'from balance:', wallet.bot_trading_balance)
    
    // 🔧 FIX: Use direct update instead of RPC
    const { error: allocateError } = await supabase
      .from('wallets')
      .update({ 
        bot_trading_balance: wallet.bot_trading_balance - positionSize 
      })
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
    
    if (allocateError) {
      console.error('Allocate funds error:', allocateError)
      
      // Rollback: Delete the bot trade since allocation failed
      await supabase.from('bot_trades').delete().eq('id', botTrade.id)
      
      throw new Error(`Failed to allocate trading funds: ${allocateError.message}`)
    }
    
    console.log('Funds successfully allocated. New balance:', wallet.bot_trading_balance - positionSize)
    
    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Bot Trade Started',
      message: `Bot started trading ${symbol} with ${strategy} strategy. Allocated: $${positionSize.toFixed(2)}`,
      type: 'bot_trade_started',
      metadata: {
        symbol,
        strategy,
        allocated_amount: positionSize,
        new_balance: wallet.bot_trading_balance - positionSize
      }
    })
    
    // Create transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_type: profile.account_type,
      type: 'bot_allocation',
      amount: -positionSize,
      description: `Bot trade allocation for ${symbol} (${strategy})`,
      status: 'completed',
      reference_id: `BOT_${botTrade.id}`,
      metadata: {
        bot_trade_id: botTrade.id,
        symbol,
        strategy
      }
    })
    
    revalidatePath('/dashboard/bot-trading')
    return { success: true, botTrade, allocatedAmount: positionSize }
  } catch (error: any) {
    console.error('Create bot trade failed:', error)
    throw error
  }
}
export async function stopBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    // Get bot trade details
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      .single()
      
    if (fetchError || !botTrade) {
      throw new Error('Bot trade not found')
    }
    
    // Get current price for P&L calculation
    const currentPrice = await getCurrentMarketPrice(botTrade.symbol, botTrade.category)
    const quantity = botTrade.metadata?.quantity || 0
    const profitLoss = (currentPrice - botTrade.entry_price) * quantity
    const profitLossPercent = ((currentPrice - botTrade.entry_price) / botTrade.entry_price) * 100
    
    // Update bot trade status
    const { error: updateError } = await supabase
      .from('bot_trades')
      .update({
        status: 'stopped',
        current_price: currentPrice,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
        updated_at: new Date().toISOString()
      })
      .eq('id', botTradeId)
      
    if (updateError) {
      throw new Error('Failed to stop bot trade')
    }
    
    // 🔧 FIX: Get current wallet balance first
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('bot_trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', botTrade.account_type || 'demo')
      .single()
    
    if (!currentWallet) {
      throw new Error('Wallet not found')
    }
    
    // Return allocated funds to bot trading balance plus profit/loss
    const allocatedAmount = botTrade.metadata?.allocated_balance || 0
    const accountType = botTrade.account_type || 'demo'
    
    const newBotBalance = currentWallet.bot_trading_balance + allocatedAmount + profitLoss
    const newTotalBalance = currentWallet.total_balance + Math.max(profitLoss, 0)
    
    // 🔧 FIX: Use direct update instead of RPC
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({
        bot_trading_balance: newBotBalance,
        total_balance: newTotalBalance
      })
      .eq('user_id', user.id)
      .eq('account_type', accountType)
    
    if (balanceError) {
      console.error('Update balance error:', balanceError)
      throw new Error(`Failed to update trading balance: ${balanceError.message}`)
    }
    
    // Create transaction record
    const transactionType = profitLoss >= 0 ? 'bot_profit' : 'bot_loss'
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_type: accountType,
      type: transactionType,
      amount: profitLoss,
      description: `Bot trade ${profitLoss >= 0 ? 'profit' : 'loss'} for ${botTrade.symbol}`,
      status: 'completed',
      metadata: {
        bot_trade_id: botTradeId,
        symbol: botTrade.symbol,
        strategy: botTrade.strategy,
        entry_price: botTrade.entry_price,
        exit_price: currentPrice,
        allocated_returned: allocatedAmount
      },
      reference_id: `BOT_CLOSE_${botTradeId}`
    })
    
    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Bot Trade Stopped',
      message: `Bot trade for ${botTrade.symbol} stopped. ${profitLoss >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profitLoss).toFixed(2)} (${profitLossPercent.toFixed(2)}%)`,
      type: profitLoss >= 0 ? 'profit' : 'loss',
      metadata: {
        symbol: botTrade.symbol,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
        new_balance: newBotBalance
      }
    })
    
    revalidatePath('/dashboard/bot-trading')
    return { 
      success: true, 
      profitLoss, 
      profitLossPercent,
      newBotBalance,
      newTotalBalance
    }
  } catch (error: any) {
    console.error('Stop bot trade failed:', error)
    throw error
  }
}

export async function getActiveBotTrades() {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    const { data: botTrades, error } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      
    if (error) {
      throw new Error('Failed to fetch bot trades')
    }
    
    // Update with current prices
    const updatedBotTrades = await Promise.all(
      (botTrades || []).map(async (trade) => {
        try {
          const currentPrice = await getCurrentMarketPrice(trade.symbol, trade.category)
          const quantity = trade.metadata?.quantity || 0
          const profitLoss = (currentPrice - trade.entry_price) * quantity
          const profitLossPercent = ((currentPrice - trade.entry_price) / trade.entry_price) * 100
          
          return {
            ...trade,
            current_price: currentPrice,
            profit_loss: profitLoss,
            profit_loss_percent: profitLossPercent
          }
        } catch {
          return trade
        }
      })
    )
    
    return updatedBotTrades
  } catch (error: any) {
    throw error
  }
}

export async function getBotTradingBalance() {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    // Get user's current account type
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return 0
    }
    
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('bot_trading_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    if (error) {
      throw new Error('Failed to fetch bot trading balance')
    }
    
    return wallet?.bot_trading_balance || 0
  } catch (error: any) {
    throw error
  }
}

export async function pauseBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      
    if (error) throw error
    
    revalidatePath('/dashboard/bot-trading')
    return { success: true }
  } catch (error: any) {
    throw error
  }
}

export async function resumeBotTrade(botTradeId: string) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      
    if (error) throw error
    
    revalidatePath('/dashboard/bot-trading')
    return { success: true }
  } catch (error: any) {
    throw error
  }
}

async function getCurrentMarketPrice(symbol: string, category: 'stocks' | 'crypto' | 'forex'): Promise<number> {
  const priceMap: Record<string, number> = {
    'AAPL': 182.45,
    'MSFT': 378.91,
    'GOOGL': 139.50,
    'AMZN': 187.23,
    'TSLA': 242.18,
    'META': 502.45,
    'BTCUSD': 43250.00,
    'ETHUSD': 2340.50,
    'BNBUSD': 612.30,
    'EURUSD': 1.0850,
    'GBPUSD': 1.2730,
    'JPYUSD': 0.0067,
  }
  
  const basePrice = priceMap[symbol] || 100
  const volatility = category === 'crypto' ? 0.05 : 0.02
  const randomChange = (Math.random() * 2 - 1) * volatility
  
  return basePrice * (1 + randomChange)
}