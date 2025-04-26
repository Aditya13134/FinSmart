"use client"

import { useEffect, useState } from "react"
import { format, subMonths } from "date-fns"
import { ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank, Calendar, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { BudgetSummary } from "@/components/dashboard/budget-summary"
import { FinancialInsights } from "@/components/dashboard/financial-insights"
import { SpendingTrends } from "@/components/dashboard/spending-trends"

interface Analytics {
  totalIncome: number
  currentMonthIncome: number
  totalExpenses: number
  netSavings: number
  currentBalance: number
  prevMonthBalance: number
  transactionCount: number
  expensesByCategory: Record<string, number>
  budgetComparison: Array<{
    category: string
    budgeted: number
    actual: number
    remaining: number
    percentage: number
  }>
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthYear, setMonthYear] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  })
  const [analytics, setAnalytics] = useState<Analytics>({
    totalIncome: 0,
    currentMonthIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    currentBalance: 0,
    prevMonthBalance: 0,
    transactionCount: 0,
    expensesByCategory: {},
    budgetComparison: [],
  })
  const [previousMonthData, setPreviousMonthData] = useState<{
    totalIncome: number
    currentMonthIncome: number
    totalExpenses: number
    netSavings: number
    currentBalance: number
    prevMonthBalance: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setIsRefreshing(true)
        
        // Fetch current month data
        const response = await fetch(
          `/api/analytics?month=${monthYear.month}&year=${monthYear.year}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
        
        // Calculate previous month
        const prevDate = subMonths(new Date(monthYear.year, monthYear.month - 1, 1), 1)
        const prevMonth = prevDate.getMonth() + 1
        const prevYear = prevDate.getFullYear()
        
        // Fetch previous month data for comparison
        const prevResponse = await fetch(
          `/api/analytics?month=${prevMonth}&year=${prevYear}`
        )
        
        if (prevResponse.ok) {
          const prevData = await prevResponse.json()
          setPreviousMonthData(prevData)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchAnalytics()
  }, [monthYear])

  const handleMonthChange = (month: number) => {
    let newMonth = month
    let newYear = monthYear.year

    if (month < 1) {
      newMonth = 12
      newYear = monthYear.year - 1
    } else if (month > 12) {
      newMonth = 1
      newYear = monthYear.year + 1
    }

    setMonthYear({ month: newMonth, year: newYear })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => handleMonthChange(monthYear.month - 1)}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Previous month"
            >
              &lt;
            </button>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 opacity-70" />
              {format(new Date(monthYear.year, monthYear.month - 1), "MMMM yyyy")}
            </span>
            <button
              onClick={() => handleMonthChange(monthYear.month + 1)}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => {
              setMonthYear({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
              })
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : formatCurrency(analytics.totalIncome)}
              </div>
              <div className="flex flex-col mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Global monthly budget:</span>
                  <span className="text-xs font-medium">{isLoading ? "--" : formatCurrency(analytics.totalIncome - Math.max(0, analytics.prevMonthBalance))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Previous balance:</span>
                  <span className="text-xs">{isLoading ? "--" : formatCurrency(Math.max(0, analytics.prevMonthBalance))}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Global monthly budget + previous balance</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : formatCurrency(analytics.totalExpenses)}
              </div>
              <div className="flex flex-col mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Transaction count:</span>
                  <span className="text-xs">{isLoading ? "--" : analytics.transactionCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Compared to last month:</span>
                  <span className="text-xs">
                    {previousMonthData && !isLoading ? (
                      previousMonthData.totalExpenses > 0 ? (
                        analytics.totalExpenses > previousMonthData.totalExpenses ? (
                          <span className="text-red-500">
                            +{(((analytics.totalExpenses - previousMonthData.totalExpenses) / previousMonthData.totalExpenses) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-green-500">
                            -{(((previousMonthData.totalExpenses - analytics.totalExpenses) / previousMonthData.totalExpenses) * 100).toFixed(1)}%
                          </span>
                        )
                      ) : "No expenses last month"
                    ) : "--"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total debited from transactions</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Current Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Loading..." : formatCurrency(analytics.currentBalance)}
              </div>
              <div className="flex flex-col mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Global monthly budget:</span>
                  <span className="text-xs">{isLoading ? "--" : formatCurrency(analytics.totalIncome - Math.max(0, analytics.prevMonthBalance))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Allocated budgets:</span>
                  <span className="text-xs">{isLoading ? "--" : formatCurrency((analytics.totalIncome - Math.max(0, analytics.prevMonthBalance)) - analytics.currentBalance)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Available balance after budget allocations</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <BudgetSummary 
            monthYear={monthYear} 
            totalExpenses={analytics.totalExpenses} 
          />
        </motion.div>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recent">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <DashboardCharts 
            analytics={analytics} 
            isLoading={isLoading} 
            monthYear={monthYear}
          />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <SpendingTrends 
            monthYear={monthYear}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <FinancialInsights 
            analytics={analytics}
            previousMonthData={previousMonthData || undefined}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="recent">
          <RecentTransactions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
