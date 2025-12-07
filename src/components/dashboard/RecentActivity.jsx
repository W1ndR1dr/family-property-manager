
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";

export default function RecentActivity({ contributions, transactions }) {
  const allActivity = [
    ...contributions.map(c => ({
      ...c,
      type: 'contribution',
      icon: DollarSign,
      color: 'blue'
    })),
    ...transactions.map(t => ({
      ...t,
      type: t.type,
      icon: t.type === 'income' ? ArrowUpCircle : ArrowDownCircle,
      color: t.type === 'income' ? 'green' : 'red'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allActivity.length === 0 && <p className="text-slate-500 text-sm">No recent activity to display.</p>}
        {allActivity.map((activity, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                activity.color === 'blue' ? 'bg-blue-100' :
                activity.color === 'green' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <activity.icon className={`w-4 h-4 ${
                  activity.color === 'blue' ? 'text-blue-600' :
                  activity.color === 'green' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {activity.type === 'contribution' ? activity.member_name : activity.description}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(activity.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                activity.color === 'green' ? 'text-green-600' : 
                activity.color === 'red' ? 'text-red-600' : 'text-blue-600'
              }`}>
                ${activity.amount.toLocaleString()}
              </p>
              <Badge variant="secondary" className="text-xs">
                {activity.type === 'contribution' ? activity.contribution_type : activity.category}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
