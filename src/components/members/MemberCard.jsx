
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, Phone, User, DollarSign } from "lucide-react";

export default function MemberCard({ member, onEdit }) {
  const roleColors = {
    parent: "bg-blue-100 text-blue-800",
    sibling: "bg-purple-100 text-purple-800", 
    other: "bg-gray-100 text-gray-800"
  };

  return (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{member.name}</h3>
              <Badge className={`text-xs ${roleColors[member.role]} mt-1`}>
                {member.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(member)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Ownership:</span>
            <span className="font-semibold text-slate-900">{member.ownership_percentage}%</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-600 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Total Contributions:
            </span>
            <span className="font-semibold text-blue-600">
              ${(member.totalContributions || 0).toLocaleString()}
            </span>
          </div>

          {(member.email || member.phone) && <div className="pt-2 border-t border-slate-100 space-y-3" />}

          {member.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
