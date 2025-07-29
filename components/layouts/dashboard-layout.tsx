import type React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import type { NavItem } from "@/lib/types/nav"

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

export function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar navItems={navItems} />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">{children}</main>
      </div>
    </div>
  )
}
