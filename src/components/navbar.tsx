"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, CreditCard, PieChart, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: PieChart,
  },
  {
    name: "Budget",
    href: "/budget",
    icon: Settings,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CreditCard className="h-6 w-6 text-primary" />
          </motion.div>
          <motion.span 
            className="text-xl font-bold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            FinSmart
          </motion.span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
