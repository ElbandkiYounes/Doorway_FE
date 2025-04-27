"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { interviewerAPI, roleAPI, type Role } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewInterviewerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false) // State to toggle password visibility
  const router = useRouter()
  const { toast } = useToast()

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleAPI.getAll()
        setRoles(data)
      } catch (error) {
        console.error("Failed to fetch roles:", error)
        toast({
          title: "Error",
          description: "Failed to load roles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear validation error when field is edited
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
    
    // Clear validation error when field is edited
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

      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Only JPEG and PNG images are allowed",
        }))
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Image size exceeds the maximum allowed size of 5MB",
        }))
        return
      }

      setProfileImage(file)

      // Clear validation error
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
      errors.phoneNumber = "Invalid phone number format. Expected format: +<country_code>XXXXXXXXXX or XXXXXXXXXX"
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required"
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      errors.password =
        "Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character"
    }

    if (!formData.roleId) {
      errors.roleId = "Role is required"
    }

    if (!profileImage) {
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

      // Check if email already exists
      const emailExists = await interviewerAPI.checkEmail(formData.email)
      if (emailExists) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "Email already exists",
        }))
        toast({
          title: "Validation Error",
          description: "Email already exists",
          variant: "destructive",
        })
        return
      }

      // Check if phone number already exists
      const phoneExists = await interviewerAPI.checkPhone(formData.phoneNumber)
      if (phoneExists) {
        setValidationErrors((prev) => ({
          ...prev,
          phoneNumber: "Phone number already exists",
        }))
        toast({
          title: "Validation Error",
          description: "Phone number already exists",
          variant: "destructive",
        })
        return
      }

      // Convert roleId to number
      const payload = {
        ...formData,
        roleId: Number(formData.roleId),
      }

      await interviewerAPI.create(payload, profileImage!)

      toast({
        title: "Success",
        description: "Interviewer created successfully",
      })

      router.push("/dashboard/interviewers")
    } catch (error: any) {
      console.error("Failed to create interviewer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create interviewer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Interviewer</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Interviewer Details</CardTitle>
            <CardDescription>Add a new interviewer to the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={validationErrors.name ? "text-destructive" : ""}>
                Full Name
                {validationErrors.name && <span className="ml-1 text-xs">({validationErrors.name})</span>}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className={validationErrors.name ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={validationErrors.email ? "text-destructive" : ""}>
                Email
                {validationErrors.email && <span className="ml-1 text-xs">({validationErrors.email})</span>}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.smith@example.com"
                className={validationErrors.email ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className={validationErrors.phoneNumber ? "text-destructive" : ""}>
                Phone Number
                {validationErrors.phoneNumber && <span className="ml-1 text-xs">({validationErrors.phoneNumber})</span>}
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1234567890"
                className={validationErrors.phoneNumber ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={validationErrors.password ? "text-destructive" : ""}>
                Password
                {validationErrors.password && <span className="ml-1 text-xs">({validationErrors.password})</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={validationErrors.password ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className={validationErrors.roleId ? "text-destructive" : ""}>
                Role
                {validationErrors.roleId && <span className="ml-1 text-xs">({validationErrors.roleId})</span>}
              </Label>
              <Select value={formData.roleId} onValueChange={handleRoleChange} disabled={loadingRoles}>
                <SelectTrigger className={validationErrors.roleId ? "border-destructive" : ""}>
                  <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select a role"} />
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
                Profile Image
                {validationErrors.profileImage && (
                  <span className="ml-1 text-xs">({validationErrors.profileImage})</span>
                )}
              </Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleProfileImageChange}
                className={validationErrors.profileImage ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">Maximum size: 5MB. Allowed formats: JPEG, PNG.</p>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Please fix the validation errors before submitting the form.</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/interviewers")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Interviewer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}