"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, CreditCard, PieChart, Settings, Menu, X } from "lucide-react"

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

import { useState, useRef, useEffect } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between relative">
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
        {/* Desktop nav */}
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

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-0 w-full bg-background border-b z-50 shadow-md md:hidden animate-fade-in"
          >
            <nav className="flex flex-col items-start p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center text-base font-medium transition-colors hover:text-primary w-full py-2",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <div className="flex items-center space-x-4 md:space-x-4">
          <ThemeToggle />
          {/* Mobile hamburger - moved after ThemeToggle and aligned right */}
          <div className="md:hidden flex items-center ml-2">
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-16 left-0 w-full bg-background border-b z-50 shadow-md md:hidden animate-fade-in"
        >
          <nav className="flex flex-col items-start p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center text-base font-medium transition-colors hover:text-primary w-full py-2",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
