"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BudgetList } from "@/components/budget/budget-list"
import { BudgetForm } from "@/components/budget/budget-form"

export default function BudgetPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date()
    return { month: today.getMonth() + 1, year: today.getFullYear() }
  })

  const handleAddBudget = () => {
    setEditingBudget(null)
    setIsFormOpen(true)
  }

  const handleEditBudget = (budget) => {
    setEditingBudget(budget)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingBudget(null)
  }

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set and manage monthly budgets for each category
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleAddBudget} className="gap-2">
            <Plus className="h-4 w-4" />
            Set Budget
          </Button>
        </motion.div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => handleMonthChange(monthYear.month - 1)}
          className="p-2 rounded-full hover:bg-muted"
        >
          &lt;
        </button>
        <span className="font-medium">
          {format(new Date(monthYear.year, monthYear.month - 1), "MMMM yyyy")}
        </span>
        <button
          onClick={() => handleMonthChange(monthYear.month + 1)}
          className="p-2 rounded-full hover:bg-muted"
        >
          &gt;
        </button>
      </div>
      <BudgetList monthYear={monthYear} onEdit={handleEditBudget} />
      <BudgetForm 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        budget={editingBudget}
        monthYear={monthYear}
      />
    </div>
  )
}
