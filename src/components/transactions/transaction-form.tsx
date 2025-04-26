"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ITransaction } from "@/models/transaction"
import { ICategory } from "@/models/category"

const transactionSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string(),
  category: z.string().optional(),
  type: z.enum(["income", "expense"]),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  transaction: ITransaction | null
}

export function TransactionForm({ isOpen, onClose, transaction }: TransactionFormProps) {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      type: "expense",
    },
  })

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (transaction) {
      form.reset({
        description: transaction.description,
        amount: transaction.amount,
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
        category: transaction.category || "",
        type: transaction.type,
      })
    } else {
      form.reset({
        description: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        category: "",
        type: "expense",
      })
    }
  }, [transaction, form])

  const onSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true)
    
    try {
      const formattedValues = {
        ...values,
        date: new Date(values.date),
      }
      
      const url = transaction?._id 
        ? `/api/transactions/${transaction._id}` 
        : "/api/transactions"
      
      const method = transaction?._id ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      })
      
      if (response.ok) {
        toast.success(
          transaction?._id 
            ? "Transaction updated successfully" 
            : "Transaction added successfully"
        )
        onClose()
        // Force a reload of transactions
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to save transaction")
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast.error("Failed to save transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction?._id ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {transaction?._id 
              ? "Update the details of your transaction" 
              : "Enter the details of your new transaction"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries, Salary, etc." {...field} />
                  </FormControl>
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
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize your transaction for better tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        className={`flex-1 ${field.value === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        onClick={() => field.onChange('expense')}
                      >
                        Debit (Expense)
                      </Button>
                      <Button
                        type="button"
                        className={`flex-1 ${field.value === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        onClick={() => field.onChange('income')}
                      >
                        Credit (Income)
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select whether this is money coming in (credit) or going out (debit)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : transaction?._id ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
