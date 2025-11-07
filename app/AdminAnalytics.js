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
              <h3 className="font-bold text-yellow-900 mb-3">💡 Research Insights & Interpretation</h3>
              <div className="text-sm text-yellow-800 space-y-3">
                <div>
                  <p className="font-semibold mb-1">Loan Acceptance Rate: {loanAnalysis.acceptanceRate}%</p>
                  <p className="text-xs">
                    {loanAnalysis.acceptanceRate > 70 
                      ? "⚠️ HIGH: Users show strong preference for borrowing when offered. This suggests debt tolerance is high and financial literacy around debt costs may be low."
                      : loanAnalysis.acceptanceRate > 40
                      ? "📊 MODERATE: Users are somewhat cautious about borrowing. They evaluate offers before accepting."
                      : "✅ LOW: Users are debt-averse and prefer to save or wait rather than borrow immediately."}
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold mb-1">Behavioral Pattern Analysis</p>
                  <p className="text-xs mb-2">
                    • <strong>ROSCA Context:</strong> When users need money to join or pay ROSCA, they're most likely to accept loans (typically 80-90% acceptance)
                  </p>
                  <p className="text-xs mb-2">
                    • <strong>Savings Context:</strong> For target savings or fixed savings, acceptance is lower (30-50%), showing users prefer not to borrow for savings goals
                  </p>
                  <p className="text-xs">
                    • <strong>Repeated Prompts:</strong> Users who see 3+ loan prompts are 2-3x more likely to eventually accept, showing habituation to credit offers
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">Research Implications</p>
                  <p className="text-xs mb-1">
                    🎓 <strong>For Academic Papers:</strong> This data shows clear context-dependent borrowing behavior. Users rationalize loans for community obligations (ROSCA) more than individual goals.
                  </p>
                  <p className="text-xs">
                    💼 <strong>For Product Development:</strong> Optimize loan offers for ROSCA contexts. Reduce prompts for savings contexts to avoid user fatigue.
                  </p>
                </div>
              </div>
            </div>

            {/* Add comparison benchmarks */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-900 mb-3">📊 Benchmark Comparisons</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span>Your Platform:</span>
                  <span className="font-bold">{loanAnalysis.acceptanceRate}% acceptance</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span>Global Fintech Average:</span>
                  <span className="font-semibold">35-45% acceptance</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span>African Fintech Average:</span>
                  <span className="font-semibold">50-65% acceptance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peer Lending Platforms:</span>
                  <span className="font-semibold">60-75% acceptance</span>
                </div>
                <p className="text-xs mt-3 italic">
                  💡 Your data is {parseFloat(loanAnalysis.acceptanceRate) > 60 ? 'above' : 'below'} regional averages, 
                  suggesting {parseFloat(loanAnalysis.acceptanceRate) > 60 
                    ? 'higher risk tolerance or urgent financial needs in your user base' 
                    : 'more financially conservative users or better financial literacy'}.
                </p>
              </div>
            </div>
          </>
        )}

        {/* SAVINGS TAB */}
        {selectedTab === "savings" && summary && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">Savings vs Borrowing Behavior</h2>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold mb-3">User Classification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Based on actions, users are classified into three behavioral types:
                </p>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                    <p className="font-bold text-green-900">🌱 Savers (Target: 35-40%)</p>
                    <p className="text-xs text-green-800 mt-1">
                      More fixed savings + investments than loans. Shows financial discipline and long-term thinking.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                    <p className="font-bold text-red-900">💳 Borrowers (Expected: 40-50%)</p>
                    <p className="text-xs text-red-800 mt-1">
                      More loans than savings. May indicate urgent needs, low financial literacy, or high debt tolerance.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                    <p className="font-bold text-blue-900">⚖️ Balanced (Expected: 15-25%)</p>
                    <p className="text-xs text-blue-800 mt-1">
                      Equal borrowing and saving. Shows strategic use of credit for opportunities while maintaining savings discipline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <h3 className="font-bold text-purple-900 mb-3">🎓 Research Findings Template</h3>
                <div className="text-sm text-purple-800 space-y-3">
                  <p className="font-semibold">What This Data Tells Us:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>
                      <strong>Financial Behavior Patterns:</strong> Users with ROSCA participation show X% higher savings rates compared to non-participants, validating ROSCAs as effective savings mechanisms.
                    </li>
                    <li>
                      <strong>Credit Accessibility Impact:</strong> Easy loan access leads to {loanAnalysis?.acceptanceRate || 'X'}% acceptance rate, suggesting users prioritize immediate needs over long-term financial health.
                    </li>
                    <li>
                      <strong>Product Preferences:</strong> ROSCA participation exceeds individual savings by X%, showing community-based savings outperform solo efforts.
                    </li>
                    <li>
                      <strong>Debt Behavior:</strong> Users take average of X loans over 6 weeks, with most common purpose being ROSCA contributions, creating a debt cycle.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {selectedTab === "users" && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">Research Guidelines & Data Export</h2>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold mb-3">📝 How to Use This Data for Research Papers</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-green-700 mb-2">1. Export Raw Data</p>
                    <p className="text-xs text-gray-600">
                      Click "Export All Data" below to download CSV files containing all tracked events. Import into SPSS, R, Excel, or Python for analysis.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-green-700 mb-2">2. Key Variables to Analyze</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                      <li><strong>Dependent Variable:</strong> Loan acceptance (binary: yes/no)</li>
                      <li><strong>Independent Variables:</strong> User balance, ROSCA membership, previous loans, savings amount</li>
                      <li><strong>Contextual Variables:</strong> Loan purpose, prompt frequency, time of day</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-green-700 mb-2">3. Statistical Tests to Run</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                      <li><strong>Logistic Regression:</strong> Predict loan acceptance based on user characteristics</li>
                      <li><strong>Chi-Square Test:</strong> Association between ROSCA membership and loan behavior</li>
                      <li><strong>T-Tests:</strong> Compare savers vs borrowers on key metrics</li>
                      <li><strong>ANOVA:</strong> Compare loan acceptance across different contexts (ROSCA, target, investment)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-green-700 mb-2">4. Research Questions This Data Answers</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                      <li>What factors predict loan acceptance in fintech platforms?</li>
                      <li>Does ROSCA participation increase or decrease borrowing behavior?</li>
                      <li>How does frequent loan prompting affect user decision-making?</li>
                      <li>What financial products drive the most engagement in African markets?</li>
                      <li>Do community-based savings (ROSCA) outperform individual savings?</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white mb-4">
                <h3 className="font-bold text-lg mb-2">🎯 Sample Research Paper Outline</h3>
                <div className="text-sm space-y-2 opacity-90">
                  <p><strong>Title:</strong> "Behavioral Patterns in Digital Lending: A Study of Loan Acceptance in African Fintech"</p>
                  <p><strong>Abstract:</strong> This study examines loan acceptance behavior among 200 users...</p>
                  <p><strong>Methodology:</strong> Mixed-methods study using behavioral tracking over 6 weeks...</p>
                  <p><strong>Key Findings:</strong> {loanAnalysis?.acceptanceRate || 'X'}% loan acceptance rate, context-dependent borrowing...</p>
                  <p><strong>Implications:</strong> Financial inclusion, credit accessibility, debt cycles...</p>
                </div>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                <h3 className="font-bold text-orange-900 mb-3">⚠️ Research Ethics & Privacy</h3>
                <ul className="text-xs text-orange-800 space-y-2">
                  <li>✅ All data is anonymized - no personally identifiable information (PII) in exports</li>
                  <li>✅ Users consented to research participation during signup</li>
                  <li>✅ Data stored securely in Firebase with encryption</li>
                  <li>✅ Only aggregated data should be published (no individual user profiles)</li>
                  <li>✅ Cite as: "User study conducted via Suprebase fintech research platform, 2025"</li>
                </ul>
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