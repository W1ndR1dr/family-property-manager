import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Upload, FileText, TrendingUp } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl("Contributions")}>
          <Button variant="outline" className="w-full justify-start gap-2 h-auto p-3">
            <Plus className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Add Contribution</div>
              <div className="text-xs text-slate-500">Record member payment</div>
            </div>
          </Button>
        </Link>
        
        <Link to={createPageUrl("Transactions")}>
          <Button variant="outline" className="w-full justify-start gap-2 h-auto p-3">
            <Upload className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Log Transaction</div>
              <div className="text-xs text-slate-500">Income or expense</div>
            </div>
          </Button>
        </Link>

        <Link to={createPageUrl("Reports")}>
          <Button variant="outline" className="w-full justify-start gap-2 h-auto p-3">
            <FileText className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">Generate Report</div>
              <div className="text-xs text-slate-500">Quarterly summary</div>
            </div>
          </Button>
        </Link>

        <Link to={createPageUrl("Members")}>
          <Button variant="outline" className="w-full justify-start gap-2 h-auto p-3">
            <TrendingUp className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium">View Members</div>
              <div className="text-xs text-slate-500">Ownership details</div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}