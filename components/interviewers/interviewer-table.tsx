"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, Calendar } from "lucide-react"
import Link from "next/link"
import { interviewerAPI, type Interviewer } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { InterviewerDetails } from "@/components/interviewers/interviewer-details"

interface InterviewerTableProps {
  filters?: { searchTerm: string; role: string }
  defaultSelectedInterviewerId?: string | null
}

export function InterviewerTable({ filters = { searchTerm: "", role: "all" }, defaultSelectedInterviewerId }: InterviewerTableProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(defaultSelectedInterviewerId || null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        setLoading(true)
        const data = await interviewerAPI.getAll()
        setInterviewers(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviewers:", err)
        setError("Failed to load interviewers. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load interviewers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewers()
  }, [toast])

  const filteredInterviewers = interviewers.filter((interviewer) => {
    const matchesSearchTerm = interviewer.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesRole = filters.role === "all" || interviewer.role.id.toString() === filters.role
    return matchesSearchTerm && matchesRole
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interviewer? This action cannot be undone.")) {
      return
    }

    try {
      await interviewerAPI.delete(id)
      setInterviewers(interviewers.filter((interviewer) => interviewer.id !== id))
      toast({
        title: "Success",
        description: "Interviewer deleted successfully",
      })
    } catch (err) {
      console.error("Failed to delete interviewer:", err)
      toast({
        title: "Error",
        description: "Failed to delete interviewer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading interviewers...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInterviewers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No interviewers found. Add your first interviewer to get started.
              </TableCell>
            </TableRow>
          ) : (
            filteredInterviewers.map((interviewer) => (
              <TableRow key={interviewer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          interviewer.profilePicture
                            ? `data:image/jpeg;base64,${interviewer.profilePicture}`
                            : "/placeholder.svg"
                        }
                        alt={interviewer.name}
                      />
                      <AvatarFallback>
                        {interviewer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{interviewer.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{interviewer.email}</span>
                    <span className="text-xs text-muted-foreground">{interviewer.phoneNumber}</span>
                  </div>
                </TableCell>
                <TableCell>{interviewer.role?.name || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedInterviewerId(interviewer.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/interviewers/${interviewer.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/interviewers/${interviewer.id}/schedule`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>View Schedule</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(interviewer.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {selectedInterviewerId && (
        <InterviewerDetails id={selectedInterviewerId} onClose={() => setSelectedInterviewerId(null)} />
      )}
    </div>
  )
}

