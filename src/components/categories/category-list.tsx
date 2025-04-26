"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface CategoryListProps {
  onEdit: (cat: any) => void
}

export function CategoryList({ onEdit }: CategoryListProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/categories")
        if (res.ok) setCategories(await res.json())
      } catch {
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== id))
        toast.success("Category deleted!")
      } else {
        toast.error("Failed to delete category")
      }
    } catch {
      toast.error("Failed to delete category")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">Loading...</div>
        ) : categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat._id} className="flex flex-row items-center justify-between border p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: cat.color }}></div>
                  <div className="font-semibold">{cat.name}</div>
                  {cat.icon && <span className="ml-1">{cat.icon}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit category</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(cat._id)} disabled={deleteId === cat._id}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete category</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No categories found.</div>
        )}
      </CardContent>
    </Card>
  )
}
