"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="container flex flex-col items-center gap-4 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Level Up Your Interview Game
        </h1>
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          Practice technical interviews with experienced engineers. Get real-time feedback
          and improve your chances of landing your dream job.
        </p>
      </div>
      <div className="flex gap-4">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  )
}