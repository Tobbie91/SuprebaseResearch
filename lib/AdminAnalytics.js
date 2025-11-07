// app/AdminAnalytics.js
"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  getAnalyticsSummary,
  getLoanBehaviorAnalysis,
} from "../lib/analytics";

const C = {
  p: "#2D9B7B",
  pD: "#1F6B56",
  pL: "#A8E6CF",
};

export default function AdminAnalytics({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loanAnalysis, setLoanAnalysis] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const summaryData = await getAnalyticsSummary();
      const loanData = await getLoanBehaviorAnalysis();
      setSummary(summaryData);
      setLoanAnalysis(loanData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
    setLoading(false);
  };

  const StatCard = ({ icon, label, value, subtitle, color = C.p }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon, { size: 20, style: { color } })}
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="font-semibold text-sm mb-1">{label}</h3>
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-green-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div
        className="p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${C.pD}, ${C.p})` }}
      >
        <button onClick={onBack} className="mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-2">📊 Research Analytics</h1>
        <p className="text-sm opacity-90">Real-time behavior tracking & insights</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 py-3 flex gap-4 overflow-x-auto">
        {["overview", "loans", "savings", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`pb-2 border-b-2 font-semibold text-sm whitespace-nowrap capitalize ${
              selectedTab === tab
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="px-6 py-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* OVERVIEW TAB */}
        {selectedTab === "overview" && summary && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Users />}
                  label="Total Users"
                  value={summary.totalUsers}
                  subtitle="Registered testers"
                  color="#3B82F6"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Token Claims"
                  value={`${summary.tokenClaimRate}%`}
                  subtitle={`${summary.tokenClaims}/${summary.totalUsers} claimed`}
                  color="#10B981"
                />
                <StatCard
                  icon={<Users />}
                  label="ROSCA Joins"
                  value={summary.roscaJoins}
                  subtitle="Groups joined"
                  color="#F59E0B"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Total Actions"
                  value={summary.totalActions}
                  subtitle="All tracked events"
                  color="#8B5CF6"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <h3 className="font-bold text-lg mb-2">🎯 Research Goal Status</h3>
              <p className="text-sm opacity-90 mb-4">
                Testing loan behavior with {summary.totalUsers} participants
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Target: 200 users</span>
                  <span className="text-lg font-bold">
                    {((summary.totalUsers / 200) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${(summary.totalUsers / 200) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* LOANS TAB */}
        {selectedTab === "loans" && loanAnalysis && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">Loan Behavior Analysis</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard
                  icon={<AlertCircle />}
                  label="Loan Prompts"
                  value={loanAnalysis.totalPrompts}
                  subtitle="Times users were offered loans"
                  color="#F59E0B"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Acceptance Rate"
                  value={`${loanAnalysis.acceptanceRate}%`}
                  subtitle={`${loanAnalysis.totalAccepted} accepted`}
                  color="#10B981"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Loans Taken"
                  value={loanAnalysis.totalAccepted}
                  subtitle="Total loans borrowed"
                  color="#3B82F6"
                />
                <StatCard
                  icon={<Users />}
                  label="Declined"
                  value={loanAnalysis.totalDeclined}
                  subtitle="Users who said no"
                  color="#EF4444"
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border">
                <h3 className="font-bold mb-4">Loan Prompts by Reason</h3>
                <div className="space-y-3">
                  {Object.entries(loanAnalysis.byReason || {}).map(([reason, data]) => {
                    const acceptRate = data.prompted > 0 
                      ? ((data.accepted / data.prompted) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <div key={reason} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm capitalize">
                            {reason.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {acceptRate}% accepted
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Prompted:</span>
                            <span className="font-semibold">{data.prompted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accepted:</span>
                            <span className="font-semibold text-green-600">{data.accepted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Declined:</span>
                            <span className="font-semibold text-red-600">{data.declined}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
              <h3 className="font-bold text-yellow-900 mb-2">💡 Key Insights</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• {loanAnalysis.acceptanceRate}% of users accept loan offers when prompted</li>
                <li>• Most common reason: ROSCA contributions</li>
                <li>• Users are {loanAnalysis.acceptanceRate > 50 ? 'more' : 'less'} likely to borrow than save</li>
              </ul>
            </div>
          </>
        )}

        {/* SAVINGS TAB */}
        {selectedTab === "savings" && summary && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">Savings Behavior</h2>
              <div className="bg-white p-5 rounded-xl shadow-sm border text-center py-12">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Detailed savings analytics coming soon...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Will show: Fixed Savings vs Target Savings vs Investments
                </p>
              </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {selectedTab === "users" && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">User Profiles</h2>
              <div className="bg-white p-5 rounded-xl shadow-sm border text-center py-12">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Individual user behavior profiles coming soon...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Will show: Saver vs Borrower classification per user
                </p>
              </div>
            </div>
          </>
        )}

        {/* Export Data Button */}
        <button
          onClick={() => {
            alert("📊 Export feature coming soon!\n\nWill export all data to CSV for analysis.");
          }}
          className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: C.p }}
        >
          <Download size={20} />
          Export All Data (CSV)
        </button>
      </div>
    </div>
  );
}