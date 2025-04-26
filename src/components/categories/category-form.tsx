"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  color: z.string().default("#6366f1"),
  icon: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  category: any
}

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: "#6366f1",
      icon: "",
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color,
        icon: category.icon || "",
      })
    } else {
      form.reset({
        name: "",
        color: "#6366f1",
        icon: "",
      })
    }
  }, [category, form])

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const url = category?._id ? `/api/categories/${category._id}` : "/api/categories"
      const method = category?._id ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        toast.success(category?._id ? "Category updated!" : "Category added!")
        onClose()
        window.location.reload()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to save category")
      }
    } catch {
      toast.error("Failed to save category")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category?._id ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category?._id ? "Update this category" : "Create a new category"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (emoji or text)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 🛒" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{category?._id ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
