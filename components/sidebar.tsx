"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, UserCircle, Calendar, ClipboardList, Briefcase, School, LayoutDashboard, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/lib/auth-context"

// Définir les éléments de navigation avec une propriété adminOnly pour les routes que seul l'admin peut voir
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false, // Visible pour tous
  },
  {
    title: "Interviewees",
    href: "/dashboard/interviewees",
    icon: Users,
    adminOnly: false, // Visible pour tous
  },
  {
    title: "Interviewers",
    href: "/dashboard/interviewers",
    icon: UserCircle,
    adminOnly: true, // Seulement pour admin
  },
  {
    title: "Interviews",
    href: "/dashboard/interviews",
    icon: Calendar,
    adminOnly: false, // Visible pour tous
  },
  {
    title: "Questions",
    href: "/dashboard/questions",
    icon: ClipboardList,
    adminOnly: false, // Visible pour tous
  },
  {
    title: "Roles",
    href: "/dashboard/roles",
    icon: Briefcase,
    adminOnly: false, // Visible pour tous
  },
  {
    title: "Schools",
    href: "/dashboard/schools",
    icon: School,
    adminOnly: false, // Visible pour tous
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { isAdmin } = useAuth()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Filtrer les éléments de navigation selon le rôle
  const filteredNavItems = navItems.filter(item => {
    return isAdmin() || !item.adminOnly
  })

  // Fonction pour vérifier si un élément de navigation est actif
  const isNavItemActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true
    }
    return href !== '/dashboard' && pathname?.startsWith(href)
  }

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar}>
            <div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Doorway</h2>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1 p-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleSidebar}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                      isNavItemActive(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-grow border-r bg-background">
        <div className="flex items-center h-16 px-4 border-b">
          <h2 className="text-xl font-bold">Doorway</h2>
        </div>
        <div className="flex-grow flex flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  isNavItemActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

