"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { roleAPI, type Role } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  // New state for inline validation error
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data: Role = await roleAPI.getById(params.id)
        setName(data.name)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load role.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      // Check for duplicate role name
      const allRoles = await roleAPI.getAll()
      const duplicate = allRoles.find(
        (role) =>
          role.name.toLowerCase() === name.trim().toLowerCase() &&
          role.id.toString() !== params.id
      )
      if (duplicate) {
        // Set inline validation error instead of showing a toast
        setValidationError(`A role with the name "${name.trim()}" already exists`)
        setLoading(false)
        return
      }
      setValidationError("") // clear previous error if any
      await roleAPI.update(params.id, { name })
      toast({
        title: "Success",
        description: "Role updated successfully",
      })
      router.push("/dashboard/roles")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      })
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
            {/* ...existing form layout... */}
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
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
