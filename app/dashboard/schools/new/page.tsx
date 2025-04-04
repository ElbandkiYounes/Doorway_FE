"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { schoolAPI } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function NewSchoolPage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please fix the errors in the form")
      setValidationError("School name is required")
      return
    }

    try {
      setLoading(true)

      // Check for duplicate school name
      const allSchools = await schoolAPI.getAll()
      const duplicate = allSchools.find(
        (school) => school.name.toLowerCase() === name.trim().toLowerCase()
      )
      if (duplicate) {
        setValidationError(`A school with the name "${name.trim()}" already exists`)
        toast.error("School name already exists")
        setLoading(false)
        return
      }

      setValidationError("")
      await schoolAPI.create({ name })
      toast.success("School created successfully")
      router.push("/dashboard/schools")
    } catch (error: any) {
      console.error("Failed to create school:", error)
      toast.error(error.message || "Failed to create school. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New School</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>School Details</CardTitle>
            <CardDescription>
              Add a new school to the system. Schools are associated with interviewees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Massachusetts Institute of Technology"
                required
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
              {loading ? "Creating..." : "Create School"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

