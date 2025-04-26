"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight, Trash2, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ITransaction } from "@/models/transaction"
import { toast } from "sonner"

interface TransactionListProps {
  onEdit: (transaction: ITransaction) => void
}

export function TransactionList({ onEdit }: TransactionListProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/transactions")
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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
        toast.success("Transaction deleted successfully")
      } else {
        toast.error("Failed to delete transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchLower))
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>All Transactions</CardTitle>
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[250px] ml-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id || index}
                  className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium leading-none">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category || "Uncategorized"} • {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                        onClick={() => onEdit(transaction)}
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
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <p>No transactions found</p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
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
