"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight, Trash2, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ITransaction } from "@/models/transaction"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/transactions")
        
        if (response.ok) {
          const data = await response.json()
          // Only show the 5 most recent transactions
          setTransactions(data.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTransactions((prev) => 
          prev.filter((t) => t._id !== selectedTransaction._id)
        )
        setIsDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your latest 5 financial transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            Loading...
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-8">
            <AnimatePresence>
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id || index}
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category || "Uncategorized"} • {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          // This would navigate to edit transaction page
                          console.log("Edit transaction:", transaction)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p>No transactions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                // This would navigate to add transaction page
                console.log("Navigate to add transaction")
              }}
            >
              Add your first transaction
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
