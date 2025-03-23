"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { roleAPI, interviewingProcessAPI, type Role } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export default function NewInterviewingProcessPage() {
  const { id: intervieweeId } = useParams() // interviewee id
  const router = useRouter()
  const { toast } = useToast()
  
  const [feedback, setFeedback] = useState("")
  const [roleId, setRoleId] = useState<number | "">("")
  const [roles, setRoles] = useState<Role[]>([])
  const [errors, setErrors] = useState<{ feedback?: string; roleId?: string }>({})

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await roleAPI.getAll()
        setRoles(allRoles)
      } catch (error) {
        console.error("Failed to fetch roles", error)
      }
    }
    fetchRoles()
  }, [])

  const validate = () => {
    const newErrors: { feedback?: string; roleId?: string } = {}
    if (!feedback.trim()) {
      newErrors.feedback = "Feedback is mandatory"
    }
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
      const payload = { feedback, decision: "NEUTRAL", roleId: Number(roleId) }
      const newProcess = await interviewingProcessAPI.create(intervieweeId, payload)
      toast({ title: "Process Created", description: "New interviewing process started." })
      router.push(`/dashboard/interviewees/${intervieweeId}`)
    } catch (err) {
      console.error("Failed to create process:", err)
      toast({ title: "Error", description: "Failed to create new process", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Interviewing Process</h1>
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
        <Button type="submit">Create Process</Button>
      </form>
    </div>
  )
}
