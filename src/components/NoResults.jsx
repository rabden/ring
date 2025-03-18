
import React from 'react';
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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

      <div className="w-full max-w-xs">
        <DotLottieReact
          src="https://lottie.host/578388ec-9280-43b8-b22a-6adefde2f212/E8yaWCks1y.lottie"
          loop
          autoplay
          className="w-full rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
};

export default NoResults;
