
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SettingSection from './SettingSection';

const MiniSeedInput = ({ seed, setSeed, randomizeSeed, setRandomizeSeed }) => {
  return (
    <SettingSection label="Seed" compact={true}>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={seed}
          onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
          disabled={randomizeSeed}
          className="h-7 text-xs"
        />
        <div className="flex items-center space-x-1.5">
          <Switch
            id="randomizeSeedMini"
            checked={randomizeSeed}
            onCheckedChange={setRandomizeSeed}
            className="scale-75 data-[state=checked]:bg-accent"
          />
          <Label htmlFor="randomizeSeedMini" className="text-xs font-normal">Random</Label>
        </div>
      </div>
    </SettingSection>
  );
};

export default MiniSeedInput;
