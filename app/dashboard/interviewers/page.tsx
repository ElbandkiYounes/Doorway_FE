"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { InterviewerTable } from "@/components/interviewers/interviewer-table"
import { InterviewerFilters } from "@/components/interviewers/interviewer-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function InterviewersPage() {
  const [filters, setFilters] = useState({ searchTerm: "", role: "all" })
  const searchParams = useSearchParams()
  const defaultSelectedInterviewerId = searchParams.get("popUpId") || null

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interviewers</h1>
        <Link href="/dashboard/interviewers/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Interviewer
          </Button>
        </Link>
      </div>
      <InterviewerFilters onFilterChange={handleFilterChange} />
      <InterviewerTable filters={filters} defaultSelectedInterviewerId={defaultSelectedInterviewerId} />
    </div>
  )
}

