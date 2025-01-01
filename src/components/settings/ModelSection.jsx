import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import SettingSection from './SettingSection';
import { useModelConfigs } from '@/hooks/useModelConfigs';

const ModelSection = ({ model, setModel, quality, proMode }) => {
  const { data: modelConfigs, isLoading } = useModelConfigs();

  if (isLoading || !modelConfigs) {
    return null;
  }

  const renderModelButton = (modelKey, modelConfig) => (
    <Button
      key={modelKey}
      variant={model === modelKey ? 'default' : 'outline'}
      onClick={() => setModel(modelKey)}
      className="flex items-center justify-center gap-1"
      disabled={!proMode && modelConfig.isPremium}
    >
      {modelConfig.name}
      {modelConfig.isPremium && !proMode && <Lock className="h-4 w-4" />}
    </Button>
  );

  return (
    <SettingSection 
      label="Model" 
      tooltip="Choose between fast generation or higher quality output."
    >
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(modelConfigs).map(([key, config]) => renderModelButton(key, config))}
      </div>
    </SettingSection>
  );
};

export default ModelSection;