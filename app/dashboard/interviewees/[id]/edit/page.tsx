"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { intervieweeAPI, schoolAPI, type School, type Interviewee } from "@/lib/api-service"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from 'react-toastify'
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditIntervieweePage() {
  const params = useParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: null,
    schoolId: "",
  })

  const [interviewee, setInterviewee] = useState<Interviewee | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const id = params.id as string
        const [intervieweeData, schoolsData] = await Promise.all([intervieweeAPI.getById(id), schoolAPI.getAll()])

        setInterviewee(intervieweeData)
        setSchools(schoolsData)

        setFormData({
          name: intervieweeData.name,
          email: intervieweeData.email,
          phoneNumber: intervieweeData.phoneNumber,
          dateOfBirth: intervieweeData.dateOfBirth ? new Date(intervieweeData.dateOfBirth) : null,
          schoolId: intervieweeData.school?.id.toString() || "",
        })
      } catch (err) {
        console.error("Failed to fetch data:", err)
        toast.error("Failed to load interviewee data. Please try again.")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSchoolChange = (value: string) => {
    setFormData((prev) => ({ ...prev, schoolId: value }))

    // Clear validation error when field is edited
    if (validationErrors.schoolId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.schoolId
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

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (file.type !== "application/pdf") {
        setValidationErrors((prev) => ({
          ...prev,
          resume: "Only PDF files are allowed",
        }))
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          resume: "Resume size exceeds the maximum allowed size of 10MB",
        }))
        return
      }

      setResume(file)

      // Clear validation error
      if (validationErrors.resume) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.resume
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

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required"
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      if (dob >= today) {
        errors.dateOfBirth = "Date of birth must be in the past"
      }
    }

    if (!formData.schoolId) {
      errors.schoolId = "School is required"
    }

    // Profile image and resume are required only if they're not already set
    if (!interviewee?.profilePicture && !profileImage) {
      errors.profileImage = "Profile image is required"
    }

    if (!interviewee?.resume && !resume) {
      errors.resume = "Resume is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setLoading(true)
      const id = params.id as string

      // Check if email already exists (excluding current interviewee)
      if (interviewee?.email !== formData.email) {
        const emailExists = await intervieweeAPI.checkEmail(formData.email, id)
        if (emailExists) {
          setValidationErrors((prev) => ({
            ...prev,
            email: "Email already exists",
          }))
          toast.error("Email already exists")
          setLoading(false)
          return
        }
      }

      // Check if phone number already exists (excluding current interviewee)
      if (interviewee?.phoneNumber !== formData.phoneNumber) {
        const phoneExists = await intervieweeAPI.checkPhone(formData.phoneNumber, id)
        if (phoneExists) {
          setValidationErrors((prev) => ({
            ...prev,
            phoneNumber: "Phone number already exists",
          }))
          toast.error("Phone number already exists")
          setLoading(false)
          return
        }
      }

      // Create a new FormData object for the multipart request
      const payload = {
        ...formData,
        schoolId: Number(formData.schoolId),
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : null,
      }

      // Get the current profile image and resume if not changed
      const imageFile =
        profileImage || (await createFileFromBase64(interviewee?.profilePicture || "", "profile.jpg", "image/jpeg"))

      const resumeFile =
        resume || (await createFileFromBase64(interviewee?.resume || "", "resume.pdf", "application/pdf"))

      await intervieweeAPI.update(id, payload, imageFile, resumeFile)

      toast.success("Interviewee updated successfully")

      router.push(`/dashboard/interviewees/${id}`)
    } catch (error: any) {
      console.error("Failed to update interviewee:", error)
      toast.error(error.message || "Failed to update interviewee. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to create a File object from base64 string
  const createFileFromBase64 = async (base64String: string, fileName: string, mimeType: string): Promise<File> => {
    // Convert base64 to blob
    const response = await fetch(`data:${mimeType};base64,${base64String}`)
    const blob = await response.blob()

    // Create a File from the blob
    return new File([blob], fileName, { type: mimeType })
  }

  if (loadingData) {
    return <div className="flex justify-center p-4">Loading interviewee data...</div>
  }

  if (!interviewee) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">Interviewee not found</p>
        <Button variant="outline" className="mt-2" onClick={() => router.push("/dashboard/interviewees")}>
          Back to Interviewees
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Interviewee</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Interviewee Details</CardTitle>
            <CardDescription>Update interviewee information.</CardDescription>
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
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
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
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john.doe@example.com"
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
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="+1234567890"
                className={validationErrors.phoneNumber ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className={validationErrors.dateOfBirth ? "text-destructive" : ""}>
                Date of Birth
                {validationErrors.dateOfBirth && <span className="ml-1 text-xs">({validationErrors.dateOfBirth})</span>}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                      validationErrors.dateOfBirth && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString() : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => handleChange("dateOfBirth", date || null)}
                    disabled={(date) => date >= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school" className={validationErrors.schoolId ? "text-destructive" : ""}>
                School
                {validationErrors.schoolId && <span className="ml-1 text-xs">({validationErrors.schoolId})</span>}
              </Label>
              <Select value={formData.schoolId} onValueChange={handleSchoolChange}>
                <SelectTrigger className={validationErrors.schoolId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage" className={validationErrors.profileImage ? "text-destructive" : ""}>
                Profile Image (Leave blank to keep current)
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

            <div className="space-y-2">
              <Label htmlFor="resume" className={validationErrors.resume ? "text-destructive" : ""}>
                Resume (Leave blank to keep current)
                {validationErrors.resume && <span className="ml-1 text-xs">({validationErrors.resume})</span>}
              </Label>
              <Input
                id="resume"
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className={validationErrors.resume ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">Maximum size: 10MB. Allowed format: PDF.</p>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Please fix the validation errors before submitting the form.</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/interviewees/${interviewee.id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Interviewee"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}