"use client"

import { SchoolTable } from "@/components/schools/school-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function SchoolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schools</h1>
        <Link href="/dashboard/schools/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>
      <SchoolTable />
    </div>
  )
}

