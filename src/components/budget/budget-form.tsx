"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  budget: any
  monthYear: { month: number; year: number }
}

export function BudgetForm({ isOpen, onClose, budget, monthYear }: BudgetFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...')
        const res = await fetch("/api/categories")
        if (res.ok) {
          const data = await res.json()
          console.log('Categories fetched:', data)
          
          // Create some default categories if none exist
          if (!data || data.length === 0) {
            console.log('No categories found, creating defaults')
            const defaultCategories = [
              { _id: 'food', name: 'Food & Dining' },
              { _id: 'transport', name: 'Transportation' },
              { _id: 'housing', name: 'Housing' },
              { _id: 'utilities', name: 'Utilities' },
              { _id: 'entertainment', name: 'Entertainment' },
              { _id: 'health', name: 'Healthcare' },
            ]
            setCategories(defaultCategories)
          } else {
            setCategories(data)
          }
        } else {
          console.error('Failed to fetch categories:', res.status)
          // Set default categories as fallback
          setCategories([
            { _id: 'food', name: 'Food & Dining' },
            { _id: 'transport', name: 'Transportation' },
            { _id: 'housing', name: 'Housing' },
          ])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Set default categories as fallback
        setCategories([
          { _id: 'food', name: 'Food & Dining' },
          { _id: 'transport', name: 'Transportation' },
          { _id: 'housing', name: 'Housing' },
        ])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        console.log('Editing budget:', budget)
        // For editing, use the budget's category ID
        form.reset({
          category: budget.id || budget._id,
          amount: budget.amount,
        })
      } else {
        console.log('Creating new budget')
        form.reset({
          category: categories.length > 0 ? categories[0]._id : "",
          amount: 0,
        })
      }
    }
  }, [budget, form, isOpen, categories])

  const onSubmit = async (values: BudgetFormValues) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting budget with values:', values)
      const payload = {
        category: values.category, // This is the category ID
        amount: values.amount,
        month: monthYear.month,
        year: monthYear.year,
      }
      
      // Determine if this is an update or a new budget
      const isUpdate = !!budget;
      const url = isUpdate 
        ? `/api/budgets/${budget.id || budget._id}` 
        : "/api/budgets";
      const method = isUpdate ? "PUT" : "POST";
      
      console.log(`${isUpdate ? 'Updating' : 'Creating'} budget:`, payload)
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("Budget saved!")
        onClose()
        window.location.reload()
      } else {
        // Try to get the error message from the response
        try {
          const errorData = await res.json();
          // Safely handle the error data
          const errorMessage = errorData && typeof errorData === 'object' && errorData.error
            ? errorData.error
            : "Failed to save budget";
          toast.error(errorMessage);
        } catch (e) {
          console.error('Error parsing error response:', e);
          toast.error("Failed to save budget");
        }
      }
    } catch {
      toast.error("Failed to save budget")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Set Budget"}</DialogTitle>
          <DialogDescription>
            Set a monthly budget for a category
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''} 
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : budget ? "Update" : "Set"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
