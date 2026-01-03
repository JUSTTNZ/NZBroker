"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { ButtonHTMLAttributes } from "react"

interface AuthCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  redirectTo?: string
  children?: React.ReactNode
}

export function AuthCtaButton({ label, redirectTo = "/dashboard", children, ...props }: AuthCtaButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {children || label}
    </Button>
  )
}
