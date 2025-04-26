"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CategoryList } from "@/components/categories/category-list"
import { CategoryForm } from "@/components/categories/category-form"

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEditCategory = (cat) => {
    setEditingCategory(cat)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </motion.div>
      </div>
      <CategoryList onEdit={handleEditCategory} />
      <CategoryForm isOpen={isFormOpen} onClose={handleFormClose} category={editingCategory} />
    </div>
  )
}
