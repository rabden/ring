
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/useMediaQuery"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  const isMobile = useMediaQuery("(max-width: 640px)")
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl p-1 bg-muted/30 backdrop-blur-sm",
        isMobile ? "w-full" : "",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-foreground/70 text-sm font-medium transition-all duration-200",
        "hover:text-foreground/90 hover:bg-primary/5",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-40",
        "data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className
      )}
      {...props}
    >
      {props.children}
      {props["data-state"] === "active" && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute inset-0 bg-primary/60 rounded-lg"
          style={{ zIndex: -1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-primary focus-visible:outline-none",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {props.children}
    </motion.div>
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
