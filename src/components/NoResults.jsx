import React from 'react';
import { cn } from "@/lib/utils";

const NoResults = ({ animationUrl }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center mx-auto",
      "p-4 md:p-8 rounded-xl m-2 mt-16 md:mt-10",
      "bg-card border border-border",
      "transition-all duration-300"
    )}>
      <h2 className="text-xl font-semibold mb-2">Nothing Found</h2>
      <p className="text-sm text-muted-foreground/70 mb-8 text-center">
        Explore something else or create something new
      </p>

      {animationUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-lg overflow-hidden"
        >
          <source src={animationUrl} type="video/webm" />
        </video>
      )}
    </div>
  );
};

export default NoResults;