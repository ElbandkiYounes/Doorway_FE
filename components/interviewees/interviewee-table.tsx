"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, FileText } from "lucide-react"
import Link from "next/link"
import { intervieweeAPI, type Interviewee } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

const statusMap = {
  HIGHLY_INCLINED: { label: "Highly Inclined", badgeClass: "bg-green-500 text-white" },
  INCLINED: { label: "Inclined", badgeClass: "bg-emerald-500 text-white" },
  NEUTRAL: { label: "Neutral", badgeClass: "bg-gray-500 text-white" },
  DECLINED: { label: "Declined", badgeClass: "bg-red-500 text-white" },
  HIGHLY_DECLINED: { label: "Highly Declined", badgeClass: "bg-red-700 text-white" },
}

export function IntervieweeTable({ filters }: { filters: any }) {
  const [interviewees, setInterviewees] = useState<Interviewee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [intervieweeToDelete, setIntervieweeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchInterviewees = async () => {
      try {
        setLoading(true)
        const data = await intervieweeAPI.getAll()
        setInterviewees(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch interviewees:", err)
        setError("Failed to load interviewees. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load interviewees",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewees()
  }, [toast])

  const handleDelete = async () => {
    if (!intervieweeToDelete) return

    try {
      setIsDeleting(true)
      await intervieweeAPI.delete(intervieweeToDelete)
      setInterviewees(interviewees.filter((interviewee) => interviewee.id !== intervieweeToDelete))
      toast({
        title: "Success",
        description: "Interviewee deleted successfully",
      })
    } catch (err) {
      console.error("Failed to delete interviewee:", err)
      toast({
        title: "Error",
        description: "Failed to delete interviewee",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setIntervieweeToDelete(null)
    }
  }

  const filteredInterviewees = interviewees.filter((interviewee) => {
    const matchesSearchTerm = interviewee.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "NO_PROCESS" && !interviewee.newestInterviewingProcess) ||
      interviewee.newestInterviewingProcess?.decision === filters.status
    const matchesSchool = filters.school === "all" || interviewee.school.id.toString() === filters.school
    return matchesSearchTerm && matchesStatus && matchesSchool
  })

  if (loading) {
    return <div className="flex justify-center p-4">Loading interviewees...</div>
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterviewees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No interviewees found. Add your first interviewee to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredInterviewees.map((interviewee) => {
                // Get the decision from the newest interviewing process
                const status = interviewee.newestInterviewingProcess?.decision || null

                return (
                  <TableRow key={interviewee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              interviewee.profilePicture
                                ? `data:image/jpeg;base64,${interviewee.profilePicture}`
                                : "/placeholder.svg"
                            }
                            alt={interviewee.name}
                          />
                          <AvatarFallback>
                            {interviewee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{interviewee.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {interviewee.dateOfBirth ? formatDate(new Date(interviewee.dateOfBirth)) : "No DOB"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{interviewee.email}</span>
                        <span className="text-xs text-muted-foreground">{interviewee.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>{interviewee.school?.name || "N/A"}</TableCell>
                    <TableCell>
                      {status ? (
                        <Badge className={`${statusMap[status]?.badgeClass || ""}`}>
                          {statusMap[status]?.label || "Unknown"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Process Available</Badge>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/interviewees/${interviewee.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/interviewees/${interviewee.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`data:application/pdf;base64,${interviewee.resume}`}
                              download={`${interviewee.name.replace(/\s+/g, "_")}_resume.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Download Resume</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => {
                              setIntervieweeToDelete(interviewee.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interviewee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interviewee? This action cannot be undone
              and will remove all associated data including interviews and processes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

