"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { interviewerAPI, roleAPI, type Interviewer, type Role } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EditInterviewerPage() {
  // ...existing state declarations...
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  })
  const [interviewer, setInterviewer] = useState<Interviewer | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const id = params.id as string
        const [interviewerData, rolesData] = await Promise.all([
          interviewerAPI.getById(id),
          roleAPI.getAll(),
        ])
        setInterviewer(interviewerData)
        setRoles(rolesData)
        setFormData({
          name: interviewerData.name,
          email: interviewerData.email,
          phoneNumber: interviewerData.phoneNumber,
          password: "",
          roleId: interviewerData.role?.id.toString() || "",
        })
      } catch (err) {
        console.error("Failed to fetch data:", err)
        toast({
          title: "Error",
          description: "Failed to load interviewer data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [params.id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleId: value }))
    if (validationErrors.roleId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.roleId
        return newErrors
      })
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Only JPEG and PNG images are allowed",
        }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Image size exceeds 5MB",
        }))
        return
      }
      setProfileImage(file)
      if (validationErrors.profileImage) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.profileImage
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^(\+\d{1,3})?\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number format"
    }
    if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      errors.password =
        "Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character"
    }
    if (!formData.roleId) {
      errors.roleId = "Role is required"
    }
    if (!interviewer?.profilePicture && !profileImage) {
      errors.profileImage = "Profile image is required"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }
    try {
      setLoading(true)
      const id = params.id as string

      if (interviewer?.email !== formData.email) {
        const emailExists = await interviewerAPI.checkEmail(formData.email, id)
        if (emailExists) {
          setValidationErrors((prev) => ({ ...prev, email: "Email already exists" }))
          toast({
            title: "Validation Error",
            description: "Email already exists",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }
      if (interviewer?.phoneNumber !== formData.phoneNumber) {
        const phoneExists = await interviewerAPI.checkPhone(formData.phoneNumber, id)
        if (phoneExists) {
          setValidationErrors((prev) => ({ ...prev, phoneNumber: "Phone number already exists" }))
          toast({
            title: "Validation Error",
            description: "Phone number already exists",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }
      const payload = {
        ...formData,
        roleId: Number(formData.roleId),
      }
      if (!payload.password || payload.password.trim() === "") {
        payload.password = interviewer?.password || ""
      }
      const imageFile = profileImage || (await createFileFromBase64(interviewer?.profilePicture || "", "profile.jpg", "image/jpeg"))
      await interviewerAPI.update(id, payload, imageFile)
      toast({
        title: "Success",
        description: "Interviewer updated successfully",
      })
      // Redirect to Interviewers Table page with popUpId query parameter
      router.push(`/dashboard/interviewers?popUpId=${id}`)
    } catch (error: any) {
      console.error("Failed to update interviewer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update interviewer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createFileFromBase64 = async (base64String: string, fileName: string, mimeType: string): Promise<File> => {
    const response = await fetch(`data:${mimeType};base64,${base64String}`)
    const blob = await response.blob()
    return new File([blob], fileName, { type: mimeType })
  }

  if (loadingData) {
    return <div className="flex justify-center p-4">Loading interviewer data...</div>
  }
  if (!interviewer) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">Interviewer not found</p>
        <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard/interviewers")}>
          Back to Interviewers
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Interviewer</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          {/* ...existing CardHeader, CardContent, CardFooter... */}
          <CardHeader>
            <CardTitle>Interviewer Details</CardTitle>
            <CardDescription>Update interviewer information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ...existing inputs... */}
            <div className="space-y-2">
              <Label htmlFor="name" className={validationErrors.name ? "text-destructive" : ""}>
                Full Name {validationErrors.name && <span className="ml-1 text-xs">({validationErrors.name})</span>}
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={validationErrors.name ? "border-destructive" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={validationErrors.email ? "text-destructive" : ""}>
                Email {validationErrors.email && <span className="ml-1 text-xs">({validationErrors.email})</span>}
              </Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" className={validationErrors.email ? "border-destructive" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className={validationErrors.phoneNumber ? "text-destructive" : ""}>
                Phone Number {validationErrors.phoneNumber && <span className="ml-1 text-xs">({validationErrors.phoneNumber})</span>}
              </Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1234567890" className={validationErrors.phoneNumber ? "border-destructive" : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={validationErrors.password ? "text-destructive" : ""}>
                Password (Leave blank to keep current) {validationErrors.password && <span className="ml-1 text-xs">({validationErrors.password})</span>}
              </Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={validationErrors.password ? "border-destructive" : ""} />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className={validationErrors.roleId ? "text-destructive" : ""}>
                Role {validationErrors.roleId && <span className="ml-1 text-xs">({validationErrors.roleId})</span>}
              </Label>
              <Select value={formData.roleId} onValueChange={handleRoleChange}>
                <SelectTrigger className={validationErrors.roleId ? "border-destructive" : ""}>
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
              <Label htmlFor="profileImage" className={validationErrors.profileImage ? "text-destructive" : ""}>
                Profile Image (Leave blank to keep current) {validationErrors.profileImage && <span className="ml-1 text-xs">({validationErrors.profileImage})</span>}
              </Label>
              <Input id="profileImage" type="file" accept="image/jpeg,image/png" onChange={handleProfileImageChange} className={validationErrors.profileImage ? "border-destructive" : ""} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/interviewers")} // changed redirection to table
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Interviewer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
