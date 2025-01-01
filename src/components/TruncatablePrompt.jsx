import React, { useState } from 'react';
import { cn } from "@/lib/utils";

const TruncatablePrompt = ({ prompt, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = prompt.length > 150;

  return (
    <div className={cn("relative", className)}>
      <p 
        onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
        className={cn(
          "text-sm text-muted-foreground",
          !isExpanded && shouldTruncate && "line-clamp-3",
          shouldTruncate && "cursor-pointer hover:text-muted-foreground/80"
        )}
      >
        {prompt}
      </p>
    </div>
  );
};

export default TruncatablePrompt;