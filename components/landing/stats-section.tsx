"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Users,
  VideoIcon,
  Building2,
  School2,
} from "lucide-react"
import { useTheme } from "next-themes"

interface StatsData {
  interviewees: number
  interviews: number
  roles: number
  schools: number
}

interface StatsSectionProps {
  data: StatsData
}

export function StatsSection({ data }: StatsSectionProps) {
  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
        By the Numbers
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Users className="h-12 w-12 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold mb-2">
              {data.interviewees}+
            </CardTitle>
            <CardDescription>Interviewees</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <VideoIcon className="h-12 w-12 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold mb-2">
              {data.interviews}+
            </CardTitle>
            <CardDescription>Interviews Conducted</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Building2 className="h-12 w-12 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold mb-2">{data.roles}+</CardTitle>
            <CardDescription>Available Roles</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <School2 className="h-12 w-12 mb-4 text-primary" />
            <CardTitle className="text-3xl font-bold mb-2">
              {data.schools}+
            </CardTitle>
            <CardDescription>Partner Schools</CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}