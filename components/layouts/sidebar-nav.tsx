"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  items?: NavItem[]
}

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  if (!items?.length) {
    return null
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isExpanded = (title: string) => expandedItems.includes(title)

  return (
    <ScrollArea className="h-full py-2">
      <div className="space-y-2 p-2">
        {items.map((item, index) => {
          const Icon = item.icon
          const hasChildren = item.items && item.items.length > 0
          const expanded = isExpanded(item.title)

          if (hasChildren) {
            return (
              <div key={index} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start h-9 px-3", "hover:bg-accent hover:text-accent-foreground")}
                  onClick={() => toggleExpanded(item.title)}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span className="flex-1 text-left">{item.title}</span>
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {item.label && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {item.label}
                    </Badge>
                  )}
                </Button>

                {expanded && (
                  <div className="ml-6 space-y-1">
                    {item.items?.map((subItem, subIndex) => {
                      const SubIcon = subItem.icon
                      const isActive = subItem.href === pathname

                      return (
                        <Button
                          key={subIndex}
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start h-8 px-3 text-sm",
                            isActive && "bg-secondary text-secondary-foreground",
                            subItem.disabled && "opacity-50 cursor-not-allowed",
                          )}
                          asChild={!subItem.disabled}
                          disabled={subItem.disabled}
                        >
                          {subItem.disabled ? (
                            <span>
                              {SubIcon && <SubIcon className="mr-2 h-3 w-3" />}
                              {subItem.title}
                              {subItem.label && (
                                <Badge variant="secondary" className="ml-auto h-4 px-1 text-xs">
                                  {subItem.label}
                                </Badge>
                              )}
                            </span>
                          ) : (
                            <Link href={subItem.href || "#"}>
                              {SubIcon && <SubIcon className="mr-2 h-3 w-3" />}
                              {subItem.title}
                              {subItem.label && (
                                <Badge variant="secondary" className="ml-auto h-4 px-1 text-xs">
                                  {subItem.label}
                                </Badge>
                              )}
                            </Link>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = item.href === pathname

          return (
            <Button
              key={index}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-9 px-3",
                isActive && "bg-secondary text-secondary-foreground",
                item.disabled && "opacity-50 cursor-not-allowed",
              )}
              asChild={!item.disabled}
              disabled={item.disabled}
            >
              {item.disabled ? (
                <span>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.title}
                  {item.label && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {item.label}
                    </Badge>
                  )}
                </span>
              ) : (
                <Link href={item.href || "#"}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.title}
                  {item.label && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {item.label}
                    </Badge>
                  )}
                </Link>
              )}
            </Button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
