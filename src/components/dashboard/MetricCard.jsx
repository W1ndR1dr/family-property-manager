import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ title, value, trend, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    orange: "bg-orange-500",
    purple: "bg-purple-500"
  };

  const trendColor = trend && trend > 0 ? "text-green-600" : "text-red-600";
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-xl ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}% from last quarter
          </p>
        )}
      </CardContent>
    </Card>
  );
}