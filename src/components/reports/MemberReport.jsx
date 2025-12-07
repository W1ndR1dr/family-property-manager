import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, Percent } from "lucide-react";

export default function MemberReport({ members, contributions, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const memberContributions = members.map(member => {
    const totalContributions = contributions
      .filter(c => c.member_name === member.name)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const contributionCount = contributions.filter(c => c.member_name === member.name).length;
    
    return {
      ...member,
      totalContributions,
      contributionCount,
      averageContribution: contributionCount > 0 ? totalContributions / contributionCount : 0
    };
  });

  const totalContributions = memberContributions.reduce((sum, m) => sum + m.totalContributions, 0);
  const maxContribution = Math.max(...memberContributions.map(m => m.totalContributions));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6" />
            Member Contribution Analysis
          </CardTitle>
          <p className="text-slate-600">Detailed breakdown of each member's financial contributions</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalContributions.toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 mt-1">All members combined</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {memberContributions.filter(m => m.totalContributions > 0).length}
            </div>
            <p className="text-sm text-slate-600 mt-1">of {members.length} total members</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="w-5 h-5" />
              Average per Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${(totalContributions / members.length).toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 mt-1">Across all members</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle>Individual Member Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Ownership %</TableHead>
                <TableHead>Total Contributed</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberContributions
                .sort((a, b) => b.totalContributions - a.totalContributions)
                .map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        member.role === 'parent' ? 'bg-blue-100 text-blue-800' :
                        member.role === 'sibling' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.ownership_percentage}%</TableCell>
                    <TableCell className="font-medium">
                      ${member.totalContributions.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.contributionCount}</span>
                        {member.contributionCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Avg: ${member.averageContribution.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>vs. Ownership</span>
                          <span className={
                            (member.totalContributions / totalContributions * 100) >= member.ownership_percentage 
                              ? 'text-green-600' : 'text-orange-600'
                          }>
                            {((member.totalContributions / totalContributions * 100) - member.ownership_percentage).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={(member.totalContributions / maxContribution) * 100} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}