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
      } else if (viewMode === "system") {
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

        <h1 className="text-2xl font-bold mb-2">Research Data</h1>
        <p className="text-indigo-100 text-sm">
          Analyze baseline vs. current activity
        </p>

        {/* View Mode Toggle */}
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

  const { baseline, activity, comparison } = data;

  return (
    <div className="space-y-4">
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

      {/* Baseline Comparison */}
      {comparison.available && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-purple-50">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Before vs. After</h3>
              <p className="text-xs text-gray-600">Baseline comparison</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* ROSCA Experience */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 font-bold mb-2">ROSCA Experience</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Before</p>
                  <p className="font-semibold text-gray-900">{comparison.roscaExperience.before}</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">After</p>
                  <p className="font-semibold text-teal-600">{comparison.roscaExperience.after}</p>
                </div>
              </div>
            </div>

            {/* Financial Goals */}
            {comparison.financialGoals.stated.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 font-bold mb-2">Financial Goals</p>
                {comparison.financialGoals.stated.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <CheckCircle size={16} className="text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
