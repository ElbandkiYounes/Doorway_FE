"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  UserPlus,
  Calendar,
  Timer,
  Building2,
  School2,
  HelpCircle,
  Settings,
} from "lucide-react"
import { Role } from "@/lib/api-service"
import { RoleBasedUI } from "@/components/role-based-ui"

const adminLinks = [
  {
    title: "Interviewers",
    href: "/dashboard/interviewers",
    icon: Users,
  },
  {
    title: "Interviewees",
    href: "/dashboard/interviewees",
    icon: UserPlus,
  },
  {
    title: "Interviews",
    href: "/dashboard/interviews",
    icon: Calendar,
  },
  {
    title: "Questions",
    href: "/dashboard/questions",
    icon: HelpCircle,
  },
  {
    title: "Roles",
    href: "/dashboard/roles",
    icon: Building2,
  },
  {
    title: "Schools",
    href: "/dashboard/schools",
    icon: School2,
  },
]

const interviewerLinks = [
  {
    title: "My Interviews",
    href: "/dashboard/interviews",
    icon: Calendar,
  },
  {
    title: "Questions",
    href: "/dashboard/questions",
    icon: HelpCircle,
  },
]

const intervieweeLinks = [
  {
    title: "My Interviews",
    href: "/dashboard/interviews",
    icon: Calendar,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-4 p-4">
      <RoleBasedUI roles={[Role.ADMIN]}>
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(link.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.title}
          </Link>
        ))}
      </RoleBasedUI>

      <RoleBasedUI roles={[Role.INTERVIEWER]}>
        {interviewerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(link.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.title}
          </Link>
        ))}
      </RoleBasedUI>

      <RoleBasedUI roles={[Role.INTERVIEWEE]}>
        {intervieweeLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(link.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.title}
          </Link>
        ))}
      </RoleBasedUI>
    </nav>
  )
}

