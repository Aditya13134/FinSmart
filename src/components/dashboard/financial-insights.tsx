"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, AlertCircle, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FinancialInsightsProps {
  analytics: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    expensesByCategory: Record<string, number>
  }
  previousMonthData?: {
    totalIncome: number
    totalExpenses: number
    netSavings: number
  }
  isLoading: boolean
}

export function FinancialInsights({ 
  analytics, 
  previousMonthData,
  isLoading 
}: FinancialInsightsProps) {
  const [activeTab, setActiveTab] = useState("spending")
  
  // Calculate month-over-month changes if previous month data is available
  const incomeChange = previousMonthData 
    ? ((analytics.totalIncome - previousMonthData.totalIncome) / previousMonthData.totalIncome) * 100 
    : 0
  
  const expenseChange = previousMonthData 
    ? ((analytics.totalExpenses - previousMonthData.totalExpenses) / previousMonthData.totalExpenses) * 100 
    : 0
  
  const savingsChange = previousMonthData 
    ? ((analytics.netSavings - previousMonthData.netSavings) / (previousMonthData.netSavings || 1)) * 100 
    : 0
  
  // Identify top spending categories
  const topCategories = Object.entries(analytics.expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  // Calculate savings rate
  const savingsRate = analytics.totalIncome > 0 
    ? (analytics.netSavings / analytics.totalIncome) * 100 
    : 0
  
  // Generate insights based on financial data
  const generateInsights = () => {
    const insights = []
    
    // Savings insights
    if (savingsRate < 20) {
      insights.push({
        type: "warning",
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
        text: "Your savings rate is below 20%. Consider reducing non-essential expenses."
      })
    } else if (savingsRate >= 30) {
      insights.push({
        type: "positive",
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: "Great job! Your savings rate is above 30%."
      })
    }
    
    // Expense insights
    if (expenseChange > 15) {
      insights.push({
        type: "warning",
        icon: <TrendingUp className="h-4 w-4 text-red-500" />,
        text: "Your expenses increased by more than 15% compared to last month."
      })
    } else if (expenseChange < -10) {
      insights.push({
        type: "positive",
        icon: <TrendingDown className="h-4 w-4 text-green-500" />,
        text: "You've reduced your expenses by more than 10% since last month!"
      })
    }
    
    // Income insights
    if (incomeChange > 10) {
      insights.push({
        type: "positive",
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: "Your income increased by more than 10% compared to last month."
      })
    }
    
    // If no insights, add a default one
    if (insights.length === 0) {
      insights.push({
        type: "info",
        icon: <Info className="h-4 w-4 text-blue-500" />,
        text: "Track your finances consistently to get personalized insights."
      })
    }
    
    return insights
  }
  
  const insights = generateInsights()
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Insights</CardTitle>
        <CardDescription>
          Smart analysis of your financial data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="top-spending">Top Spending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                Loading insights...
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      insight.type === "warning" 
                        ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" 
                        : insight.type === "positive"
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="mt-0.5">{insight.icon}</div>
                    <div className="text-sm">{insight.text}</div>
                  </motion.div>
                ))}
                
                {/* Month-over-month changes */}
                {previousMonthData && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className={`text-sm font-medium ${incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Income</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className={`text-sm font-medium ${expenseChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Expenses</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className={`text-sm font-medium ${savingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {savingsChange >= 0 ? '+' : ''}{savingsChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Savings</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top-spending">
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                Loading top spending...
              </div>
            ) : topCategories.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your top spending categories this month:</p>
                {topCategories.map(([category, amount], index) => (
                  <motion.div 
                    key={category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="font-medium">{category}</div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((amount / analytics.totalExpenses) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Categories
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No spending data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
