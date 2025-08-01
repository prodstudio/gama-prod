"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { SidebarNav } from "./sidebar-nav"

interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  items?: NavItem[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  userRole?: string
}

export function DashboardLayout({ children, navItems, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarNav items={navItems} />
      </Sidebar>

      <div className="flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} userRole={userRole} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">{children}</main>
      </div>
    </div>
  )
}
