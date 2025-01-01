import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Heart } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center space-y-1 p-4 rounded-lg bg-muted/50">
    <Icon className="w-5 h-5 text-muted-foreground" />
    <span className="text-2xl font-semibold">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const StatsSection = ({ userStats }) => {
  return (
    <Card className="w-full bg-gradient-to-br from-background/95 to-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            value={userStats?.followers || 0}
            label="Followers"
          />
          <StatCard
            icon={UserPlus}
            value={userStats?.following || 0}
            label="Following"
          />
          <StatCard
            icon={Heart}
            value={userStats?.likes || 0}
            label="Likes"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsSection;