import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl px-4 py-2 text-sm",
        "bg-muted/10 hover:bg-muted/20",
        "border border-border/80 hover:border-border/100",
        "transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "focus-visible:outline-none focus-visible:bg-muted/30",
        "focus-visible:border-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && [
          "border-destructive/50",
          "focus-visible:ring-destructive/40",
          "hover:border-destructive/60",
          "bg-destructive/10 hover:bg-destructive/20",
          "focus-visible:bg-destructive/20"
        ],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
