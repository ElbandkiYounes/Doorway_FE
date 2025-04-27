"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/placeholder-logo.svg" alt="Logo" className="h-8" />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

