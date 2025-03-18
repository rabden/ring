
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingSection from './SettingSection';
import { motion } from "framer-motion";

const QualityChooser = ({ quality, setQuality, availableQualities = ["HD", "HD+"] }) => {
  // Auto-select HD if no quality is chosen
  useEffect(() => {
    if (!quality || !availableQualities.includes(quality)) {
      setQuality("HD");
    }
  }, [quality, setQuality, availableQualities]);

  return (
    <SettingSection label="Quality" tooltip="Higher quality settings produce more detailed images but require more credits.">
      <Tabs value={quality} onValueChange={setQuality} className="w-full">
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${availableQualities.length}, 1fr)` }}>
          {availableQualities.map((q) => (
            <TabsTrigger key={q} value={q}>
              <motion.span
                whileTap={{ scale: 0.95 }}
                className="relative z-10"
              >
                {q}
              </motion.span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </SettingSection>
  );
};

export default QualityChooser;
