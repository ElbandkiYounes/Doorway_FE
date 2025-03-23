"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

export function IntervieweeFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [role, setRole] = useState("")

  const clearFilters = () => {
    setSearchTerm("")
    setStatus("")
    setRole("")
  }

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
          <SelectItem value="hired">Hired</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
        </SelectContent>
      </Select>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="frontend">Frontend Developer</SelectItem>
          <SelectItem value="backend">Backend Developer</SelectItem>
          <SelectItem value="fullstack">Fullstack Developer</SelectItem>
          <SelectItem value="ux">UX Designer</SelectItem>
          <SelectItem value="product">Product Manager</SelectItem>
          <SelectItem value="devops">DevOps Engineer</SelectItem>
        </SelectContent>
      </Select>
      {(searchTerm || status || role) && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}

