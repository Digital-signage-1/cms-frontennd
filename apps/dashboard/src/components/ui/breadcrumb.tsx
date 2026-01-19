'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-text-muted hover:text-text-primary transition-colors truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate ${isLast ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </motion.nav>
  )
}
