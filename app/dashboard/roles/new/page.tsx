"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { roleAPI } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function NewRolePage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please fix the errors in the form")
      setValidationError("Role name is required")
      return
    }

    try {
      setLoading(true)

      // Check for duplicate role name
      const allRoles = await roleAPI.getAll()
      const duplicate = allRoles.find(
        (role) => role.name.toLowerCase() === name.trim().toLowerCase()
      )
      if (duplicate) {
        setValidationError(`A role with the name "${name.trim()}" already exists`)
        toast.error("Role name already exists")
        setLoading(false)
        return
      }

      setValidationError("")
      await roleAPI.create({ name })
      toast.success("Role created successfully")
      router.push("/dashboard/roles")
    } catch (error: any) {
      console.error("Failed to create role:", error)
      toast.error(error.message || "Failed to create role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Role</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Add a new role to the system. Roles are used to categorize interviewers and job positions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Frontend Developer"
                required
              />
              {validationError && <p className="text-sm text-destructive">{validationError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/roles")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

