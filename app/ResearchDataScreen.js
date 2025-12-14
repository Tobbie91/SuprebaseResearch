"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Shield,
  Calendar,
  DollarSign,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Award
} from "lucide-react";
import { getUserResearchData, getSystemWideAnalytics, exportResearchDataToCSV } from "../lib/researchDataUtils";

export default function ResearchDataScreen({ userData, setCurrentScreen }) {
  // Check if user is admin/superadmin
  const isAdmin = userData?.role === "admin" || userData?.role === "superadmin";

  // Regular users can only see individual view, admins can see both
  const [viewMode, setViewMode] = useState("individual"); // "individual" or "system"
  const [individualData, setIndividualData] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [viewMode, userData?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === "individual" && userData?.id) {
        const data = await getUserResearchData(userData.id);
        setIndividualData(data);
      } else if (viewMode === "system" && isAdmin) {
        // Only admins can access system-wide data
        const data = await getSystemWideAnalytics();
        setSystemData(data);
      }
    } catch (error) {
      console.error("Error loading research data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (systemData) {
      const csv = exportResearchDataToCSV(systemData);
      if (csv) {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `research-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 pb-8">
        <button
          onClick={() => setCurrentScreen("dashboard")}
          className="mb-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-2xl font-bold mb-2">
          {isAdmin ? "Research Dashboard" : "My Research Data"}
        </h1>
        <p className="text-indigo-100 text-sm">
          {isAdmin ? "Analyze baseline vs. current activity" : "Your progress and insights"}
        </p>

        {/* View Mode Toggle - Only for Admins */}
        {isAdmin && (
          <div className="mt-6 flex gap-2 bg-white/10 rounded-2xl p-1">
            <button
              onClick={() => setViewMode("individual")}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                viewMode === "individual"
                  ? "bg-white text-indigo-600"
                  : "text-white hover:bg-white/10"
              }`}
            >
              My Data
            </button>
            <button
              onClick={() => setViewMode("system")}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                viewMode === "system"
                  ? "bg-white text-indigo-600"
                  : "text-white hover:bg-white/10"
              }`}
            >
              System Average
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 -mt-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading research data...</p>
          </div>
        ) : viewMode === "individual" ? (
          <IndividualDataView data={individualData} />
        ) : (
          <SystemDataView data={systemData} onExport={handleExport} />
        )}
      </div>
    </div>
  );
}

// ===== INDIVIDUAL DATA VIEW =====

function IndividualDataView({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const { baseline, activity, comparison, userId, name } = data;

  // Export individual data to JSON
  const handleExportIndividual = () => {
    const exportData = {
      userId,
      name,
      exportedAt: new Date().toISOString(),
      baseline,
      currentActivity: activity,
      comparison
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <button
        onClick={handleExportIndividual}
        className="w-full bg-indigo-600 text-white rounded-2xl p-4 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
      >
        <Download size={20} />
        Export My Research Data
      </button>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4">Your Research Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-indigo-100 text-xs mb-1">Days Active</p>
            <p className="text-2xl font-bold">{activity.summary.daysActive}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-xs mb-1">Groups Joined</p>
            <p className="text-2xl font-bold">{activity.rosca.totalGroupsJoined}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-xs mb-1">Trust Score</p>
            <p className="text-2xl font-bold">{activity.trust.score}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-xs mb-1">On-Time Rate</p>
            <p className="text-2xl font-bold">{activity.trust.reliabilityRate}%</p>
          </div>
        </div>
      </div>

      {/* ROSCA Participation */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-teal-50">
            <Users size={24} className="text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">ROSCA Participation</h3>
            <p className="text-xs text-gray-600">Your group activity</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Total Groups</span>
            <span className="font-bold text-gray-900">{activity.rosca.totalGroupsJoined}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Active Groups</span>
            <span className="font-bold text-teal-600">{activity.rosca.activeGroups}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Completed Groups</span>
            <span className="font-bold text-gray-900">{activity.rosca.completedGroups}</span>
          </div>
        </div>

        {activity.rosca.groupNames.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-bold">Your Groups:</p>
            <div className="flex flex-wrap gap-2">
              {activity.rosca.groupNames.map((name, i) => (
                <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full font-semibold">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-50">
            <Calendar size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Payment History</h3>
            <p className="text-xs text-gray-600">Your payment track record</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle size={16} className="text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">{activity.payments.onTime}</span>
            </div>
            <p className="text-xs text-gray-600">On Time</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={16} className="text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{activity.payments.late}</span>
            </div>
            <p className="text-xs text-gray-600">Late</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle size={16} className="text-red-600" />
              <span className="text-2xl font-bold text-red-600">{activity.payments.missed}</span>
            </div>
            <p className="text-xs text-gray-600">Missed</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Reliability Rate</span>
            <span className="text-2xl font-bold text-gray-900">{activity.trust.reliabilityRate}%</span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              style={{ width: `${activity.trust.reliabilityRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Payout */}
      {activity.nextPayout && (
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-white/20">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="font-bold">Next Payout</h3>
              <p className="text-xs text-teal-100">{activity.nextPayout.groupName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-teal-100 text-xs mb-1">Amount</p>
              <p className="text-2xl font-bold">{activity.nextPayout.currency} {activity.nextPayout.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-teal-100 text-xs mb-1">Weeks Until</p>
              <p className="text-2xl font-bold">{activity.nextPayout.weeksUntil}</p>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Comparison - Enhanced */}
      {comparison.available && baseline && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-purple-50">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Baseline vs Current Activity</h3>
              <p className="text-xs text-gray-600">How you've progressed since joining</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Financial Situation */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <p className="text-sm font-bold text-purple-900 mb-3">💰 Financial Situation</p>

              {baseline.monthlyIncome && (
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-200">
                  <span className="text-xs text-purple-700">Monthly Income (Baseline)</span>
                  <span className="font-semibold text-purple-900">{baseline.monthlyIncome}</span>
                </div>
              )}

              {baseline.currentSavings !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-700">Savings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Before</p>
                      <p className="font-semibold text-gray-900">
                        {typeof baseline.currentSavings === 'number'
                          ? `₦${baseline.currentSavings.toLocaleString()}`
                          : baseline.currentSavings}
                      </p>
                    </div>
                    <div className="text-purple-400">→</div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Now</p>
                      <p className="font-semibold text-teal-600">
                        ₦{activity.financial.totalBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {comparison.savingsBehavior.change !== "N/A" && (
                    <p className="text-xs text-center mt-2 font-semibold text-teal-600">
                      {comparison.savingsBehavior.change} change
                    </p>
                  )}
                </div>
              )}

              {baseline.savingsFrequency && (
                <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                  <span className="text-xs text-purple-700">Savings Frequency (Baseline)</span>
                  <span className="font-semibold text-purple-900">{baseline.savingsFrequency}</span>
                </div>
              )}
            </div>

            {/* ROSCA Experience */}
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
              <p className="text-sm font-bold text-teal-900 mb-3">👥 ROSCA Participation</p>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Before Joining</p>
                    <p className="font-semibold text-gray-900">{comparison.roscaExperience.before}</p>
                  </div>
                  <div className="text-teal-400">→</div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className="font-semibold text-teal-600">{comparison.roscaExperience.after}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-200">
                <p className="text-xs text-teal-700 mb-2">Current Activity</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-lg font-bold text-teal-600">{activity.rosca.totalGroupsJoined}</p>
                    <p className="text-xs text-gray-600">Joined</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-lg font-bold text-teal-600">{activity.rosca.activeGroups}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-lg font-bold text-teal-600">{activity.rosca.completedGroups}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Borrowing Habits */}
            {baseline.borrowingFrequency && (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <p className="text-sm font-bold text-amber-900 mb-3">💳 Borrowing Behavior</p>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-700">Baseline Borrowing Frequency</span>
                  <span className="font-semibold text-amber-900">{baseline.borrowingFrequency}</span>
                </div>

                {baseline.emergencyFund !== undefined && (
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                    <span className="text-xs text-amber-700">Had Emergency Fund</span>
                    <span className="font-semibold text-amber-900">{baseline.emergencyFund}</span>
                  </div>
                )}
              </div>
            )}

            {/* Investment Experience */}
            {baseline.hasInvested !== undefined && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-3">📈 Investment Experience</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700">Previous Investment Experience</span>
                  <span className="font-semibold text-blue-900">{baseline.hasInvested}</span>
                </div>

                {baseline.riskTolerance && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                    <span className="text-xs text-blue-700">Risk Tolerance</span>
                    <span className="font-semibold text-blue-900">{baseline.riskTolerance}</span>
                  </div>
                )}
              </div>
            )}

            {/* Financial Goals Progress */}
            {comparison.financialGoals.stated.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <p className="text-sm font-bold text-emerald-900 mb-3">🎯 Financial Goals Progress</p>
                <div className="space-y-3">
                  {comparison.financialGoals.progress !== "No goals specified" &&
                   Array.isArray(comparison.financialGoals.progress) ? (
                    comparison.financialGoals.progress.map((goalProgress, i) => (
                      <div key={i} className="bg-white rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <CheckCircle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{goalProgress.goal}</p>
                            <p className="text-xs text-emerald-600 mt-1">Status: {goalProgress.status}</p>
                            <p className="text-xs text-gray-600 mt-1">{goalProgress.metric}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    comparison.financialGoals.stated.map((goal, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-emerald-600 mt-0.5" />
                        <p className="text-sm text-gray-900">{goal}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Trust Development */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <p className="text-sm font-bold text-indigo-900 mb-3">⭐ Trust & Reliability</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{activity.trust.score}</p>
                  <p className="text-xs text-gray-600">Trust Score</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{activity.trust.reliabilityRate}%</p>
                  <p className="text-xs text-gray-600">Reliability</p>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-200">
                <p className="text-xs text-indigo-700 mb-2">Payment Record</p>
                <p className="text-xs text-gray-600">{comparison.trustDevelopment.paymentRecord}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SYSTEM-WIDE DATA VIEW =====

function SystemDataView({ data, onExport }) {
  if (!data) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center">
        <p className="text-gray-600">No system data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <button
        onClick={onExport}
        className="w-full bg-indigo-600 text-white rounded-2xl p-4 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
      >
        <Download size={20} />
        Export to CSV
      </button>

      {/* Overview */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-50">
            <Users size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Platform Overview</h3>
            <p className="text-xs text-gray-600">Total users and participation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.totalUsers}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">With Baseline</p>
            <p className="text-3xl font-bold text-indigo-600">{data.overview.usersWithBaseline}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl col-span-2">
            <p className="text-xs text-gray-600 mb-1">Baseline Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.baselineCompletionRate}</p>
          </div>
        </div>
      </div>

      {/* ROSCA Analytics */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-teal-50">
            <BarChart3 size={24} className="text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">ROSCA Analytics</h3>
            <p className="text-xs text-gray-600">Platform-wide participation</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Total Group Joins</span>
            <span className="font-bold text-gray-900">{data.rosca.totalGroupJoins}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Avg Groups/User</span>
            <span className="font-bold text-teal-600">{data.rosca.avgGroupsPerUser}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">Active Participants</span>
            <span className="font-bold text-gray-900">{data.rosca.activeParticipants}</span>
          </div>
        </div>
      </div>

      {/* Trust Scores */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-50">
            <Award size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Trust Scores</h3>
            <p className="text-xs text-gray-600">Platform reliability</p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl">
          <p className="text-xs text-gray-600 mb-1">Average Trust Score</p>
          <p className="text-4xl font-bold text-gray-900">{data.trust.avgTrustScore}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">{data.trust.distribution.excellent}</p>
            <p className="text-xs text-gray-600">Excellent</p>
            <p className="text-[10px] text-gray-500">≥80</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{data.trust.distribution.good}</p>
            <p className="text-xs text-gray-600">Good</p>
            <p className="text-[10px] text-gray-500">60-79</p>
          </div>
          <div className="text-center p-3 bg-gray-100 rounded-xl">
            <p className="text-2xl font-bold text-gray-600">{data.trust.distribution.fair}</p>
            <p className="text-xs text-gray-600">Fair</p>
            <p className="text-[10px] text-gray-500">&lt;60</p>
          </div>
        </div>
      </div>

      {/* Payment Analytics */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-50">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Payment Analytics</h3>
            <p className="text-xs text-gray-600">System-wide payment behavior</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">On-Time Rate</span>
              <span className="text-2xl font-bold text-emerald-600">{data.payments.onTimeRate}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600"
                style={{ width: data.payments.onTimeRate }}
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Late Rate</span>
              <span className="text-2xl font-bold text-amber-600">{data.payments.lateRate}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600"
                style={{ width: data.payments.lateRate }}
              />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Missed Rate</span>
              <span className="text-2xl font-bold text-red-600">{data.payments.missedRate}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: data.payments.missedRate }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Payments Tracked</span>
            <span className="text-lg font-bold text-gray-900">{data.payments.total}</span>
          </div>
        </div>
      </div>

      {/* Baseline Comparisons */}
      {data.baselineComparisons.available > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-purple-50">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Baseline Analysis</h3>
              <p className="text-xs text-gray-600">Before vs. after comparison</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Users with Baseline</p>
              <p className="text-2xl font-bold text-gray-900">{data.baselineComparisons.summary.totalWithBaseline}</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Now Active in ROSCA</p>
              <p className="text-2xl font-bold text-teal-600">{data.baselineComparisons.summary.nowActiveInRosca}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Avg Reliability Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{data.baselineComparisons.summary.avgReliabilityRate}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-900 font-semibold">
              {data.baselineComparisons.summary.behaviorChange}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
