"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { intervieweeAPI, type Interviewee, Decision } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

const statusMap = {
  HIGHLY_INCLINED: { label: "Highly Inclined", variant: "success" },
  INCLINED: { label: "Inclined", variant: "success" },
  NEUTRAL: { label: "Neutral", variant: "default" },
  DECLINED: { label: "Declined", variant: "destructive" },
  HIGHLY_DECLINED: { label: "Highly Declined", variant: "destructive" },
}

export function IntervieweeTable() {
  const [interviewees, setInterviewees] = useState<Interviewee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const handleDelete = async (id: string) => {
    try {
      await intervieweeAPI.delete(id)
      setInterviewees(interviewees.filter((interviewee) => interviewee.id !== id))
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
    }
  }

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
          {interviewees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No interviewees found. Add your first interviewee to get started.
              </TableCell>
            </TableRow>
          ) : (
            interviewees.map((interviewee) => {
              // Get the decision from the newest interviewing process
              const status = interviewee.newestInterviewingProcess?.decision || Decision.NEUTRAL

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
                    <Badge variant={(statusMap[status]?.variant as any) || "default"}>
                      {statusMap[status]?.label || "Unknown"}
                    </Badge>
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
                          <Link href={`/dashboard/interviewees/${interviewee.id}/schedule`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Schedule Interview</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(interviewee.id)}>
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
  )
}

