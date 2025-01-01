import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const SkeletonImageCard = ({ width = 512, height = 512 }) => {
  const aspectRatio = (height / width) * 100

  return (
    <div className="mb-6 group">
      <Card className={cn(
        "overflow-hidden rounded-2xl",
        "border-border/80 bg-card/95",
        "backdrop-blur-[2px]",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        "transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
        "hover:border-border/20"
      )}>
        <CardContent className="p-0 relative" style={{ paddingTop: `${aspectRatio}%` }}>
          <Skeleton className={cn(
            "absolute inset-0 w-full h-full",
            "bg-muted/5",
            "animate-pulse",
            "transition-all duration-300"
          )} />
        </CardContent>
      </Card>
      <div className="mt-3 flex items-center justify-between gap-4">
        <Skeleton className={cn(
          "h-4 w-3/4 rounded-lg",
          "bg-muted/5",
          "animate-pulse",
          "transition-all duration-300"
        )} />
        <Skeleton className={cn(
          "h-7 w-7 rounded-lg",
          "bg-muted/5",
          "animate-pulse",
          "transition-all duration-300"
        )} />
      </div>
    </div>
  )
}

export default SkeletonImageCard