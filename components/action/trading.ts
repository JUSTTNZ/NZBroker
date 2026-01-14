// app/actions/manual-trading.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TradeOrder {
  symbol: string;
  category: 'stocks' | 'crypto' | 'forex';
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  price?: number; // For limit orders
  amount: number;
  stopLoss?: number;
  takeProfit?: number;
}

async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function executeTrade(order: TradeOrder) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    // Get user profile and current wallet
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      throw new Error('User profile not found')
    }
    
    // Get current wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    if (!wallet) {
      throw new Error('Wallet not found')
    }
    
    // Validate sufficient balance for buy orders
    if (order.side === 'buy' && order.amount > wallet.trading_balance) {
      throw new Error(`Insufficient trading balance. Available: $${wallet.trading_balance.toFixed(2)}`)
    }
    
    // For sell orders, we need to check if user has the position
    // (In a real app, you'd check existing positions here)
    
    // Get current market price
    const currentPrice = await getCurrentMarketPrice(order.symbol, order.category)
    const executionPrice = order.orderType === 'market' ? currentPrice : (order.price || currentPrice)
    
    // Calculate actual amount (price * quantity)
    const actualAmount = executionPrice * order.quantity
    
    // Execute the trade
    const { data: trade, error: tradeError } = await supabase
      .from('manual_trades')
      .insert({
        user_id: user.id,
        account_type: profile.account_type,
        symbol: order.symbol,
        category: order.category,
        side: order.side,
        order_type: order.orderType,
        quantity: order.quantity,
        entry_price: executionPrice,
        current_price: executionPrice,
        amount: actualAmount,
        status: 'filled',
        stop_loss: order.stopLoss,
        take_profit: order.takeProfit,
        metadata: {
          estimated_amount: order.amount,
          market_price_at_order: currentPrice
        }
      })
      .select()
      .single()
      
    if (tradeError) {
      throw new Error(`Failed to execute trade: ${tradeError.message}`)
    }
    
    // Update wallet balances
    let newTradingBalance = wallet.trading_balance
    let newTotalBalance = wallet.total_balance
    
    if (order.side === 'buy') {
      // Deduct from trading balance
      newTradingBalance = wallet.trading_balance - actualAmount
    } else {
      // Add to trading balance for sell orders
      newTradingBalance = wallet.trading_balance + actualAmount
      // Also add profit to total balance
      newTotalBalance = wallet.total_balance + actualAmount
    }
    
    // Update wallet
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({
        trading_balance: newTradingBalance,
        total_balance: newTotalBalance
      })
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
    
    if (balanceError) {
      // Rollback trade if balance update fails
      await supabase.from('manual_trades').delete().eq('id', trade.id)
      throw new Error(`Failed to update balances: ${balanceError.message}`)
    }
    
    // Create transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_type: profile.account_type,
      type: order.side === 'buy' ? 'trade_buy' : 'trade_sell',
      amount: order.side === 'buy' ? -actualAmount : actualAmount,
      description: `${order.side.toUpperCase()} ${order.quantity} ${order.symbol} @ $${executionPrice.toFixed(2)}`,
      status: 'completed',
      reference_id: `TRADE_${trade.id}`,
      metadata: {
        trade_id: trade.id,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice
      }
    })
    
    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: `Trade ${order.side === 'buy' ? 'Buy' : 'Sell'} Executed`,
      message: `${order.side === 'buy' ? 'Bought' : 'Sold'} ${order.quantity} ${order.symbol} at $${executionPrice.toFixed(2)}`,
      type: 'trade_executed',
      metadata: {
        symbol: order.symbol,
        side: order.side,
        amount: actualAmount,
        new_trading_balance: newTradingBalance
      }
    })
    
    revalidatePath('/dashboard/trading')
    return { 
      success: true, 
      trade, 
      executionPrice,
      newTradingBalance,
      newTotalBalance
    }
  } catch (error: any) {
    console.error('Execute trade failed:', error)
    throw error
  }
}

export async function getOpenTrades() {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    const { data: trades, error } = await supabase
      .from('manual_trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Get open trades error:', error)
      return []
    }
    
    // Update with current prices
    const updatedTrades = await Promise.all(
      (trades || []).map(async (trade) => {
        try {
          const currentPrice = await getCurrentMarketPrice(trade.symbol, trade.category)
          const profitLoss = trade.side === 'buy' 
            ? (currentPrice - trade.entry_price) * trade.quantity
            : (trade.entry_price - currentPrice) * trade.quantity
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
    
    return updatedTrades
  } catch (error: any) {
    console.error('Get open trades failed:', error)
    return []
  }
}

export async function closeTrade(tradeId: string, quantity?: number) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    // Get trade details
    const { data: trade, error: fetchError } = await supabase
      .from('manual_trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()
      
    if (fetchError || !trade) {
      throw new Error('Trade not found')
    }
    
    if (trade.status !== 'open') {
      throw new Error('Trade is already closed')
    }
    
    // Get current market price
    const currentPrice = await getCurrentMarketPrice(trade.symbol, trade.category)
    
    // Calculate profit/loss
    const closeQuantity = quantity || trade.quantity
    const profitLoss = trade.side === 'buy' 
      ? (currentPrice - trade.entry_price) * closeQuantity
      : (trade.entry_price - currentPrice) * closeQuantity
    const profitLossPercent = ((currentPrice - trade.entry_price) / trade.entry_price) * 100
    
    // Update trade status
    const updateData: any = {
      status: closeQuantity === trade.quantity ? 'closed' : 'partially_closed',
      exit_price: currentPrice,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      closed_at: new Date().toISOString()
    }
    
    if (closeQuantity < trade.quantity) {
      updateData.quantity = trade.quantity - closeQuantity
    }
    
    const { error: updateError } = await supabase
      .from('manual_trades')
      .update(updateData)
      .eq('id', tradeId)
      
    if (updateError) {
      throw new Error('Failed to close trade')
    }
    
    // Get current wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('trading_balance, total_balance')
      .eq('user_id', user.id)
      .eq('account_type', trade.account_type)
      .single()
    
    if (!wallet) {
      throw new Error('Wallet not found')
    }
    
    // Update wallet balances
    const closeAmount = currentPrice * closeQuantity
    const newTradingBalance = wallet.trading_balance + closeAmount
    const newTotalBalance = wallet.total_balance + Math.max(profitLoss, 0)
    
    const { error: balanceError } = await supabase
      .from('wallets')
      .update({
        trading_balance: newTradingBalance,
        total_balance: newTotalBalance
      })
      .eq('user_id', user.id)
      .eq('account_type', trade.account_type)
    
    if (balanceError) {
      throw new Error(`Failed to update balances: ${balanceError.message}`)
    }
    
    // Create transaction
    const transactionType = profitLoss >= 0 ? 'trade_profit' : 'trade_loss'
    await supabase.from('transactions').insert({
      user_id: user.id,
      account_type: trade.account_type,
      type: transactionType,
      amount: profitLoss,
      description: `Closed ${closeQuantity} ${trade.symbol} at $${currentPrice.toFixed(2)}`,
      status: 'completed',
      reference_id: `CLOSE_${tradeId}`,
      metadata: {
        trade_id: tradeId,
        symbol: trade.symbol,
        side: trade.side,
        quantity: closeQuantity,
        entry_price: trade.entry_price,
        exit_price: currentPrice
      }
    })
    
    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Trade Closed',
      message: `Closed ${closeQuantity} ${trade.symbol} at $${currentPrice.toFixed(2)}. ${profitLoss >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profitLoss).toFixed(2)}`,
      type: profitLoss >= 0 ? 'profit' : 'loss',
      metadata: {
        symbol: trade.symbol,
        profit_loss: profitLoss,
        new_trading_balance: newTradingBalance
      }
    })
    
    revalidatePath('/dashboard/trading')
    return { 
      success: true, 
      profitLoss, 
      profitLossPercent,
      newTradingBalance,
      newTotalBalance
    }
  } catch (error: any) {
    console.error('Close trade failed:', error)
    throw error
  }
}

export async function getTradingBalance() {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      return 0
    }
    
    const { data: wallet } = await supabase
      .from('wallets')
      .select('trading_balance')
      .eq('user_id', user.id)
      .eq('account_type', profile.account_type)
      .single()
      
    return wallet?.trading_balance || 0
  } catch (error: any) {
    console.error('Get trading balance failed:', error)
    return 0
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