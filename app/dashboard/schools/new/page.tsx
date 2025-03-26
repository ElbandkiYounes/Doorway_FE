"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { schoolAPI } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function NewSchoolPage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState("") // New state for validation error
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "School name is required",
        variant: "destructive",
      })
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
        setLoading(false)
        return
      }

      setValidationError("") // Clear previous error if any
      await schoolAPI.create({ name })
      toast({
        title: "Success",
        description: "School created successfully",
      })
      router.push("/dashboard/schools")
    } catch (error) {
      console.error("Failed to create school:", error)
      toast({
        title: "Error",
        description: "Failed to create school. Please try again.",
        variant: "destructive",
      })
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

