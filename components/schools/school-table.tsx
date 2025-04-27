"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { schoolAPI, type School } from "@/lib/api-service"
import { toast } from "react-toastify"

export function SchoolTable() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        const data = await schoolAPI.getAll()
        setSchools(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch schools:", err)
        setError("Failed to load schools. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      return
    }

    try {
      await schoolAPI.delete(id)
      setSchools(schools.filter((school) => school.id !== id))
      toast.success("School deleted successfully")
    } catch (err) {
      console.error("Failed to delete school:", err)
      toast.error("Failed to delete school")
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading schools...</div>
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
            <TableHead>School Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                No schools found. Add your first school to get started.
              </TableCell>
            </TableRow>
          ) : (
            schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>{school.name}</TableCell>
                <TableCell>{school.location}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/schools/${school.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(school.id)}
                        className="text-destructive"
                      >
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
    </div>
  )
}

