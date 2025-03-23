"use client"

import { useState } from "react"
import { IntervieweeTable } from "@/components/interviewees/interviewee-table"
import { IntervieweeFilters } from "@/components/interviewees/interviewee-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function IntervieweesPage() {
  const [filters, setFilters] = useState({ searchTerm: "", status: "", school: "" })

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interviewees</h1>
        <Link href="/dashboard/interviewees/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Interviewee
          </Button>
        </Link>
      </div>
      <IntervieweeFilters onFilterChange={handleFilterChange} />
      <IntervieweeTable filters={filters} />
    </div>
  )
}

