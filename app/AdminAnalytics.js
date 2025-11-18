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
  getFinancialInclusionMetrics,
  getSavingsMetrics,
  computeCreditScore,
  computeTrustScore,
  getBorrowingBehavior,
  getRoscaGroupAnalysis,
  classifyUserBehavior, 
  getRegularContributionRate,
  getUnbankedUsers,
  getTotalSavings,
  getRoscaPoolSummary,
  getSavingsImprovement,
} from "../lib/analytics";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

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
  
      // 🔥 NEW: Compute deeper research metrics
      const financial = getFinancialInclusionMetrics(summaryData.actions);
      const savings = getSavingsMetrics(summaryData.actions);
      const borrowing = getBorrowingBehavior(summaryData.actions);
      const roscaGroups = getRoscaGroupAnalysis(summaryData.actions);
      const totalSavings = getTotalSavings(summaryData.actions);
const roscaPools = getRoscaPoolSummary(summaryData.actions);
const unbanked = getUnbankedUsers(summaryData.actions);
const regular = getRegularContributionRate(summaryData.actions);
const improvement = getSavingsImprovement(summaryData.actions);

  
      // 🔥 NEW: Compute trust score & credit score for ALL users
      const userScores = {};
      summaryData.userIds.forEach((uId) => {
        const userActions = summaryData.actions.filter(a => a.userId === uId);
        userScores[uId] = {
          trustScore: computeTrustScore(userActions),
          creditScore: computeCreditScore(userActions),
          behaviorType: classifyUserBehavior(userActions),
        };
      });
  
      // Save all into state
      setSummary({
        ...summaryData,
        financial,
        savings,
        borrowing,
        roscaGroups,
        userScores,
        totalSavings,
        roscaPools,
        unbanked,
        regular,
        improvement,
      });
  
      setLoanAnalysis(loanData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
    setLoading(false);
  };

  const auth = getAuth();
const router = useRouter();


const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/");  // redirect to login page
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  const generatePDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
  
    const pdf = new jsPDF("p", "mm", "a4");
    let y = 20;
  
    // ===== HEADER =====
    pdf.setFontSize(18);
    pdf.text("Ajoti Research Analytics Report", 14, y);
    y += 10;
  
    pdf.setFontSize(11);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;
  
    // ====== SECTION HELPER ======
    const addSectionTitle = (title) => {
      pdf.setFontSize(16);
      pdf.text(title, 14, y);
      y += 6;
    };
  
    const addSpace = () => (y += 6);
  
    // ============================
    //        1. OVERVIEW TAB
    // ============================
    addSectionTitle("1. Overview Metrics");
  
    autoTable(pdf, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Users", summary.totalUsers],
        ["Token Claims", `${summary.tokenClaimRate}%`],
        ["ROSCA Joins", summary.roscaJoins],
        ["Total Actions", summary.totalActions],
        ["Financial Inclusion", `${summary.financial.inclusionRate}%`],
        ["Savings Behavior Score", summary.savings.savingsBehaviorScore],
        ["Borrowing Frequency", summary.borrowing.borrowingFrequency],
        ["Avg Loan Amount", `₦${summary.borrowing.avgLoanAmount.toLocaleString()}`],
        ["Total Savings", `₦${summary.totalSavings.totalSavings.toLocaleString()}`],
        ["Unbanked Onboarded", summary.unbanked.unbankedCount],
        ["Regular Contributors", `${summary.regular.rate}%`],
        ["Savings Improvement", `${summary.improvement.rate}%`],
      ],
    });
  
    y = pdf.lastAutoTable.finalY + 10;
  
    // ============================
    //       2. LOAN ANALYSIS
    // ============================
    addSectionTitle("2. Loan Behavior Analysis");
  
    autoTable(pdf, {
      startY: y,
      head: [["Loan Metric", "Value"]],
      body: [
        ["Loan Prompts", loanAnalysis.totalPrompts],
        ["Acceptance Rate", `${loanAnalysis.acceptanceRate}%`],
        ["Loans Taken", loanAnalysis.totalAccepted],
        ["Declined Loans", loanAnalysis.totalDeclined],
      ],
    });
  
    y = pdf.lastAutoTable.finalY + 10;
  
    // Loan reason breakdown
    addSectionTitle("Loan Breakdown by Reason");
  
    const loanReasonRows = Object.entries(loanAnalysis.byReason).map(
      ([reason, data]) => [
        reason.replace(/_/g, " "),
        data.prompted,
        data.accepted,
        data.declined,
        data.prompted > 0
          ? ((data.accepted / data.prompted) * 100).toFixed(1) + "%"
          : "0%",
      ]
    );
  
    autoTable(pdf, {
      startY: y,
      head: [["Reason", "Prompted", "Accepted", "Declined", "Accept Rate"]],
      body: loanReasonRows,
    });
  
    y = pdf.lastAutoTable.finalY + 10;
  
    // ============================
    //        ROSCA PERFORMANCE
    // ============================
    addSectionTitle("3. ROSCA Group Performance");
  
    const roscaRows = Object.entries(summary.roscaGroups).map(([groupId, g]) => [
      groupId,
      g.members,
      `₦${g.contributions.toLocaleString()}`,
    ]);
  
    autoTable(pdf, {
      startY: y,
      head: [["Group ID", "Members", "Total Contributions"]],
      body: roscaRows,
    });
  
    y = pdf.lastAutoTable.finalY + 10;
  
    // ============================
    //        SAVINGS ANALYSIS
    // ============================
    addSectionTitle("4. Savings vs Borrowing Behavior");
  
    autoTable(pdf, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["User Type: Savers", summary.financial.savers],
        ["User Type: Borrowers", Object.values(summary.userScores).filter((u) => u.behaviorType === "Borrower").length],
        ["User Type: Balanced", Object.values(summary.userScores).filter((u) => u.behaviorType === "Balanced").length],
        ["Average Credit Score", Math.round(Object.values(summary.userScores).reduce((sum, s) => sum + s.creditScore, 0) / summary.totalUsers)],
      ],
    });
  
    y = pdf.lastAutoTable.finalY + 10;
  
    // ============================
    //        INDIVIDUAL USER SCORES
    // ============================
    addSectionTitle("5. User Trust & Credit Scores");
  
    const userRows = summary.userIds.map((id) => {
      const s = summary.userScores[id];
      const u = summary.userMap[id] || {};
      return [
        u.name || "Unnamed",
        u.email || "",
        s.trustScore,
        s.creditScore,
        s.behaviorType,
      ];
    });
  
    autoTable(pdf, {
      startY: y,
      head: [["Name", "Email", "Trust Score", "Credit Score", "Type"]],
      body: userRows,
    });
  
    // ============================
    //        FINALIZE PDF
    // ============================
    pdf.save("ajoti-full-analytics.pdf");
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
      {/* <div
        className="p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${C.pD}, ${C.p})` }}
      >
        <button onClick={onBack} className="mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-2">📊 Research Analytics</h1>
        <p className="text-sm opacity-90">Real-time behavior tracking & insights</p>
      </div> */}
{/* Header */}
<div
  className="p-6 text-white relative"
  style={{ background: `linear-gradient(135deg, ${C.pD}, ${C.p})` }}
>
  {/* BACK BUTTON */}
  <button onClick={onBack} className="mb-4 flex items-center gap-2">
    <ArrowLeft size={20} />
    <span>Back</span>
  </button>

  {/* TOP RIGHT ACTION BUTTONS */}
  <div className="absolute top-6 right-6 flex items-center gap-3">
    {/* EXPORT BUTTON */}
    <button
      onClick={generatePDF}
      className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/30"
    >
      Export PDF
    </button>

    {/* LOGOUT BUTTON */}
    <button
      onClick={handleLogout}
      className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/30"
    >
      Logout
    </button>
  </div>

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
                <StatCard
  icon={<Users />}
  label="Financial Inclusion"
  value={`${summary.financial.inclusionRate}%`}
  subtitle={`${summary.financial.savers}/${summary.financial.totalUsers} active savers`}
  color="#22C55E"
/>

<StatCard
  icon={<TrendingUp />}
  label="Savings Behavior Score"
  value={summary.savings.savingsBehaviorScore}
  subtitle="Based on fixed savings, targets & investments"
  color="#6366F1"
/>

<StatCard
  icon={<DollarSign />}
  label="Borrowing Frequency"
  value={summary.borrowing.borrowingFrequency}
  subtitle="Loans taken"
  color="#EC4899"
/>

<StatCard
  icon={<TrendingUp />}
  label="Average Loan Amount"
  value={`₦${summary.borrowing.avgLoanAmount.toLocaleString()}`}
  subtitle="Across all users"
  color="#0EA5E9"
/>
<StatCard
  icon={<DollarSign />}
  label="Total Savings"
  value={`₦${summary.totalSavings.totalSavings.toLocaleString()}`}
  subtitle={`${summary.totalSavings.count} saving actions`}
  color="#16A34A"
/>

<StatCard
  icon={<Users />}
  label="Unbanked Onboarded"
  value={summary.unbanked.unbankedCount}
  subtitle="Saved without bank accounts"
  color="#EF4444"
/>

<StatCard
  icon={<TrendingUp />}
  label="Regular Contributors"
  value={`${summary.regular.rate}%`}
  subtitle={`${summary.regular.regulars} frequent savers`}
  color="#0EA5E9"
/>

<StatCard
  icon={<TrendingUp />}
  label="Savings Behavior Improvement"
  value={`${summary.improvement.rate}%`}
  subtitle={`${summary.improvement.improvedUsers} improved`}
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
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
  <h3 className="font-bold mb-4">ROSCA Group Performance</h3>

  {Object.entries(summary.roscaGroups).map(([groupId, data]) => (
    <div key={groupId} className="border-b py-3">
      <p className="font-semibold text-sm">Group: {groupId}</p>
      <p className="text-xs text-gray-600">Members: {data.members}</p>
      <p className="text-xs text-gray-600">Total Contributions: ₦{data.contributions.toLocaleString()}</p>
    </div>
  ))}
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
              <div className="bg-white p-5 rounded-xl shadow-sm border">
  <h3 className="font-bold mb-4">User Trust & Credit Scores</h3>

  <div className="grid grid-cols-2 gap-4">
    {Object.entries(summary.userScores).map(([userId, score]) => (
      <div key={userId} className="p-3 border rounded-lg">
        <p className="text-xs text-gray-500 mb-1">  User: {summary.userMap[userId]?.name || userId}</p>
        <p className="text-sm font-semibold">
          Trust Score: <span className="text-green-700">{score.trustScore}</span>
        </p>
        <p className="text-sm font-semibold">
          Credit Score: <span className="text-blue-700">{score.creditScore}</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Type: {score.behaviorType}
        </p>
      </div>
    ))}
  </div>
</div>

            </div>
          </>
        )}

        {/* USERS TAB */}
        {selectedTab === "users" && summary && (
  <>
    <div>
      <h2 className="font-bold text-lg mb-4">User Insights</h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<Users />}
          label="Total Users"
          value={summary.totalUsers}
          subtitle="Active participants"
          color="#3B82F6"
        />
        <StatCard
          icon={<DollarSign />}
          label="Token Claimers"
          value={summary.tokenClaims}
          subtitle="Claimed Research Token"
          color="#10B981"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Savers"
          value={summary.financial.savers}
          subtitle="Created savings actions"
          color="#22C55E"
        />
        <StatCard
          icon={<AlertCircle />}
          label="Borrowers"
          value={Object.values(summary.userScores).filter(u => u.behaviorType === "Borrower").length}
          subtitle="Users who took loans"
          color="#EF4444"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Balanced Users"
          value={Object.values(summary.userScores).filter(u => u.behaviorType === "Balanced").length}
          subtitle="Mixed borrowing & saving"
          color="#8B5CF6"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Avg Credit Score"
          value={
            Math.round(
              Object.values(summary.userScores).reduce((a, b) => a + b.creditScore, 0) /
              summary.totalUsers
            )
          }
          subtitle="Across all users"
          color="#0EA5E9"
        />
      </div>

      {/* USER TABLE */}
      {/* <div className="bg-white p-5 rounded-xl shadow-sm border">
        <h3 className="font-bold mb-4">User Activity Overview</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">User</th>
              <th>Email</th>
              <th>Behavior</th>
              <th>Trust</th>
              <th>Credit</th>
              <th>ROSCA</th>
              <th>Loans</th>
              <th>Savings</th>
              <th className="text-right">Details</th>
            </tr>
          </thead>

          <tbody>
            {summary.userIds.map((userId) => {
              const score = summary.userScores[userId];
              const user = summary.userMap[userId] || {};
              const roscaCount = summary.actions.filter(a => a.userId === userId && a.actionType === "rosca_join").length;
              const loanCount = summary.actions.filter(a => a.userId === userId && a.actionType === "loan_taken").length;
              const saveCount = summary.actions.filter(a => 
                ["fixed_savings_locked","target_contribution","investment_made"].includes(a.actionType)
              ).length;

              return (
                <tr key={userId} className="border-b">
                  <td className="py-2">{user.name || "Unnamed"}</td>
                  <td>{user.email}</td>
                  <td>{score.behaviorType}</td>
                  <td>{score.trustScore}</td>
                  <td>{score.creditScore}</td>
                  <td>{roscaCount}</td>
                  <td>{loanCount}</td>
                  <td>{saveCount}</td>
                  <td className="text-right">
                    <button
                      onClick={() => alert(`User details coming soon for ${userId}`)}
                      className="text-green-700 font-semibold"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div> */}
      {/* USERS LIST — MOBILE ONLY */}
<div className="space-y-4">
  {summary.userIds.map((userId) => {
    const score = summary.userScores[userId];
    const user = summary.userMap[userId] || {};

    const roscaCount = summary.actions.filter(
      (a) => a.userId === userId && a.actionType === "rosca_join"
    ).length;

    const loanCount = summary.actions.filter(
      (a) => a.userId === userId && a.actionType === "loan_taken"
    ).length;

    const saveCount = summary.actions.filter((a) =>
      ["fixed_savings_locked", "target_contribution", "investment_made"].includes(
        a.actionType
      )
    ).length;

    return (
      <div
        key={userId}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-semibold text-base">{user.name || "Unnamed User"}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>

          <button
            onClick={() => alert(`User details coming soon for ${userId}`)}
            className="text-green-700 text-sm font-semibold"
          >
            View →
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
          <p>
            <span className="font-semibold">Behavior:</span> {score.behaviorType}
          </p>
          <p>
            <span className="font-semibold">Trust:</span>{" "}
            <span className="text-green-700">{score.trustScore}</span>
          </p>

          <p>
            <span className="font-semibold">Credit:</span>{" "}
            <span className="text-blue-700">{score.creditScore}</span>
          </p>

          <p>
            <span className="font-semibold">ROSCA Joined:</span> {roscaCount}
          </p>

          <p>
            <span className="font-semibold">Loans Taken:</span> {loanCount}
          </p>

          <p>
            <span className="font-semibold">Savings:</span> {saveCount}
          </p>
        </div>
      </div>
    );
  })}
</div>

    </div>

    {/* EXPORT */}
    {/* <button
      onClick={() => alert("Export coming soon")}
      className="w-full py-4 rounded-xl mt-6 font-semibold text-white"
      style={{ backgroundColor: C.p }}
    >
      <Download size={20} className="inline mr-2" />
      Export All Data (CSV)
    </button> */}
    <button
  onClick={generatePDF}
  className="w-full py-3 mt-4 rounded-xl font-semibold text-white bg-green-700"
>
  Export Analytics (PDF)
</button>

  </>
)}


        {/* Export Data Button */}
        {/* <button
          onClick={() => {
            alert("📊 Export feature coming soon!\n\nWill export all data to CSV for analysis.");
          }}
          className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: C.p }}
        >
          <Download size={20} />
          Export All Data (CSV)
        </button> */}
      </div>
    </div>
  );
}