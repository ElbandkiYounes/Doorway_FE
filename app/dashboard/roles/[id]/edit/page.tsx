"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { roleAPI, type Role } from "@/lib/api-service"
import { toast } from 'react-toastify'

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (typeof params.id !== "string") {
          throw new Error("Invalid role ID")
        }
        const data: Role = await roleAPI.getById(params.id)
        setName(data.name)
      } catch (error: any) {
        toast.error(error.message || "Failed to load role.")
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please fix the errors in the form")
      setValidationError("Role name is required")
      return
    }

    try {
      setLoading(true)
      const allRoles = await roleAPI.getAll()
      const duplicate = allRoles.find(
        (role) =>
          role.name.toLowerCase() === name.trim().toLowerCase() &&
          role.id.toString() !== params.id
      )
      if (duplicate) {
        setValidationError(`A role with the name "${name.trim()}" already exists`)
        toast.error("Role name already exists")
        setLoading(false)
        return
      }
      setValidationError("")
      if (typeof params.id === "string") {
        await roleAPI.update(params.id, { name })
      } else {
        throw new Error("Invalid role ID")
      }
      toast.success("Role updated successfully")
      router.push("/dashboard/roles")
    } catch (error: any) {
      console.error("Failed to update role:", error)
      toast.error(error.message || "Failed to update role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center p-4">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Role</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Role</CardTitle>
            <CardDescription>Update the role name below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
              />
              {validationError && <p className="text-sm text-destructive">{validationError}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/roles")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
