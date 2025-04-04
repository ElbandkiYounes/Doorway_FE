"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { schoolAPI, type School } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function EditSchoolPage() {
  const params = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        if (typeof params.id !== "string") {
          throw new Error("Invalid school ID");
        }
        const data: School = await schoolAPI.getById(params.id);
        setName(data.name)
      } catch (error: any) {
        toast.error(error.message || "Failed to load school.")
      } finally {
        setLoading(false)
      }
    }
    fetchSchool()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please fix the errors in the form")
      setValidationError("School name is required")
      return
    }

    try {
      setLoading(true)
      const allSchools = await schoolAPI.getAll()
      const duplicate = allSchools.find(
        (school) =>
          school.name.toLowerCase() === name.trim().toLowerCase() &&
          school.id.toString() !== params.id
      )
      if (duplicate) {
        setValidationError(`A school with the name "${name.trim()}" already exists`)
        toast.error("School name already exists")
        setLoading(false)
        return
      }
      setValidationError("")
      if (typeof params.id === "string") {
        await schoolAPI.update(params.id, { name })
      } else {
        throw new Error("Invalid school ID")
      }
      toast.success("School updated successfully")
      router.push("/dashboard/schools")
    } catch (error: any) {
      console.error("Failed to update school:", error)
      toast.error(error.message || "Failed to update school. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit School</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit School</CardTitle>
            <CardDescription>Update the school name below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter school name"
              />
              {validationError && <p className="text-sm text-destructive">{validationError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/schools")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update School"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
