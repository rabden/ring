
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useModelConfigs } from '@/hooks/useModelConfigs';

const ImageCardBadges = ({ modelName, isNsfw }) => {
  const { data: modelConfigs } = useModelConfigs();
  
  // Try to find the display name from config, or fall back to the stored model name
  const displayName = React.useMemo(() => {
    if (!modelName) return 'Unknown';
    
    // Look for model by id first
    if (modelConfigs && modelConfigs[modelName]) {
      return modelConfigs[modelName].name;
    }
    
    // If not found, use the stored model name (might already be the display name)
    return modelName;
  }, [modelName, modelConfigs]);

  return (
    <div className="absolute bottom-2 left-2 flex gap-1">
      <Badge variant="secondary" className="bg-black/50 text-white border-none text-[8px] md:text-[10px] py-0.5">
        {displayName}
      </Badge>
    </div>
  );
};

export default ImageCardBadges;
