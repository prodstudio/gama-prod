import type React from "react"

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  items?: NavItem[]
}
