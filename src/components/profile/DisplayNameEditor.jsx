import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Check } from 'lucide-react';

const DisplayNameEditor = ({ 
  isEditing, 
  displayName, 
  setDisplayName, 
  onEdit, 
  onUpdate, 
  size = 'md' 
}) => {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {isEditing ? (
        <>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`h-8 ${textSizeClasses[size]} font-semibold text-center`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onUpdate}
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <h3 className={`${textSizeClasses[size]} font-semibold`}>
            {displayName}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default DisplayNameEditor;