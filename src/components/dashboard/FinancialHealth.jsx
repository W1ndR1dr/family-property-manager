import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Users,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  PieChart
} from "lucide-react";

export default function FinancialHealth({
  transactions,
  contributions,
  members,
  mortgageData,
  property
}) {
  // Calculate monthly averages
  const monthlyAnalysis = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { avgIncome: 0, avgExpenses: 0, avgCashFlow: 0, months: 0 };
    }

    const monthlyData = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    const months = Object.keys(monthlyData).sort().slice(-12);
    if (months.length === 0) return { avgIncome: 0, avgExpenses: 0, avgCashFlow: 0, months: 0 };

    const totals = months.reduce((acc, month) => ({
      income: acc.income + monthlyData[month].income,
      expenses: acc.expenses + monthlyData[month].expenses
    }), { income: 0, expenses: 0 });

    return {
      avgIncome: totals.income / months.length,
      avgExpenses: totals.expenses / months.length,
      avgCashFlow: (totals.income - totals.expenses) / months.length,
      months: months.length
    };
  }, [transactions]);

  // Member investment breakdown
  const memberEquity = useMemo(() => {
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const propertyValue = property?.current_value || property?.purchase_price || 0;
    const mortgageBalance = mortgageData?.currentBalance || 0;
    const estimatedEquity = Math.max(0, propertyValue - mortgageBalance);

    return members.map(member => {
      const memberContribs = contributions
        .filter(c => c.member_name === member.name)
        .reduce((sum, c) => sum + c.amount, 0);

      const ownershipPct = member.ownership_percentage || 0;
      const equityShare = (estimatedEquity * ownershipPct) / 100;

      return {
        name: member.name,
        contributions: memberContribs,
        ownershipPct,
        equityShare
      };
    });
  }, [members, contributions, property, mortgageData]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const isPositiveCashFlow = monthlyAnalysis.avgCashFlow >= 0;

  // Mortgage progress
  const mortgageProgress = mortgageData?.totalPayments > 0
    ? {
        pct: mortgageData.progressPercent,
        remaining: mortgageData.totalPayments - mortgageData.paymentsMade,
        yearsLeft: ((mortgageData.totalPayments - mortgageData.paymentsMade) / 12).toFixed(1)
      }
    : null;

  // Property equity
  const propertyEquity = property?.current_value
    ? (property.current_value || 0) - (mortgageData?.currentBalance || 0)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Status Card - The Big Picture */}
      <div className={`relative overflow-hidden rounded-2xl ${
        isPositiveCashFlow
          ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600'
          : 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600'
      } p-1`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                isPositiveCashFlow ? 'bg-white/20' : 'bg-white/20'
              }`}>
                {isPositiveCashFlow ? (
                  <CheckCircle2 className="w-12 h-12 text-white" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wide opacity-90">Property Status</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {isPositiveCashFlow ? "Cash Flow Positive!" : "Building Equity"}
                </h2>
                <p className="text-white/80 mt-1">
                  {isPositiveCashFlow
                    ? "Your property is generating profit every month"
                    : "Members are investing to build long-term value"}
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl md:text-6xl font-bold text-white">
                ${Math.abs(monthlyAnalysis.avgCashFlow).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-white/80 text-lg mt-1 flex items-center justify-center md:justify-end gap-1">
                {isPositiveCashFlow ? (
                  <><ArrowUpRight className="w-5 h-5" /> Monthly Surplus</>
                ) : (
                  <><ArrowDownRight className="w-5 h-5" /> Monthly Gap</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money In */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-green-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Money In</span>
            </div>
            <div className="text-3xl font-bold text-green-700">
              ${monthlyAnalysis.avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-green-600/70 mt-1">per month average</div>
          </CardContent>
        </Card>

        {/* Money Out */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Money Out</span>
            </div>
            <div className="text-3xl font-bold text-red-700">
              ${monthlyAnalysis.avgExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-red-600/70 mt-1">per month average</div>
          </CardContent>
        </Card>

        {/* Total Invested */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Total Invested</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              ${totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-blue-600/70 mt-1">all member contributions</div>
          </CardContent>
        </Card>

        {/* Property Equity */}
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-purple-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Your Equity</span>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {propertyEquity !== null
                ? `$${propertyEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : '—'}
            </div>
            <div className="text-xs text-purple-600/70 mt-1">property value minus debt</div>
          </CardContent>
        </Card>
      </div>

      {/* Mortgage Progress - Beautiful Visual */}
      {mortgageProgress && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
            <div className="flex items-center justify-between text-white mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mortgage Journey</h3>
                  <p className="text-white/60 text-sm">Every payment brings you closer to ownership</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{mortgageProgress.pct.toFixed(1)}%</div>
                <div className="text-white/60 text-sm">Complete</div>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${mortgageProgress.pct}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-medium text-sm drop-shadow-lg">
                  {mortgageData.paymentsMade} of {mortgageData.totalPayments} payments
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mortgageData.paymentsMade}</div>
                <div className="text-white/60 text-xs">Payments Made</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mortgageProgress.remaining}</div>
                <div className="text-white/60 text-xs">Remaining</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{mortgageProgress.yearsLeft}</div>
                <div className="text-white/60 text-xs">Years Left</div>
              </div>
            </div>
          </div>

          {/* Milestone Message */}
          <div className="p-4 bg-slate-50">
            {mortgageProgress.pct < 25 && (
              <p className="text-slate-600 text-center">
                <span className="font-semibold text-slate-800">Just getting started!</span> Every payment builds equity. The journey of a thousand miles begins with a single step.
              </p>
            )}
            {mortgageProgress.pct >= 25 && mortgageProgress.pct < 50 && (
              <p className="text-slate-600 text-center">
                <span className="font-semibold text-slate-800">Great progress!</span> You're past the first quarter. More of each payment now goes to principal.
              </p>
            )}
            {mortgageProgress.pct >= 50 && mortgageProgress.pct < 75 && (
              <p className="text-slate-600 text-center">
                <span className="font-semibold text-emerald-600">Halfway there!</span> You now own more of the property than the bank. Amazing milestone!
              </p>
            )}
            {mortgageProgress.pct >= 75 && (
              <p className="text-slate-600 text-center">
                <span className="font-semibold text-emerald-600">The finish line is in sight!</span> Less than 25% to go. Keep up the great work!
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Member Investment Cards */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-indigo-600" />
            </div>
            Member Investments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {memberEquity.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Add members to see investment breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberEquity.map((member, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-6 -mt-6"></div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{member.name}</div>
                      <div className="text-sm text-slate-500">{member.ownershipPct}% Owner</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Contributed</span>
                      <span className="font-bold text-blue-600">${member.contributions.toLocaleString()}</span>
                    </div>
                    {member.equityShare > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Equity Share</span>
                        <span className="font-bold text-purple-600">
                          ${member.equityShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ownership Progress */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Ownership</span>
                      <span>{member.ownershipPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${member.ownershipPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Explanation Card */}
          {memberEquity.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <strong className="text-slate-700">What does "Equity Share" mean?</strong>
                  <p className="mt-1">
                    It's your portion of the property's value after subtracting the mortgage.
                    This grows as the mortgage is paid down and if property values increase.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Why We Contribute - Only show if negative cash flow */}
      {!isPositiveCashFlow && members.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Understanding the Investment</h3>
                <p className="text-blue-100 text-sm">Why members contribute each month</p>
              </div>
            </div>

            <p className="text-blue-100 mb-6">
              The rent doesn't yet cover all expenses - this is common for rental properties, especially in the early years.
              Your contributions are building equity and long-term wealth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
                <div className="text-3xl font-bold">
                  ${Math.abs(monthlyAnalysis.avgCashFlow).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-blue-200 text-sm mt-1">Monthly Gap</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
                <div className="text-3xl font-bold">
                  ${(Math.abs(monthlyAnalysis.avgCashFlow) * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-blue-200 text-sm mt-1">Annual Need</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
                <div className="text-3xl font-bold">
                  ${members.length > 0
                    ? ((Math.abs(monthlyAnalysis.avgCashFlow) * 12) / members.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : '—'}
                </div>
                <div className="text-blue-200 text-sm mt-1">Per Member/Year</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50">
            <p className="text-blue-800 text-sm text-center">
              <Sparkles className="w-4 h-4 inline mr-1" />
              <strong>Long-term outlook:</strong> As rent increases and mortgage principal is paid down,
              your property will move toward positive cash flow.
            </p>
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
