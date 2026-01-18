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

async function getCurrentUser() {
  console.log('[getCurrentUser] Starting user authentication check')
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('[getCurrentUser] Authentication failed:', error?.message || 'No user found')
    throw new Error('Authentication required')
  }
  
  console.log('[getCurrentUser] User authenticated successfully:', user.id, user.email)
  return user
}

// Calculate profit percentage based on investment amount
function calculateProfitPercentage(investmentAmount: number): number {
  console.log('[calculateProfitPercentage] Calculating for amount:', investmentAmount)
  
  // Higher investment = Higher profit percentage
  if (investmentAmount >= 10000) {
    console.log('[calculateProfitPercentage] Tier: 25% for $10k+')
    return 25  // 25% for $10k+
  }
  if (investmentAmount >= 5000) {
    console.log('[calculateProfitPercentage] Tier: 20% for $5k+')
    return 20   // 20% for $5k+
  }
  if (investmentAmount >= 2500) {
    console.log('[calculateProfitPercentage] Tier: 15% for $2.5k+')
    return 15   // 15% for $2.5k+
  }
  if (investmentAmount >= 1000) {
    console.log('[calculateProfitPercentage] Tier: 10% for $1k+')
    return 10   // 10% for $1k+
  }
  if (investmentAmount >= 500) {
    console.log('[calculateProfitPercentage] Tier: 8% for $500+')
    return 8     // 8% for $500+
  }
  if (investmentAmount >= 250) {
    console.log('[calculateProfitPercentage] Tier: 6% for $250+')
    return 6     // 6% for $250+
  }
  if (investmentAmount >= 100) {
    console.log('[calculateProfitPercentage] Tier: 5% for $100+')
    return 5     // 5% for $100+
  }
  
  console.log('[calculateProfitPercentage] Tier: 3% for less than $100')
  return 3  // 3% for less than $100
}

function calculateExpectedProfit(
  investment: number,
  tradingMode: 'conservative' | 'balanced' | 'aggressive'
): number {
  console.log('[calculateExpectedProfit] Calculating for investment:', investment, 'Mode:', tradingMode)
  
  // Base profit percentage based on investment amount
  const basePercentage = calculateProfitPercentage(investment)
  console.log('[calculateExpectedProfit] Base percentage:', basePercentage + '%')
  
  // Trading mode multiplier
  const modeMultiplier = {
    'conservative': 1,
    'balanced': 1.5,
    'aggressive': 2
  }[tradingMode] || 1
  
  console.log('[calculateExpectedProfit] Mode multiplier:', modeMultiplier)
  
  // Calculate profit: investment × percentage × mode multiplier
  const baseProfit = (investment * basePercentage) / 100
  const expectedProfit = baseProfit * modeMultiplier
  
  console.log('[calculateExpectedProfit] Base profit:', baseProfit.toFixed(2), 'Expected profit:', expectedProfit.toFixed(2))
  
  return expectedProfit
}

// Calculate progress with minimum 10% on first day
function calculateProgressWithMinStart(startDate: Date, currentDate: Date): number {
  console.log('[calculateProgressWithMinStart] Calculating progress from', startDate, 'to', currentDate)
  
  const daysPassed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  const maxDays = 7
  
  console.log('[calculateProgressWithMinStart] Days passed:', daysPassed.toFixed(2), '/', maxDays)
  
  // Linear progress from 0-100%
  const linearProgress = (daysPassed / maxDays) * 100
  console.log('[calculateProgressWithMinStart] Linear progress:', linearProgress.toFixed(2) + '%')
  
  // Minimum starting progress (10% on first day)
  const minProgressOnDay1 = 10
  
  // Apply minimum: if less than 1 day passed, use minProgressOnDay1
  // Otherwise use linear progress
  const calculatedProgress = daysPassed < 1 
    ? minProgressOnDay1 
    : Math.min(100, linearProgress)
  
  const finalProgress = Math.max(0, calculatedProgress)
  console.log('[calculateProgressWithMinStart] Final progress:', finalProgress.toFixed(2) + '%')
  
  return finalProgress
}

// Alternative: Progressive curve (15% day 1, 30% day 2, etc.)
function calculateProgressiveProgress(startDate: Date, currentDate: Date): number {
  console.log('[calculateProgressiveProgress] Calculating progressive progress from', startDate, 'to', currentDate)
  
  const daysPassed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  const currentDay = Math.floor(daysPassed)
  const nextDay = Math.ceil(daysPassed)
  
  console.log('[calculateProgressiveProgress] Days passed:', daysPassed.toFixed(2), 'Current day:', currentDay, 'Next day:', nextDay)
  
  // Predefined progress curve
  const dayProgress = [15, 30, 45, 60, 72, 84, 100] // Day 0-6
  
  // Get progress for current and next day
  const currentProgress = dayProgress[Math.min(currentDay, 6)] || 0
  const nextProgress = dayProgress[Math.min(nextDay, 6)] || 100
  
  console.log('[calculateProgressiveProgress] Current day progress:', currentProgress + '%', 'Next day progress:', nextProgress + '%')
  
  // Linear interpolation for fractional days
  const fraction = daysPassed - currentDay
  const progress = currentProgress + (fraction * (nextProgress - currentProgress))
  
  const finalProgress = Math.min(100, Math.max(0, progress))
  console.log('[calculateProgressiveProgress] Final progress:', finalProgress.toFixed(2) + '%')
  
  return finalProgress
}

export async function createBotTrade(
  symbol: string,
  category: 'stocks' | 'crypto' | 'forex',
  strategy: BotTradeConfig['strategy'],
  config: Partial<BotTradeConfig>
) {
  console.log('[createBotTrade] Starting bot creation:', { symbol, category, strategy, config })
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[createBotTrade] User:', user.id, 'Email:', user.email)
    
    // First get user profile to know account_type and current plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, current_plan')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      console.error('[createBotTrade] User profile not found for user:', user.id)
      throw new Error('User profile not found')
    }
    
    console.log('[createBotTrade] User profile:', profile)
    
    // Check plan restrictions
    if (profile.current_plan === 'basic') {
      console.warn('[createBotTrade] Basic plan user attempting to use bot trading:', user.id)
      throw new Error('Upgrade to Pro or Elite plan to use bot trading')
    }
    
    console.log('[createBotTrade] User plan check passed:', profile.current_plan)
    
    // Check if bot type is allowed for user's plan
    const planLevels = { 'basic': 0, 'pro': 1, 'elite': 2 }
    const userPlanLevel = planLevels[profile.current_plan as keyof typeof planLevels] || 0
    const botPlanRequirements = { 'scalper': 0, 'trend': 1, 'ai': 1, 'premium': 2 }
    const botPlanLevel = botPlanRequirements[strategy] || 0
    
    console.log('[createBotTrade] Plan check - User level:', userPlanLevel, 'Bot requirement:', botPlanLevel)
    
    if (userPlanLevel < botPlanLevel) {
      console.warn('[createBotTrade] Plan level insufficient for bot strategy:', strategy)
      throw new Error(`This bot requires ${strategy === 'premium' ? 'Elite' : 'Pro'} plan or higher`)
    }
    
    // Check if user has bot trading balance for the current account type
    const { data: wallet } = await supabase
      .from('wallets')
      .select('bot_trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    if (!wallet) {
      console.error('[createBotTrade] Wallet not found for user:', user.id, 'Account type:', profile.account_type)
      throw new Error('Wallet not found')
    }
    
    console.log('[createBotTrade] Wallet found:', wallet)
    
    if (wallet.bot_trading_balance <= 0) {
      console.warn('[createBotTrade] Insufficient bot trading balance:', wallet.bot_trading_balance)
      throw new Error('Insufficient bot trading balance. Please transfer funds first.')
    }
    
    // Use the provided investment amount from config
    const investmentAmount = config.maxPositionSize || wallet.bot_trading_balance * 0.1
    
    console.log('[createBotTrade] Investment amount:', investmentAmount)
    
    // Validate investment amount
    if (investmentAmount > wallet.bot_trading_balance) {
      console.warn('[createBotTrade] Investment exceeds balance:', investmentAmount, '>', wallet.bot_trading_balance)
      throw new Error('Investment amount exceeds available bot trading balance')
    }
    
    if (investmentAmount < 100) {
      console.warn('[createBotTrade] Investment below minimum:', investmentAmount)
      throw new Error('Minimum investment is $100 for bot trading')
    }
    
    // FIXED 7 days only
    const durationDays = 7
    
    // Get current market price (simulated)
    const currentPrice = await getCurrentMarketPrice(symbol, category)
    console.log('[createBotTrade] Current market price for', symbol, ':', currentPrice)
    
    // Calculate profit percentage automatically based on investment
    const profitPercentage = calculateProfitPercentage(investmentAmount)
    console.log('[createBotTrade] Profit percentage:', profitPercentage + '%')
    
    // Calculate expected profit
    const expectedProfit = calculateExpectedProfit(
      investmentAmount,
      config.tradingMode || 'balanced'
    )
    console.log('[createBotTrade] Expected profit:', expectedProfit)
    
    // Calculate start and end dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)
    
    console.log('[createBotTrade] Start date:', startDate.toISOString(), 'End date:', endDate.toISOString())
    
    // Calculate initial progress (will be 10% on creation)
    const initialProgress = calculateProgressWithMinStart(startDate, startDate)
    console.log('[createBotTrade] Initial progress:', initialProgress.toFixed(2) + '%')
    
    // Create bot trade
    console.log('[createBotTrade] Creating bot trade in database...')
    const { data: botTrade, error: createError } = await supabase
      .from('bot_trades')
      .insert({
        user_id: user.id,
        symbol,
        category,
        strategy,
        entry_price: currentPrice,
        status: 'running',
        account_type: profile.account_type,
        config: {
          riskPercent: config.riskPercent || 0,
          takeProfit: profitPercentage,
          stopLoss: config.stopLoss || 0,
          leverage: config.leverage || 1,
          maxPositionSize: investmentAmount,
          tradingHours: config.tradingHours || '24/7',
          autoTrade: config.autoTrade || true,
          botType: config.botType || strategy,
          autoReinvest: config.autoReinvest || false,
          tradingMode: config.tradingMode || 'balanced',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationDays: durationDays,
          expectedProfit: expectedProfit,
          status: 'running',
          progress: initialProgress
        },
        metadata: {
          quantity: investmentAmount / currentPrice,
          allocated_balance: investmentAmount,
          account_type: profile.account_type,
          starting_balance: wallet.bot_trading_balance,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationDays: durationDays,
          profitPercentage: profitPercentage,
          expectedProfit: expectedProfit,
          progress: initialProgress,
          botType: config.botType || strategy,
          tradingMode: config.tradingMode || 'balanced',
          autoReinvest: config.autoReinvest || false,
          current_progress_days: 0,
          max_progress_days: durationDays,
          // Add initial profit based on 10% progress
          current_profit: (expectedProfit * initialProgress) / 100
        }
      })
      .select()
      .single()
      
    if (createError) {
      console.error('[createBotTrade] Create bot trade error:', createError)
      throw new Error(`Failed to create bot trade: ${createError.message}`)
    }
    
    console.log('[createBotTrade] Bot trade created successfully:', botTrade.id)
    
    // Deduct from bot trading balance
    console.log('[createBotTrade] Deducting from bot trading balance...')
    const { error: allocateError } = await supabase
      .from('wallets')
      .update({ 
        bot_trading_balance: wallet.bot_trading_balance - investmentAmount 
      })
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
    
    if (allocateError) {
      console.error('[createBotTrade] Allocate funds error:', allocateError)
      
      // Rollback: Delete the bot trade since allocation failed
      console.log('[createBotTrade] Rolling back: deleting bot trade', botTrade.id)
      await supabase.from('bot_trades').delete().eq('id', botTrade.id)
      
      throw new Error(`Failed to allocate trading funds: ${allocateError.message}`)
    }
    
    console.log('[createBotTrade] Funds allocated successfully. New balance:', wallet.bot_trading_balance - investmentAmount)
    
    // Create notification
    console.log('[createBotTrade] Creating notification...')
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Bot Trade Started',
      message: `${strategy} bot started trading ${symbol}. Allocated: $${investmentAmount.toFixed(2)} for 7 days. Expected profit: $${expectedProfit.toFixed(2)}. Starting progress: ${initialProgress.toFixed(1)}%`,
      type: 'trading_signal',
      metadata: {
        symbol,
        strategy,
        allocated_amount: investmentAmount,
        new_balance: wallet.bot_trading_balance - investmentAmount,
        durationDays: durationDays,
        profitPercentage: profitPercentage,
        expectedProfit: expectedProfit,
        initialProgress: initialProgress
      }
    })
    
    console.log('[createBotTrade] Notification created')
    
    // Create transaction
    console.log('[createBotTrade] Creating transaction record...')
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_type: profile.account_type,
      type: 'trading_profit',
      amount: investmentAmount,
      description: `${strategy} bot allocation for ${symbol} (7 days). Starting progress: ${initialProgress.toFixed(1)}%`,
      status: 'completed',
      reference_id: `BOT_${botTrade.id}`,
      metadata: {
        bot_trade_id: botTrade.id,
        symbol,
        strategy,
        durationDays: durationDays,
        profitPercentage: profitPercentage,
        expectedProfit: expectedProfit,
        initialProgress: initialProgress
      }
    })
    
    console.log('[createBotTrade] Transaction created')
    
    revalidatePath('/dashboard/bot-trading')
    console.log('[createBotTrade] Bot trade creation completed successfully')
    
    return { 
      success: true, 
      botTrade, 
      investmentAmount,
      profitPercentage,
      expectedProfit,
      initialProgress,
      totalPayout: investmentAmount + expectedProfit,
      durationDays: 7
    }
  } catch (error: any) {
    console.error('[createBotTrade] Create bot trade failed:', error)
    throw error
  }
}

export async function stopBotTrade(botTradeId: string) {
  console.log('[stopBotTrade] Stopping bot trade:', botTradeId)
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[stopBotTrade] User:', user.id)
    
    // Get bot trade details
    console.log('[stopBotTrade] Fetching bot trade details...')
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      .single()
      
    if (fetchError || !botTrade) {
      console.error('[stopBotTrade] Bot trade not found:', botTradeId, 'Error:', fetchError)
      throw new Error('Bot trade not found')
    }
    
    console.log('[stopBotTrade] Bot trade found:', botTrade.id, 'Symbol:', botTrade.symbol, 'Status:', botTrade.status)
    
    // Calculate profit based on progress
    const allocatedAmount = botTrade.metadata?.allocated_balance || 0
    const expectedProfit = botTrade.config?.expectedProfit || 0
    const currentProgress = botTrade.metadata?.progress || 0
    
    console.log('[stopBotTrade] Profit calculation:', {
      allocatedAmount,
      expectedProfit,
      currentProgress
    })
    
    // Profit is proportional to progress
    const finalProfit = (expectedProfit * currentProgress) / 100
    const totalPayout = allocatedAmount + finalProfit
    
    console.log('[stopBotTrade] Final profit:', finalProfit.toFixed(2), 'Total payout:', totalPayout.toFixed(2))
    
    // Update bot trade status
    console.log('[stopBotTrade] Updating bot trade status to completed...')
    const { error: updateError } = await supabase
      .from('bot_trades')
      .update({
        status: 'completed',
        profit_loss: finalProfit,
        profit_loss_percent: (finalProfit / allocatedAmount) * 100,
        updated_at: new Date().toISOString(),
        // Update metadata with final values
        metadata: {
          ...botTrade.metadata,
          progress: 100,
          current_profit: finalProfit,
          final_profit: finalProfit,
          completed_at: new Date().toISOString()
        }
      })
      .eq('id', botTradeId)
      
    if (updateError) {
      console.error('[stopBotTrade] Failed to update bot trade:', updateError)
      throw new Error('Failed to stop bot trade')
    }
    
    console.log('[stopBotTrade] Bot trade updated successfully')
    
    // Get current wallet balance
    console.log('[stopBotTrade] Fetching current wallet balance...')
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('bot_trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', botTrade.account_type || 'demo')
      .single()
    
    if (!currentWallet) {
      console.error('[stopBotTrade] Wallet not found for user:', user.id)
      throw new Error('Wallet not found')
    }
    
    console.log('[stopBotTrade] Current wallet balance:', currentWallet)
    
    // Return allocated funds to bot trading balance plus profit
    const accountType = botTrade.account_type || 'demo'
    
    const newBotBalance = currentWallet.bot_trading_balance + totalPayout
    const newTotalBalance = currentWallet.total_balance + finalProfit
    
    console.log('[stopBotTrade] New balances - Bot:', newBotBalance.toFixed(2), 'Total:', newTotalBalance.toFixed(2))
    
    // Update wallet
    console.log('[stopBotTrade] Updating wallet balances...')
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({
        bot_trading_balance: newBotBalance,
        total_balance: newTotalBalance
      })
      .eq('user_id', user.id)
      .eq('account_type', accountType)
    
    if (balanceError) {
      console.error('[stopBotTrade] Update balance error:', balanceError)
      throw new Error(`Failed to update trading balance: ${balanceError.message}`)
    }
    
    console.log('[stopBotTrade] Wallet updated successfully')
    
    // Create transaction record
    console.log('[stopBotTrade] Creating transaction record...')
    await supabase.from('transactions').insert({
      user_id: user.id,
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
        total_payout: totalPayout
      },
      reference_id: `BOT_COMPLETE_${botTradeId}`
    })
    
    console.log('[stopBotTrade] Transaction created')
    
    // Create notification
    console.log('[stopBotTrade] Creating notification...')
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Bot Trade Completed',
      message: `${botTrade.strategy} bot for ${botTrade.symbol} completed. Progress: ${currentProgress.toFixed(1)}%. Profit: $${finalProfit.toFixed(2)}. Total payout: $${totalPayout.toFixed(2)}`,
      type: 'bot_trade_completed',
      metadata: {
        symbol: botTrade.symbol,
        profit: finalProfit,
        progress: currentProgress,
        new_balance: newBotBalance
      }
    })
    
    console.log('[stopBotTrade] Notification created')
    
    revalidatePath('/dashboard/bot-trading')
    console.log('[stopBotTrade] Bot trade stopped successfully')
    
    return { 
      success: true, 
      profitLoss: finalProfit, 
      progress: currentProgress,
      newBotBalance,
      newTotalBalance
    }
  } catch (error: any) {
    console.error('[stopBotTrade] Stop bot trade failed:', error)
    throw error
  }
}

export async function getActiveBotTrades() {
  console.log('[getActiveBotTrades] Fetching active bot trades')
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[getActiveBotTrades] User:', user.id)
    
    const { data: botTrades, error } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('[getActiveBotTrades] Failed to fetch bot trades:', error)
      throw new Error('Failed to fetch bot trades')
    }
    
    console.log('[getActiveBotTrades] Found', botTrades?.length || 0, 'active bot trades')
    
    // Check and auto-complete expired bots (after 7 days)
    const now = new Date()
    const updatedBotTrades = await Promise.all(
      (botTrades || []).map(async (trade, index) => {
        console.log(`[getActiveBotTrades] Processing bot ${index + 1}/${botTrades.length}:`, trade.id, trade.symbol)
        
        try {
          // Check if bot has expired (7 days passed)
          const endDate = trade.metadata?.endDate ? new Date(trade.metadata.endDate) : null
          const startDate = trade.metadata?.startDate ? new Date(trade.metadata.startDate) : new Date()
          
          console.log(`[getActiveBotTrades] Bot ${trade.id}: Start date:`, startDate, 'End date:', endDate, 'Now:', now)
          
          if (endDate && now > endDate) {
            console.log(`[getActiveBotTrades] Bot ${trade.id} has expired. Auto-completing...`)
            // Bot has expired (7 days completed), auto-complete it
            await stopBotTrade(trade.id)
            console.log(`[getActiveBotTrades] Bot ${trade.id} auto-completed`)
            return null
          }
          
          // Calculate current progress with minimum 10% starting point
          const currentProgress = calculateProgressWithMinStart(startDate, now)
          // OR use progressive curve: const currentProgress = calculateProgressiveProgress(startDate, now)
          
          console.log(`[getActiveBotTrades] Bot ${trade.id} current progress:`, currentProgress.toFixed(2) + '%')
          
          // Get progress from admin override if exists
          const adminProgress = trade.metadata?.progress || 0
          
          // Use admin progress if set, otherwise use calculated progress
          const finalProgress = adminProgress > 0 ? adminProgress : currentProgress
          
          if (adminProgress > 0) {
            console.log(`[getActiveBotTrades] Bot ${trade.id} using admin progress:`, adminProgress + '%')
          }
          
          // Calculate days passed
          const daysPassed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          const maxDays = 7
          
          console.log(`[getActiveBotTrades] Bot ${trade.id} days passed:`, daysPassed.toFixed(2), '/', maxDays)
          
          // Calculate current profit based on progress
          const allocatedBalance = trade.metadata?.allocated_balance || 0
          const expectedProfit = trade.config?.expectedProfit || 0
          const currentProfit = (expectedProfit * finalProgress) / 100
          
          console.log(`[getActiveBotTrades] Bot ${trade.id} - Allocated: $${allocatedBalance.toFixed(2)}, Expected: $${expectedProfit.toFixed(2)}, Current: $${currentProfit.toFixed(2)}`)
          
          // Update progress if it has changed (and no admin override)
          if (adminProgress === 0 && Math.abs(finalProgress - (trade.metadata?.progress || 0)) > 0.1) {
            console.log(`[getActiveBotTrades] Bot ${trade.id} progress changed from ${trade.metadata?.progress || 0}% to ${finalProgress.toFixed(2)}%. Updating...`)
            
            await supabase
              .from('bot_trades')
              .update({
                metadata: {
                  ...trade.metadata,
                  progress: finalProgress,
                  current_progress_days: daysPassed,
                  current_profit: currentProfit,
                  days_remaining: Math.max(0, maxDays - daysPassed)
                }
              })
              .eq('id', trade.id)
              
            console.log(`[getActiveBotTrades] Bot ${trade.id} progress updated in database`)
          }
          
          const updatedTrade = {
            ...trade,
            current_price: trade.entry_price,
            profit_loss: currentProfit,
            profit_loss_percent: (currentProfit / allocatedBalance) * 100,
            metadata: {
              ...trade.metadata,
              progress: finalProgress,
              current_progress_days: daysPassed,
              days_remaining: Math.max(0, maxDays - daysPassed),
              current_profit: currentProfit,
              estimated_completion_date: endDate
            }
          }
          
          console.log(`[getActiveBotTrades] Bot ${trade.id} processing complete. Final progress: ${finalProgress.toFixed(2)}%`)
          return updatedTrade
        } catch (error) {
          console.error(`[getActiveBotTrades] Error processing bot ${trade.id}:`, error)
          return trade
        }
      })
    )
    
    // Filter out null values (completed bots)
    const filteredTrades = updatedBotTrades.filter(Boolean) as BotTrade[]
    console.log(`[getActiveBotTrades] Returning ${filteredTrades.length} active bot trades`)
    
    return filteredTrades
  } catch (error: any) {
    console.error('[getActiveBotTrades] Error:', error)
    throw error
  }
}

export async function getBotTradingBalance() {
  console.log('[getBotTradingBalance] Fetching bot trading balance')
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[getBotTradingBalance] User:', user.id)
    
    // Get user's current account type and plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, current_plan')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      console.warn('[getBotTradingBalance] User profile not found')
      return 0
    }
    
    console.log('[getBotTradingBalance] User profile:', profile)
    
    // Check plan restrictions
    if (profile.current_plan === 'basic') {
      console.log('[getBotTradingBalance] Basic plan user - no bot trading access')
      return 0 // Basic plan users cannot use bot trading
    }
    
    console.log('[getBotTradingBalance] Plan check passed:', profile.current_plan)
    
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('bot_trading_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    if (error) {
      console.error('[getBotTradingBalance] Failed to fetch wallet:', error)
      throw new Error('Failed to fetch bot trading balance')
    }
    
    console.log('[getBotTradingBalance] Bot trading balance:', wallet?.bot_trading_balance || 0)
    
    return wallet?.bot_trading_balance || 0
  } catch (error: any) {
    console.error('[getBotTradingBalance] Error:', error)
    throw error
  }
}

export async function pauseBotTrade(botTradeId: string) {
  console.log('[pauseBotTrade] Pausing bot trade:', botTradeId)
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[pauseBotTrade] User:', user.id)
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      
    if (error) {
      console.error('[pauseBotTrade] Failed to pause bot trade:', error)
      throw error
    }
    
    console.log('[pauseBotTrade] Bot trade paused successfully')
    
    revalidatePath('/dashboard/bot-trading')
    return { success: true }
  } catch (error: any) {
    console.error('[pauseBotTrade] Error:', error)
    throw error
  }
}

export async function resumeBotTrade(botTradeId: string) {
  console.log('[resumeBotTrade] Resuming bot trade:', botTradeId)
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[resumeBotTrade] User:', user.id)
    
    const { error } = await supabase
      .from('bot_trades')
      .update({
        status: 'running',
        updated_at: new Date().toISOString()
      })
      .eq('id', botTradeId)
      .eq('user_id', user.id)
      
    if (error) {
      console.error('[resumeBotTrade] Failed to resume bot trade:', error)
      throw error
    }
    
    console.log('[resumeBotTrade] Bot trade resumed successfully')
    
    revalidatePath('/dashboard/bot-trading')
    return { success: true }
  } catch (error: any) {
    console.error('[resumeBotTrade] Error:', error)
    throw error
  }
}

// Admin function to update bot progress
export async function updateBotProgress(botTradeId: string, progress: number) {
  console.log('[updateBotProgress] Admin updating bot progress:', botTradeId, 'to', progress + '%')
  
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    console.log('[updateBotProgress] Admin user:', user.id, user.email)
    
    // Update bot progress in metadata
    const { data: botTrade, error: fetchError } = await supabase
      .from('bot_trades')
      .select('metadata, status, user_id, config')
      .eq('id', botTradeId)
      .single()
    
    if (fetchError || !botTrade) {
      console.error('[updateBotProgress] Bot trade not found:', botTradeId, 'Error:', fetchError)
      throw new Error('Bot trade not found')
    }
    
    console.log('[updateBotProgress] Bot trade found. User:', botTrade.user_id, 'Current progress:', botTrade.metadata?.progress || 0)
    
    const validatedProgress = Math.min(100, Math.max(0, progress))
    console.log('[updateBotProgress] Validated progress:', validatedProgress + '%')
    
    // Calculate current profit based on new progress
    const expectedProfit = botTrade.config?.expectedProfit || 0
    const currentProfit = (expectedProfit * validatedProgress) / 100
    
    console.log('[updateBotProgress] Expected profit:', expectedProfit, 'Current profit:', currentProfit)
    
    const { error: updateError } = await supabase
      .from('bot_trades')
      .update({
        metadata: {
          ...botTrade.metadata,
          progress: validatedProgress,
          current_profit: currentProfit,
          admin_updated: true,
          admin_updated_at: new Date().toISOString()
        }
      })
      .eq('id', botTradeId)
    
    if (updateError) {
      console.error('[updateBotProgress] Failed to update bot progress:', updateError)
      throw new Error('Failed to update bot progress')
    }
    
    console.log('[updateBotProgress] Bot progress updated in database')
    
    // If progress reaches 100% and bot is still running, auto-complete it
    if (validatedProgress >= 100 && botTrade.status === 'running') {
      console.log('[updateBotProgress] Progress reached 100%, auto-completing bot...')
      await stopBotTrade(botTradeId)
      console.log('[updateBotProgress] Bot auto-completed')
    }
    
    // Create notification for user
    console.log('[updateBotProgress] Creating notification for user...')
    await supabase.from('notifications').insert({
      user_id: botTrade.user_id,
      title: 'Bot Progress Updated',
      message: `Your trading bot progress has been updated to ${validatedProgress.toFixed(1)}%. Current profit: $${currentProfit.toFixed(2)}`,
      type: 'bot_progress_updated',
      metadata: {
        bot_trade_id: botTradeId,
        new_progress: validatedProgress,
        current_profit: currentProfit,
        admin_updated: true
      }
    })
    
    console.log('[updateBotProgress] Notification created')
    
    revalidatePath('/dashboard/bot-trading')
    console.log('[updateBotProgress] Bot progress update completed successfully')
    
    return { success: true, progress: validatedProgress, currentProfit }
  } catch (error: any) {
    console.error('[updateBotProgress] Error:', error)
    throw error
  }
}

async function getCurrentMarketPrice(symbol: string, category: 'stocks' | 'crypto' | 'forex'): Promise<number> {
  console.log('[getCurrentMarketPrice] Fetching price for', symbol, 'category:', category)
  
  const priceMap: Record<string, number> = {
    'BTC': 43250.00,
    'ETH': 2340.50,
    'BNB': 612.30,
    'AAPL': 182.45,
    'MSFT': 378.91,
    'GOOGL': 139.50,
    'AMZN': 187.23,
    'TSLA': 242.18,
    'EURUSD': 1.0850,
    'GBPUSD': 1.2730,
    'JPYUSD': 0.0067,
  }
  
  const basePrice = priceMap[symbol] || 100
  const volatility = category === 'crypto' ? 0.05 : 0.02
  const randomChange = (Math.random() * 2 - 1) * volatility
  
  const finalPrice = basePrice * (1 + randomChange)
  console.log('[getCurrentMarketPrice] Price for', symbol, ':', basePrice, '±', (volatility * 100).toFixed(0) + '% =', finalPrice.toFixed(2))
  
  return finalPrice
}

// Function to check and auto-complete expired bots (to be called by cron job)
export async function autoCompleteExpiredBots() {
  console.log('[autoCompleteExpiredBots] Starting auto-complete job')
  
  try {
    const supabase = await createClient()
    
    // Get all running bots that have expired (endDate passed)
    const now = new Date().toISOString()
    
    console.log('[autoCompleteExpiredBots] Checking for expired bots as of:', now)
    
    const { data: expiredBots, error } = await supabase
      .from('bot_trades')
      .select('*')
      .eq('status', 'running')
      .lt('metadata->>endDate', now)
    
    if (error) {
      console.error('[autoCompleteExpiredBots] Error fetching expired bots:', error)
      return
    }
    
    console.log('[autoCompleteExpiredBots] Found', expiredBots?.length || 0, 'expired bots')
    
    // Complete each expired bot
    for (const bot of expiredBots || []) {
      try {
        console.log('[autoCompleteExpiredBots] Auto-completing bot:', bot.id, bot.symbol)
        await stopBotTrade(bot.id)
        console.log(`[autoCompleteExpiredBots] Auto-completed expired bot: ${bot.id}`)
      } catch (botError) {
        console.error(`[autoCompleteExpiredBots] Error auto-completing bot ${bot.id}:`, botError)
      }
    }
    
    console.log('[autoCompleteExpiredBots] Auto-complete job completed')
    
    revalidatePath('/dashboard/bot-trading')
  } catch (error) {
    console.error('[autoCompleteExpiredBots] Auto-complete expired bots error:', error)
  }
}