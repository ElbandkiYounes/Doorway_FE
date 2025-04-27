"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { roleAPI, interviewingProcessAPI, type Role, type InterviewingProcess } from "@/lib/api-service"
import { toast } from 'react-toastify'
import { Textarea } from "@/components/ui/textarea"

export default function EditInterviewingProcessPage() {
  // Extract intervieweeId and processId from URL parameters
  const { id: intervieweeId, processId } = useParams() as { id: string; processId: string }
  const router = useRouter()

  const [feedback, setFeedback] = useState("")
  const [roleId, setRoleId] = useState<number | "">("")
  const [decision, setDecision] = useState<string>("")
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [errors, setErrors] = useState<{ feedback?: string; roleId?: string; decision?: string }>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all available roles
        const allRoles = await roleAPI.getAll()
        setRoles(allRoles)
        // Fetch current interviewing process details by processId
        const process = await interviewingProcessAPI.getById(processId)
        setFeedback(process.feedback || "")
        setRoleId(process.role.id)
        setDecision(process.decision)
      } catch (error) {
        console.error("Failed to fetch process details", error)
        toast.error("Failed to load process details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [processId])

  const validate = () => {
    const newErrors: { feedback?: string; roleId?: string; decision?: string } = {}
    if (!roleId) newErrors.roleId = "Role is mandatory"
    if (!decision) newErrors.decision = "Decision is mandatory"
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
      const payload = { feedback, decision, roleId: Number(roleId) }
      await interviewingProcessAPI.update(processId, payload)
      toast.success("Interviewing process updated successfully")
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error) {
      console.error("Failed to update process", error)
      toast.error("Failed to update process")
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await interviewingProcessAPI.delete(processId)
      toast.success("Interviewing process deleted successfully")
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error) {
      console.error("Failed to delete process:", error)
      toast.error("Failed to delete process")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading process details...</div>
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Interviewing Process</h1>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            Delete Process
          </Button>
        </div>

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
                <Label htmlFor="decision" className={errors.decision ? "text-destructive" : ""}>
                  Decision
                  {errors.decision && <span className="ml-1 text-xs">({errors.decision})</span>}
                </Label>
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger className={errors.decision ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGHLY_DECLINED">Highly Declined</SelectItem>
                    <SelectItem value="DECLINED">Declined</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    <SelectItem value="INCLINED">Inclined</SelectItem>
                    <SelectItem value="HIGHLY_INCLINED">Highly Inclined</SelectItem>
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
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Process</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interviewing process? This action cannot be undone
              and will remove all associated interviews as well.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
