
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SettingSection from './SettingSection';
import { motion } from "framer-motion";

const ImageCountChooser = ({ count = 1, setCount }) => {
  const counts = [1, 2, 3, 4];

  return (
    <SettingSection 
      label="Number of Images" 
      tooltip="Generate multiple images at once. Each image costs the same number of credits."
    >
      <div className="flex gap-2">
        {counts.map((value) => (
          <motion.div
            key={value}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCount(value)}
              className={cn(
                "w-full h-9 rounded-full",
                "transition-all duration-200",
                count === value 
                  ? "bg-primary/10 border-primary/30 text-primary shadow-sm hover:bg-primary/20 hover:border-primary/40" 
                  : "hover:bg-accent/40 border-border/30 hover:border-border/60 text-foreground/60 hover:text-foreground/90"
              )}
            >
              {value}
              {count === value && (
                <motion.div
                  layoutId="active-count-indicator"
                  className="absolute inset-0 rounded-full bg-primary/10 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </SettingSection>
  );
};

export default ImageCountChooser;
