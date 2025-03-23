import { InterviewTable } from "@/components/interviews/interview-table"
import { InterviewFilters } from "@/components/interviews/interview-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <Link href="/dashboard/interviews/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </Link>
      </div>
      <InterviewFilters />
      <InterviewTable />
    </div>
  )
}

