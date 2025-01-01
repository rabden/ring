import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full",
      "bg-accent/60 hover:bg-muted/70",
      "transition-all duration-300",
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-primary/90",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary/90 data-[state=checked]:hover:bg-primary/90",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full w-4 h-4",
        "bg-background shadow-md",
        "ring-1 ring-border/20 ring-offset-1 ring-offset-background",
        "transition-all duration-300 ease-in-out",
        "data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
      )} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
