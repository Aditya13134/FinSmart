"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function SettingsPage() {
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date()
    return { month: today.getMonth() + 1, year: today.getFullYear() }
  })
  const [budget, setBudget] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchBudget = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/settings/global-budget?month=${monthYear.month}&year=${monthYear.year}`)
      if (res.ok) {
        const data = await res.json()
        setBudget(data.amount || null)
        setInputValue(data.amount ? String(data.amount) : "")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudget()
    // eslint-disable-next-line
  }, [monthYear])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/settings/global-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(inputValue), month: monthYear.month, year: monthYear.year }),
      })
      if (res.ok) {
        toast.success("Monthly budget updated!")
        fetchBudget()
      } else {
        toast.error("Failed to update budget")
      }
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Set your total monthly budget
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent>
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
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="Enter budget..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="max-w-[200px]"
              disabled={loading}
            />
            <Button onClick={handleSave} disabled={loading || !inputValue}>
              Save
            </Button>
          </div>
          {budget !== null && (
            <div className="mt-2 text-muted-foreground text-sm">
              Current budget: <b>${budget}</b>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
