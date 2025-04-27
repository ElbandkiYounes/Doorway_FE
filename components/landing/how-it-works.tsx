"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users2, Calendar, VideoIcon } from "lucide-react"

export function HowItWorks() {
  return (
    <section className="container py-24">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
        How It Works
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Users2 className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>Connect with Interviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Expert interviewers from top companies are ready to help you prepare for your next big opportunity.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Calendar className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>Schedule Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find a time that works for you with our flexible scheduling system.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <VideoIcon className="h-12 w-12 mb-4 text-primary" />
            <CardTitle>Practice Online</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Join virtual mock interviews with real-time feedback and coding sessions.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}