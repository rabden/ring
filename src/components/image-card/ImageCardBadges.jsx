import React from 'react';
import { Badge } from "@/components/ui/badge";

const ImageCardBadges = ({ modelName, isNsfw }) => {
  return (
    <div className="absolute bottom-2 left-2 flex gap-1">
      <Badge variant="secondary" className="bg-black/50 text-white border-none text-[8px] md:text-[10px] py-0.5">
        {modelName}
      </Badge>
    </div>
  );
};

export default ImageCardBadges;