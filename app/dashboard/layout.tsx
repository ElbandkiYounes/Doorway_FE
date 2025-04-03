import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import ProtectedRoute from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 md:ml-64 w-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

