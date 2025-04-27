"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface WaitingListProps {
  participants: {
    id: string;
    name: string;
    profilePicture?: string;
    admitted: boolean;
  }[];
  onAction: (participantId: string, action: "admit" | "deny") => void;
}

export function WaitingList({ participants, onAction }: WaitingListProps) {
  const waitingParticipants = participants.filter((p) => !p.admitted)

  if (waitingParticipants.length === 0) {
    return null
  }

  return (
    <Card className="fixed bottom-24 right-4 w-80 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-medium">
          Waiting Room
          <Badge variant="secondary">{waitingParticipants.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {waitingParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between gap-4"
            >
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
                <span className="text-sm font-medium">{participant.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onAction(participant.id, "admit")}
                >
                  Admit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(participant.id, "deny")}
                >
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
