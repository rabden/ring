import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins } from 'lucide-react';

const CreditsSection = ({ userStats }) => {
  const MAX_CREDITS = 50;
  const creditsProgress = ((userStats?.credits || 0) / MAX_CREDITS) * 100;

  return (
    <Card className="w-full bg-gradient-to-br from-background/95 to-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Credits</span>
            <span>
              {userStats?.credits || 0}
              <span className="text-muted-foreground"> / {MAX_CREDITS}</span>
              {userStats?.bonusCredits > 0 && (
                <span className="text-green-500 ml-1">+{userStats.bonusCredits}</span>
              )}
            </span>
          </div>
          <Progress value={creditsProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditsSection;