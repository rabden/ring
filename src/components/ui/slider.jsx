import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-6",
      className
    )}
    {...props}>
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        "bg-muted/60 hover:bg-muted/90",
        "transition-colors duration-200",
      )}
    >
      <SliderPrimitive.Range 
        className={cn(
          "absolute h-full bg-primary/80 hover:bg-primary/90",
          "transition-colors duration-200"
        )} 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-4 w-4 rounded-full",
        "border-2 border-border/80 border-muted",
        "bg-primary",
        "ring-1 ring-border/10 ring-offset-1 ring-offset-background",
        "transition-all duration-200",
        "hover:scale-105 hover:border-primary/60",
        "focus-visible:outline-none",
        "focus-visible:ring-1 focus-visible:ring-primary/40",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
