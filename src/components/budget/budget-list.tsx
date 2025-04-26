"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BudgetListProps {
  monthYear: { month: number; year: number }
  onEdit: (budget: any) => void
}

export function BudgetList({ monthYear, onEdit }: BudgetListProps) {
  const [budgets, setBudgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingBudget, setDeletingBudget] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Function to handle budget deletion
  const handleDeleteBudget = async () => {
    if (!deletingBudget) return
    
    try {
      console.log('Deleting budget:', deletingBudget)
      const budgetId = deletingBudget.id || deletingBudget._id
      const res = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('Budget deleted successfully')
        // Remove the deleted budget from the state
        setBudgets(budgets.filter(b => {
          const currentId = b.id || b._id
          const deletedId = deletingBudget.id || deletingBudget._id
          return currentId !== deletedId
        }))
      } else {
        toast.error('Failed to delete budget')
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    } finally {
      setDeletingBudget(null)
      setIsDeleteDialogOpen(false)
    }
  }
  
  // Function to open delete confirmation dialog
  const openDeleteDialog = (budget: any) => {
    setDeletingBudget(budget)
    setIsDeleteDialogOpen(true)
  }

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching budgets for', monthYear)
        const res = await fetch(`/api/budgets?month=${monthYear.month}&year=${monthYear.year}`)
        if (res.ok) {
          const data = await res.json()
          console.log('Budgets response:', data)
          
          // Handle both formats: direct array or { budgets: [...] }
          const budgetData = Array.isArray(data) ? data : data.budgets || []
          console.log('Processed budget data:', budgetData)
          
          setBudgets(budgetData)
        } else {
          console.error('Failed to fetch budgets:', res.status)
          toast.error("Failed to load budgets")
        }
      } catch (e) {
        console.error('Error fetching budgets:', e)
        toast.error("Failed to load budgets")
      } finally {
        setIsLoading(false)
      }
    }
    fetchBudgets()
  }, [monthYear])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">Loading...</div>
        ) : budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div 
                key={budget.id || budget._id} 
                className="flex flex-row items-center justify-between border p-3 rounded-lg"
                style={{ borderLeft: `4px solid ${budget.color || '#6366f1'}` }}
              >
                <div>
                  <div className="font-semibold">{budget.category}</div>
                  <div className="text-sm text-muted-foreground">
                    Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.amount)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(budget)} title="Edit budget">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openDeleteDialog(budget)} className="text-red-500 hover:text-red-700" title="Delete budget">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No budgets set for this month.
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the budget for "{deletingBudget?.category}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBudget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
