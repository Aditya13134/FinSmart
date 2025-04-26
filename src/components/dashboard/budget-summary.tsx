"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Edit2 } from "lucide-react"

interface BudgetSummaryProps {
  monthYear: {
    month: number
    year: number
  }
  totalExpenses: number
}

export function BudgetSummary({ monthYear, totalExpenses }: BudgetSummaryProps) {
  const [globalBudget, setGlobalBudget] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchGlobalBudget = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/settings/global-budget?month=${monthYear.month}&year=${monthYear.year}`)
      if (res.ok) {
        const data = await res.json()
        setGlobalBudget(data.amount || null)
      }
    } catch (error) {
      console.error("Error fetching global budget:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalBudget()
  }, [monthYear])

  const handleSave = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/settings/global-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Number(inputValue), 
          month: monthYear.month, 
          year: monthYear.year 
        }),
      })
      
      if (res.ok) {
        toast.success("Monthly budget updated!")
        setGlobalBudget(Number(inputValue))
        setIsEditing(false)
      } else {
        toast.error("Failed to update budget")
      }
    } catch (error) {
      toast.error("Failed to update budget")
      console.error("Error saving budget:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setInputValue(globalBudget ? String(globalBudget) : "")
    setIsEditing(true)
  }

  const calculatePercentage = () => {
    if (!globalBudget) return 0
    return Math.min(100, Math.round((totalExpenses / globalBudget) * 100))
  }

  const percentage = calculatePercentage()
  const remaining = globalBudget ? globalBudget - totalExpenses : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Monthly Budget</CardTitle>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEdit}
            disabled={loading}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit budget</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter budget amount"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={loading || !inputValue}
              >
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-2">Loading...</div>
        ) : globalBudget ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Budget:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(globalBudget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Spent:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(remaining)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <motion.div 
                className={`h-2.5 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${percentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-right mt-1">
              {percentage}% of budget used
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground mb-2">No monthly budget set</p>
            <Button size="sm" onClick={handleEdit}>Set Budget</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
