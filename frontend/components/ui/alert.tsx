import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'destructive' | 'success' | 'warning'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-background border border-border',
    destructive: 'border border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10',
    success: 'border border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
    warning: 'border border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
  }

  return (
    <div
      ref={ref}
      role="alert"
      className={cn("relative w-full rounded-lg border p-4", variants[variant], className)}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
