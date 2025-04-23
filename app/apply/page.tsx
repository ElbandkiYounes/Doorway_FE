"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { schoolAPI, type School } from "@/lib/api-service";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'react-toastify';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NavBar } from "@/components/landing/nav-bar";
import axios from "axios";

// Read the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ApplyPage() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date | null;
    schoolId: string;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: null,
    schoolId: "",
  });

  const [schools, setSchools] = useState<School[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await schoolAPI.getAll();
        setSchools(data);
      } catch (error) {
        console.error("Failed to fetch schools:", error);
        toast.error("Unable to load schools. Please try again.");
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSchoolChange = (value: string) => {
    setFormData((prev) => ({ ...prev, schoolId: value }));
    // Clear validation error when field is edited
    if (validationErrors.schoolId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.schoolId;
        return newErrors;
      });
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Only JPEG and PNG images are allowed",
        }));
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          profileImage: "Image size exceeds the maximum allowed size of 5MB",
        }));
        return;
      }
      setProfileImage(file);
      // Clear validation error
      if (validationErrors.profileImage) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.profileImage;
          return newErrors;
        });
      }
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (file.type !== "application/pdf") {
        setValidationErrors((prev) => ({
          ...prev,
          resume: "Only PDF files are allowed",
        }));
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          resume: "Resume size exceeds the maximum allowed size of 10MB",
        }));
        return;
      }
      setResume(file);
      // Clear validation error
      if (validationErrors.resume) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.resume;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^(\+\d{1,3})?\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number format. Expected format: +<country_code>XXXXXXXXXX or XXXXXXXXXX";
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        errors.dateOfBirth = "Date of birth must be in the past";
      }
    }
    if (!formData.schoolId) {
      errors.schoolId = "School is required";
    }
    if (!profileImage) {
      errors.profileImage = "Profile image is required";
    }
    if (!resume) {
      errors.resume = "Resume is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData object for multipart/form-data submission
      const apiFormData = new FormData();
      
      // Create payload JSON and append as a blob
      const payload = {
        ...formData,
        schoolId: Number(formData.schoolId),
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split("T")[0] : null,
      };
      
      apiFormData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      
      // Append files
      if (profileImage) {
        apiFormData.append('image', profileImage);
      }
      
      if (resume) {
        apiFormData.append('resume', resume);
      }
      
      // Send to the public endpoint using the API_URL environment variable
      await axios.post(`${API_URL}/api/public/applications`, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      toast.success("Application submitted successfully!");
      setSubmitted(true);
      
      // Redirect after a few seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      toast.error(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto py-8 px-4">
        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Application Received!</CardTitle>
              <CardDescription>
                Thank you for your application. We will review it soon and get back to you.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Submit Your Application</h1>
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Please fill out this form to submit your application.</CardDescription>
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
                          selected={formData.dateOfBirth || undefined}
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
                    <Select value={formData.schoolId} onValueChange={handleSchoolChange} disabled={loadingSchools}>
                      <SelectTrigger className={validationErrors.schoolId ? "border-destructive" : ""}>
                        <SelectValue placeholder={loadingSchools ? "Loading schools..." : "Select a school"} />
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
                  <div className="space-y-2">
                    <Label htmlFor="resume" className={validationErrors.resume ? "text-destructive" : ""}>
                      Resume
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
                    onClick={() => router.push("/")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}