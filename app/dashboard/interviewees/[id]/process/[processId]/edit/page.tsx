"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { roleAPI, interviewingProcessAPI, type Role, type InterviewingProcess } from "@/lib/api-service"
import { toast } from 'react-toastify'
import { Textarea } from "@/components/ui/textarea"

export default function EditInterviewingProcessPage() {
  const { id: intervieweeId, processId } = useParams()
  const router = useRouter()
  
  const [roleId, setRoleId] = useState<number | "">("")
  const [feedback, setFeedback] = useState("")
  const [roles, setRoles] = useState<Role[]>([])
  const [process, setProcess] = useState<InterviewingProcess | null>(null)
  const [errors, setErrors] = useState<{ feedback?: string; roleId?: string }>({})
  const [loading, setLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [processData, rolesData] = await Promise.all([
          interviewingProcessAPI.getById(processId as string),
          roleAPI.getAll()
        ])
        setProcess(processData)
        setRoles(rolesData)
        setRoleId(processData.role.id)
        setFeedback(processData.feedback || "")
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load process data. Please try again.")
      }
    }
    fetchData()
  }, [processId])

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
    if (!validate()) return

    try {
      setLoading(true)
      await interviewingProcessAPI.update(processId as string, {
        roleId: roleId as number,
        feedback: feedback || null
      })
      toast.success("Process updated successfully")
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error) {
      console.error("Failed to update process:", error)
      toast.error("Failed to update process")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      await interviewingProcessAPI.delete(processId as string)
      toast.success("Process deleted successfully")
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error) {
      console.error("Failed to delete process:", error)
      toast.error("Failed to delete process")
    } finally {
      setLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (!process) {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Process</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this process? This will also delete all associated interviews. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-3xl font-bold mb-6">Edit Process</h1>
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
                placeholder="Add feedback about this process"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/interviewees/${intervieweeId}`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Process"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
