"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionForm } from "@/components/transactions/transaction-form"

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={handleAddTransaction} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </motion.div>
      </div>

      <TransactionList onEdit={handleEditTransaction} />

      <TransactionForm 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        transaction={editingTransaction}
      />
    </div>
  )
}
