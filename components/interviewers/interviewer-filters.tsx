"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { roleAPI, type Role } from "@/lib/api-service"

export function InterviewerFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [role, setRole] = useState("all")
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleAPI.getAll()
        setRoles(data)
      } catch (err) {
        console.error("Failed to fetch roles:", err)
      }
    }

    fetchRoles()
  }, [])

  const clearFilters = () => {
    setSearchTerm("")
    setRole("all")
    onFilterChange({ searchTerm: "", role: "all" })
  }

  const handleFilterChange = () => {
    onFilterChange({ searchTerm, role })
  }

  useEffect(() => {
    handleFilterChange()
  }, [searchTerm, role])

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search interviewers..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(searchTerm || role !== "all") && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}
