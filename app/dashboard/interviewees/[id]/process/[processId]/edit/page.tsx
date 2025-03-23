"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { roleAPI, interviewingProcessAPI, type Role } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function EditInterviewingProcessPage() {
  // Extract intervieweeId and processId from URL parameters
  const { id: intervieweeId, processId } = useParams() as { id: string; processId: string }
  const router = useRouter()
  const { toast } = useToast()

  const [feedback, setFeedback] = useState("")
  const [roleId, setRoleId] = useState<number | "">("")
  const [decision, setDecision] = useState<string>("")
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
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
        setFeedback(process.feedback)
        setRoleId(process.role.id)
        setDecision(process.decision)
      } catch (error) {
        console.error("Failed to fetch process details", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [processId])

  const validate = () => {
    const newErrors: { feedback?: string; roleId?: string; decision?: string } = {}
    if (!feedback.trim()) newErrors.feedback = "Feedback is mandatory"
    if (!roleId) newErrors.roleId = "Role is mandatory"
    if (!decision) newErrors.decision = "Decision is mandatory"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const payload = { feedback, decision, roleId: Number(roleId) }
      await interviewingProcessAPI.update(processId, payload)
      toast({ title: "Process Updated", description: "Interviewing process updated successfully." })
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (error) {
      console.error("Failed to update process", error)
      toast({ title: "Error", description: "Failed to update process", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4">Loading process details...</div>
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Interviewing Process</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            className="w-full border rounded p-2"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          {errors.feedback && <p className="text-sm text-destructive mt-1">{errors.feedback}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Decision</label>
          <select
            className="w-full border rounded p-2"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <option value="HIGHLY_INCLINED">Highly Inclined</option>
            <option value="INCLINED">Inclined</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="DECLINED">Declined</option>
            <option value="HIGHLY_DECLINED">Highly Declined</option>
          </select>
          {errors.decision && <p className="text-sm text-destructive mt-1">{errors.decision}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Role</label>
          <select
            className="w-full border rounded p-2"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="text-sm text-destructive mt-1">{errors.roleId}</p>}
        </div>
        <Button type="submit">Update Process</Button>
      </form>
    </div>
  )
}
