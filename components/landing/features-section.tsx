"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users2,
  VideoIcon,
  Code2,
  MessageSquare,
  Gauge,
  BrainCircuit
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Expert Interviewers",
      description:
        "Connect with experienced engineers from top tech companies who provide valuable insights and feedback.",
      icon: Users2,
    },
    {
      title: "Live Video Interviews",
      description:
        "Practice interviews in a real-time environment with high-quality video and audio streaming.",
      icon: VideoIcon,
    },
    {
      title: "Live Coding Sessions",
      description:
        "Collaborate in real-time with a shared code editor to practice technical problem-solving.",
      icon: Code2,
    },
    {
      title: "Instant Feedback",
      description:
        "Get immediate, constructive feedback on your performance to help you improve.",
      icon: MessageSquare,
    },
    {
      title: "Performance Tracking",
      description:
        "Monitor your progress over time with detailed analytics and performance metrics.",
      icon: Gauge,
    },
    {
      title: "AI-Powered Insights",
      description:
        "Receive personalized recommendations and insights powered by advanced AI algorithms.",
      icon: BrainCircuit,
    },
  ]

  return (
    <section className="container py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Features that Set Us Apart
        </h2>
        <p className="max-w-[900px] text-lg text-muted-foreground sm:text-xl">
          Our platform provides everything you need to excel in your technical interviews
        </p>
      </div>
      <div className="grid gap-6 pt-12 sm:grid-cols-2 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}