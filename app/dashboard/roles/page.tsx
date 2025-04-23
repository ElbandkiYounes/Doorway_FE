"use client"

import { RoleTable } from "@/components/roles/role-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { RoleGuard } from "@/components/role-guard"

export default function RolesPage() {
  return (
    <RoleGuard adminOnly={true} fallbackPath="/dashboard/interviews">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Roles</h1>
          <Link href="/dashboard/roles/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </Link>
        </div>
        <RoleTable />
      </div>
    </RoleGuard>
  )
}

