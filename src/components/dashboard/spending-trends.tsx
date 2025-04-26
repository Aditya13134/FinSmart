"use client"

import { useState, useEffect } from "react"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface SpendingTrendsProps {
  monthYear: {
    month: number
    year: number
  }
  isLoading: boolean
}

export function SpendingTrends({ monthYear, isLoading }: SpendingTrendsProps) {
  const [activeTab, setActiveTab] = useState("daily")
  const [trendData, setTrendData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [categoryTrends, setCategoryTrends] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchTrendData = async () => {
      setDataLoading(true)
      try {
        // In a real app, fetch this data from an API endpoint
        // For now, we'll generate sample data
        generateSampleData()
      } catch (error) {
        console.error("Error fetching trend data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchTrendData()
  }, [monthYear])

  const generateSampleData = () => {
    // Generate daily data for the current month
    const daysInMonth = new Date(monthYear.year, monthYear.month, 0).getDate()
    const dailyData = []
    
    // Sample categories
    const categories = ["Groceries", "Dining", "Entertainment", "Utilities", "Transport"]
    const categoryColors = {
      "Groceries": "#8884d8",
      "Dining": "#82ca9d",
      "Entertainment": "#ffc658",
      "Utilities": "#ff8042",
      "Transport": "#0088fe"
    }
    
    // Generate daily spending data
    let cumulativeExpense = 0
    let cumulativeIncome = 0
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(monthYear.year, monthYear.month - 1, i)
      const dayExpense = Math.floor(Math.random() * 80) + 20 // Random expense between 20 and 100
      const dayIncome = i % 15 === 0 ? Math.floor(Math.random() * 1000) + 1000 : 0 // Income on 1st and 15th
      
      cumulativeExpense += dayExpense
      cumulativeIncome += dayIncome
      
      dailyData.push({
        date: format(date, "MMM dd"),
        expense: dayExpense,
        income: dayIncome,
        cumulative: cumulativeExpense,
        balance: cumulativeIncome - cumulativeExpense
      })
    }
    
    // Generate weekly data
    const weeklyData = []
    for (let i = 0; i < 4; i++) {
      const weekExpense = Math.floor(Math.random() * 300) + 200
      const weekIncome = i === 0 || i === 2 ? Math.floor(Math.random() * 1000) + 1000 : 0
      
      weeklyData.push({
        week: `Week ${i + 1}`,
        expense: weekExpense,
        income: weekIncome,
        balance: weekIncome - weekExpense
      })
    }
    
    // Generate category trends
    const categoryData = []
    for (let i = 0; i < daysInMonth; i += 3) { // Sample every 3 days for cleaner chart
      const date = new Date(monthYear.year, monthYear.month - 1, i + 1)
      const dataPoint: any = {
        date: format(date, "MMM dd")
      }
      
      categories.forEach(category => {
        dataPoint[category] = Math.floor(Math.random() * 50) + 10
      })
      
      categoryData.push(dataPoint)
    }
    
    setTrendData(dailyData)
    setWeeklyData(weeklyData)
    setCategoryTrends(categoryData)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
        <CardDescription>
          Track your spending patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            {isLoading || dataLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                Loading trend data...
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => {
                          // Show only every 5th date to avoid overcrowding
                          const index = trendData.findIndex(item => item.date === value)
                          return index % 5 === 0 ? value : ''
                        }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="Daily Expense"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                        activeDot={{ r: 8 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name="Balance"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="weekly">
            {isLoading || dataLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                Loading weekly data...
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weeklyData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="Weekly Expense"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Weekly Income"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="categories">
            {isLoading || dataLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                Loading category data...
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={categoryTrends}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Groceries"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="Dining" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="Entertainment" stroke="#ffc658" />
                      <Line type="monotone" dataKey="Utilities" stroke="#ff8042" />
                      <Line type="monotone" dataKey="Transport" stroke="#0088fe" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
