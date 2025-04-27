"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useTheme } from "next-themes"

interface ParticipantsNotificationProps {
  newParticipantName: string
}

export function ParticipantsNotification({ newParticipantName }: ParticipantsNotificationProps) {
  useEffect(() => {
    if (newParticipantName) {
      toast.info(`${newParticipantName} joined the meeting`)
    }
  }, [newParticipantName])

  return null
}
