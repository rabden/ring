import React from 'react'
import { Flame, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const StatusIcon = ({ children, className }) => (
  <div className={cn(
    "absolute z-[2] rounded-full p-1 bg-background/80 backdrop-blur-sm",
    className
  )}>
    {children}
  </div>
)

const ImageStatusIndicators = ({ isTrending, isHot }) => {
  if (!isTrending && !isHot) return null;
  
  return (
    <>
      {isTrending && (
        <StatusIcon className="top-2 left-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </StatusIcon>
      )}
      {isHot && (
        <StatusIcon className={cn(
          "top-2",
          isTrending ? "left-10" : "left-2"
        )}>
          <Flame className="w-4 h-4 text-red-500" />
        </StatusIcon>
      )}
    </>
  )
}

export default ImageStatusIndicators