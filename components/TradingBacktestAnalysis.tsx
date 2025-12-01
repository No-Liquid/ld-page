'use client'

import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const TradingBacktestAnalysis = () => {
  const [activeTab, setActiveTab] = useState('chart')
  
  // Raw data
  const monthlyData = [
    { month: 'Dec 24', pnl: 427.00, date: '2024-12' },
    { month: 'Jan 25', pnl: 1006.71, date: '2025-01' },
    { month: 'Feb 25', pnl: -2188.04, date: '2025-02' },
    { month: 'Mar 25', pnl: 339.87, date: '2025-03' },
    { month: 'Apr 25', pnl: 348.81, date: '2025-04' },
    { month: 'May 25', pnl: 246.50, date: '2025-05' },
    { month: 'Jun 25', pnl: 395.53, date: '2025-06' },
    { month: 'Jul 25', pnl: 170.87, date: '2025-07' },
    { month: 'Aug 25', pnl: -155.92, date: '2025-08' },
    { month: 'Sep 25', pnl: 608.02, date: '2025-09' },
    { month: 'Oct 25', pnl: 1082.75, date: '2025-10' },
    { month: 'Nov 25', pnl: -2816.23, date: '2025-11' },
  ]

  // Calculate equity curve (cumulative)
  let cumulative = 0
  const equityCurve = monthlyData.map(item => {
    cumulative += item.pnl
    return {
      ...item,
      cumulative: cumulative,
      drawdown: 0,
      drawdownValue: 0
    }
  })

  // Calculate drawdown
  let peak = 0
  equityCurve.forEach(item => {
    if (item.cumulative > peak) {
      peak = item.cumulative
    }
    item.drawdown = ((item.cumulative - peak) / Math.abs(peak || 1)) * 100
    item.drawdownValue = item.cumulative - peak
  })

  // Calculate backtest metrics
  const totalPnL = monthlyData.reduce((sum, item) => sum + item.pnl, 0)
  const winningMonths = monthlyData.filter(item => item.pnl > 0)
  const losingMonths = monthlyData.filter(item => item.pnl < 0)
  
  const winRate = (winningMonths.length / monthlyData.length) * 100
  const avgWin = winningMonths.reduce((sum, item) => sum + item.pnl, 0) / winningMonths.length
  const avgLoss = Math.abs(losingMonths.reduce((sum, item) => sum + item.pnl, 0) / losingMonths.length)
  const profitFactor = (winningMonths.reduce((sum, item) => sum + item.pnl, 0)) / 
                        Math.abs(losingMonths.reduce((sum, item) => sum + item.pnl, 0))
  
  const maxDrawdown = Math.min(...equityCurve.map(item => item.drawdownValue))
  const maxDrawdownPct = Math.min(...equityCurve.map(item => item.drawdown))
  
  const returns = monthlyData.map(item => item.pnl)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = avgReturn / stdDev

  const largestWin = Math.max(...monthlyData.map(item => item.pnl))
  const largestLoss = Math.min(...monthlyData.map(item => item.pnl))

  const stats = [
    { label: 'Total P&L', value: `$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: 'text-blue-600' },
    { label: 'Profit Factor', value: profitFactor.toFixed(2), color: profitFactor > 1 ? 'text-green-600' : 'text-red-600' },
    { label: 'Avg Win', value: `$${avgWin.toFixed(2)}`, color: 'text-green-600' },
    { label: 'Avg Loss', value: `$${avgLoss.toFixed(2)}`, color: 'text-red-600' },
    { label: 'Max Drawdown', value: `$${maxDrawdown.toFixed(2)}`, color: 'text-red-600' },
    { label: 'Max DD %', value: `${maxDrawdownPct.toFixed(2)}%`, color: 'text-red-600' },
    { label: 'Sharpe Ratio', value: sharpeRatio.toFixed(2), color: 'text-blue-600' },
    { label: 'Largest Win', value: `$${largestWin.toFixed(2)}`, color: 'text-green-600' },
    { label: 'Largest Loss', value: `$${largestLoss.toFixed(2)}`, color: 'text-red-600' },
    { label: 'Win Months', value: `${winningMonths.length}/${monthlyData.length}`, color: 'text-blue-600' },
    { label: 'Std Dev', value: `$${stdDev.toFixed(2)}`, color: 'text-gray-600' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 font-mono">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Trading Backtest Analysis</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 font-medium ${activeTab === 'chart' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Charts
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Statistics
        </button>
      </div>

      {activeTab === 'chart' && (
        <div className="space-y-6">
          {/* Equity Curve */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Equity Curve</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <YAxis style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <Tooltip 
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                  labelStyle={{ color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}
                  contentStyle={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="cumulative" stroke="#2563eb" strokeWidth={2} name="Cumulative Equity" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly P&L */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Monthly P&L</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <YAxis style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <Tooltip 
                  formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                  labelStyle={{ color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}
                  contentStyle={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <ReferenceLine y={0} stroke="#666" />
                <Bar dataKey="pnl" name="P&L">
                  {monthlyData.map((entry, index) => (
                    <rect key={`bar-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drawdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Drawdown (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <YAxis style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                  labelStyle={{ color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}
                  contentStyle={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <Line type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} name="Drawdown %" fill="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Backtest Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Metrics Explanation:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>Win Rate:</strong> Percentage of winning months vs total months</li>
              <li><strong>Profit Factor:</strong> Total profits / Total losses (good if &gt; 1)</li>
              <li><strong>Sharpe Ratio:</strong> Average return / Standard deviation (higher is better)</li>
              <li><strong>Max Drawdown:</strong> Largest peak-to-trough decline</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingBacktestAnalysis
