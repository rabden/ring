import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingSection from './SettingSection';

const QualityChooser = ({ quality, setQuality, availableQualities = ["HD", "HD+"] }) => {
  // Auto-select HD if no quality is chosen
  useEffect(() => {
    if (!quality || !availableQualities.includes(quality)) {
      setQuality("HD");
    }
  }, [quality, setQuality, availableQualities]);

  return (
    <SettingSection label="Quality" tooltip="Higher quality settings produce more detailed images but require more credits.">
      <Tabs value={quality} onValueChange={setQuality}>
        <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${availableQualities.length}, 1fr)` }}>
          {availableQualities.map((q) => (
            <TabsTrigger key={q} value={q}>{q}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </SettingSection>
  );
};

export default QualityChooser; 