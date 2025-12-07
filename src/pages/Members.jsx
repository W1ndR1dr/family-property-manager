
import React, { useState, useEffect } from "react";
import { Member, Contribution } from "@/api/entities"; // Added Contribution import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Phone, Mail } from "lucide-react";

import MemberForm from "../components/members/MemberForm";
import MemberCard from "../components/members/MemberCard";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]); // New state for contributions
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData(); // Changed from loadMembers to loadData
  }, []);

  const loadData = async () => { // Renamed from loadMembers to loadData
    setIsLoading(true);
    try {
      // Fetch both members and contributions concurrently
      const [membersData, contributionsData] = await Promise.all([
        Member.list('name'),
        Contribution.list()
      ]);
      setMembers(membersData);
      setContributions(contributionsData); // Set contributions state
    } catch (error) {
      console.error("Error loading data:", error); // Updated error message
    }
    setIsLoading(false);
  };

  const handleSubmit = async (memberData) => {
    try {
      if (editingMember) {
        await Member.update(editingMember.id, memberData);
      } else {
        await Member.create(memberData);
      }
      setShowForm(false);
      setEditingMember(null);
      loadData(); // Call loadData to refresh both members and contributions
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const totalOwnership = members.reduce((sum, member) => sum + (member.ownership_percentage || 0), 0);

  // Derive membersWithContributions by adding totalContributions to each member
  const membersWithContributions = members.map(member => {
    const totalContributions = contributions
      .filter(c => c.member_name === member.name) // Assuming member_name in contribution matches member.name
      .reduce((sum, c) => sum + c.amount, 0);
    return { ...member, totalContributions }; // Add totalContributions to the member object
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">LLC Members</h1>
              <p className="text-slate-600">Manage family members and ownership structure</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          {showForm && (
            <div className="mb-8">
              <MemberForm
                member={editingMember}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMember(null);
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ownership Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Allocated Ownership:</span>
                  <Badge variant={totalOwnership === 100 ? "default" : "destructive"}>
                    {totalOwnership}%
                  </Badge>
                </div>
                {totalOwnership !== 100 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Ownership percentages should total 100%
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white border border-slate-200"><CardHeader className="pb-3"><div className="animate-pulse flex items-start justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-slate-100 rounded-full"></div><div><div className="h-4 w-24 bg-slate-100 rounded"></div><div className="h-3 w-16 bg-slate-100 rounded mt-2"></div></div></div></div></CardHeader><CardContent className="pt-0"><div className="animate-pulse space-y-3"><div className="h-4 w-full bg-slate-100 rounded"></div><div className="h-4 w-2/3 bg-slate-100 rounded"></div></div></CardContent></Card>
                ))
            ) : (
                // Use membersWithContributions to pass member data including totalContributions
                membersWithContributions.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={handleEdit}
                    />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
