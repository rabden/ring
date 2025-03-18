
import React from 'react';
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const NoResults = ({ animationUrl }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center mx-auto",
      "transition-all duration-300",
      "mt-12 md:mt-0"
    )}>
      <div className="w-full max-w-[80%] md:max-w-xl mb-8">
        <DotLottieReact
          src="https://lottie.host/578388ec-9280-43b8-b22a-6adefde2f212/E8yaWCks1y.lottie"
          loop
          autoplay
          className="w-full rounded-lg overflow-hidden"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Nothing Found</h2>
      <p className="text-sm text-muted-foreground/70 text-center">
        Explore something else or create something new
      </p>
    </div>
  );
};

export default NoResults;
