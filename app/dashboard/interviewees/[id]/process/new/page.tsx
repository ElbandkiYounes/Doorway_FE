"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roleAPI, interviewingProcessAPI, type Role } from "@/lib/api-service"
import { toast } from 'react-toastify'
import { Textarea } from "@/components/ui/textarea"

export default function NewInterviewingProcessPage() {
  const { id: intervieweeId } = useParams() as { id: string }
  const router = useRouter()
  
  const [feedback, setFeedback] = useState("")
  const [roleId, setRoleId] = useState<number | "">("")
  const [roles, setRoles] = useState<Role[]>([])
  const [errors, setErrors] = useState<{ feedback?: string; roleId?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await roleAPI.getAll()
        setRoles(allRoles)
      } catch (error) {
        console.error("Failed to fetch roles", error)
        toast.error("Failed to load roles. Please try again.")
      }
    }
    fetchRoles()
  }, [])

  const validate = () => {
    const newErrors: { feedback?: string; roleId?: string } = {}
    if (!roleId) {
      newErrors.roleId = "Role is mandatory"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setLoading(true)
      await interviewingProcessAPI.create(intervieweeId, {
        roleId: Number(roleId),
        feedback,
      })
      toast.success("Interviewing process created successfully")
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error: any) {
      console.error("Failed to create process:", error)
      toast.error(error.message || "Failed to create interviewing process")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">New Interviewing Process</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Process Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className={errors.roleId ? "text-destructive" : ""}>
                Role
                {errors.roleId && <span className="ml-1 text-xs">({errors.roleId})</span>}
              </Label>
              <Select value={roleId.toString()} onValueChange={(value) => setRoleId(Number(value))}>
                <SelectTrigger className={errors.roleId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add any initial feedback or notes about the process"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/interviewees/${intervieweeId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Process"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
