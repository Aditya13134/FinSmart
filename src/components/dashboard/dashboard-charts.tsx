"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface DashboardChartsProps {
  analytics: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    expensesByCategory: Record<string, number>
    budgetComparison: Array<{
      category: string
      budgeted: number
      actual: number
      remaining: number
      percentage: number
    }>
  }
  isLoading: boolean
  monthYear: {
    month: number
    year: number
  }
}

// Sample data for line chart (spending trend)
const generateTrendData = (month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const data = []
  
  let cumulativeAmount = 0
  for (let i = 1; i <= daysInMonth; i++) {
    // Random daily expense between 10 and 100
    const dailyExpense = Math.floor(Math.random() * 90) + 10
    cumulativeAmount += dailyExpense
    
    data.push({
      day: i,
      amount: cumulativeAmount,
    })
  }
  
  return data
}

export function DashboardCharts({ analytics, isLoading, monthYear }: DashboardChartsProps) {
  const [trendData] = useState(() => generateTrendData(monthYear.month, monthYear.year))
  const [budgetData, setBudgetData] = useState<Array<{ category: string, amount: number, color: string }>>([])  
  const [isBudgetLoading, setIsBudgetLoading] = useState(true)
  
  // Fetch budget data from the budget page
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setIsBudgetLoading(true)
        const response = await fetch(`/api/budgets?month=${monthYear.month}&year=${monthYear.year}`)
        
        if (response.ok) {
          const data = await response.json()
          setBudgetData(data.budgets || [])
        }
      } catch (error) {
        console.error('Error fetching budget data:', error)
      } finally {
        setIsBudgetLoading(false)
      }
    }
    
    fetchBudgetData()
  }, [monthYear])
  
  // Define the type for pie chart data
  interface PieChartDataItem {
    name: string;
    value: number;
    color?: string;
  }
  
  // Format category data for pie chart based on budget data
  const pieChartData: PieChartDataItem[] = budgetData.length > 0 
    ? budgetData.map(budget => ({
        name: budget.category,
        value: budget.amount,
        color: budget.color
      }))
    : Object.entries(analytics.expensesByCategory || {}).map(
        ([category, amount]) => ({
          name: category,
          value: amount,
        })
      )

  // Format budget comparison data for bar chart
  const budgetBarData = analytics.budgetComparison.map((item) => ({
    name: item.category,
    Budgeted: item.budgeted,
    Actual: item.actual,
  }))

  // Generate colors for pie chart
  const COLORS = [
    "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
    "#d0ed57", "#ffc658", "#ff8042", "#ff6361", "#bc5090",
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <motion.div 
        className="md:col-span-2 lg:col-span-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || isBudgetLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                Loading budget data...
              </div>
            ) : pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    animationDuration={1000}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(name) => `Category: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No budget data available. Please set up budgets in the Budget page.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="md:col-span-2 lg:col-span-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                Loading...
              </div>
            ) : budgetBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={budgetBarData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Budgeted" fill="#8884d8" animationDuration={1000} />
                  <Bar dataKey="Actual" fill="#82ca9d" animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No budget data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="md:col-span-2 lg:col-span-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={trendData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
