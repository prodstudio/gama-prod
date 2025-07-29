"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/types/nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {items.map((item, index) =>
        item.items ? (
          <Accordion type="single" collapsible key={index}>
            <AccordionItem value={item.title} className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">{item.title}</AccordionTrigger>
              <AccordionContent className="pl-4">
                {item.items.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    href={subItem.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === subItem.href && "text-primary bg-muted",
                    )}
                  >
                    {subItem.icon}
                    {subItem.title}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "text-primary bg-muted",
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ),
      )}
    </nav>
  )
}
