"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { schoolAPI, type School } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function EditSchoolPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  // New state for inline validation error
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const data: School = await schoolAPI.getById(params.id)
        setName(data.name)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load school.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSchool()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Check for duplicate school name
      const allSchools = await schoolAPI.getAll()
      const duplicate = allSchools.find(
        (school) =>
          school.name.toLowerCase() === name.trim().toLowerCase() &&
          school.id.toString() !== params.id
      )
      if (duplicate) {
        // Set inline duplicate error under the input field
        setValidationError(`A school with the name "${name.trim()}" already exists`)
        setLoading(false)
        return
      }
      setValidationError("") // clear previous error if any
      await schoolAPI.update(params.id, { name })
      toast({
        title: "Success",
        description: "School updated successfully",
      })
      router.push("/dashboard/schools")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update school",
        variant: "destructive",
      })
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
            {/* ...existing form layout... */}
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
