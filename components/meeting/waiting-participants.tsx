"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface WaitingParticipantsProps {
  participants: {
    id: string;
    name: string;
    role: string;
    profilePicture?: string;
  }[];
}

export function WaitingParticipants({ participants }: WaitingParticipantsProps) {
  if (participants.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Waiting for Others
          <Badge variant="secondary">{participants.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      participant.profilePicture
                        ? `data:image/jpeg;base64,${participant.profilePicture}`
                        : "/placeholder.svg"
                    }
                    alt={participant.name}
                  />
                  <AvatarFallback>
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{participant.name}</div>
                  <div className="text-xs text-muted-foreground">{participant.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
