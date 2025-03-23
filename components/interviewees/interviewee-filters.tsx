"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { schoolAPI, type School } from "@/lib/api-service"

export function IntervieweeFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("all")
  const [school, setSchool] = useState("all")
  const [schools, setSchools] = useState<School[]>([])

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await schoolAPI.getAll()
        setSchools(data)
      } catch (err) {
        console.error("Failed to fetch schools:", err)
      }
    }

    fetchSchools()
  }, [])

  const clearFilters = () => {
    setSearchTerm("")
    setStatus("all")
    setSchool("all")
    onFilterChange({ searchTerm: "", status: "all", school: "all" })
  }

  const handleFilterChange = () => {
    onFilterChange({ searchTerm, status, school })
  }

  useEffect(() => {
    handleFilterChange()
  }, [searchTerm, status, school])

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search interviewees..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="HIGHLY_INCLINED">Highly Inclined</SelectItem>
          <SelectItem value="INCLINED">Inclined</SelectItem>
          <SelectItem value="NEUTRAL">Neutral</SelectItem>
          <SelectItem value="DECLINED">Declined</SelectItem>
          <SelectItem value="HIGHLY_DECLINED">Highly Declined</SelectItem>
          <SelectItem value="NO_PROCESS">No Process Available</SelectItem>
        </SelectContent>
      </Select>
      <Select value={school} onValueChange={setSchool}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="School" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Schools</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id.toString()}>
              {school.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(searchTerm || status !== "all" || school !== "all") && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}

