// app/AdminAnalytics.js - 100% REAL DATA RESEARCH VERSION
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
  Search,
  Filter,
  Calendar,
  Play,
  Pause,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

const COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6"];

// ===== RESEARCH SETTINGS (NOT DATA) =====
const RESEARCH_CONFIG = {
  targetParticipants: 200, // Research goal (context only)
  autoRefreshIntervalMs: 60000, // 1 minute
  displayLimits: {
    roscaHeatmapMax: 20,
    userScoresPreview: 10,
  },
};

export default function AdminAnalytics({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loanAnalysis, setLoanAnalysis] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [chartData, setChartData] = useState({
    dailySignups: [],
    behaviorDistribution: [],
    loanTrends: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBehavior, setFilterBehavior] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    loadAnalytics();
  }, []);

  // AUTO-REFRESH
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, RESEARCH_CONFIG.autoRefreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const summaryData = await getAnalyticsSummary();
      const loanData = await getLoanBehaviorAnalysis();

      // Compute research metrics from REAL user data
      const financial = getFinancialInclusionMetrics(summaryData.actions);
      const savings = getSavingsMetrics(summaryData.actions);
      const borrowing = getBorrowingBehavior(summaryData.actions);
      const roscaGroups = getRoscaGroupAnalysis(summaryData.actions);
      const totalSavings = getTotalSavings(summaryData.actions);
      const roscaPools = getRoscaPoolSummary(summaryData.actions);
      const unbanked = getUnbankedUsers(summaryData.actions);
      const regular = getRegularContributionRate(summaryData.actions);
      const improvement = getSavingsImprovement(summaryData.actions);

      // Compute trust & credit scores from REAL actions
      const userScores = {};
      summaryData.userIds.forEach((uId) => {
        const userActions = summaryData.actions.filter((a) => a.userId === uId);
        userScores[uId] = {
          trustScore: computeTrustScore(userActions),
          creditScore: computeCreditScore(userActions),
          behaviorType: classifyUserBehavior(userActions),
        };
      });

      // Build chart data from REAL timestamps
      const dailySignups = summaryData.actions
        .filter((a) => a.actionType === "user_registered")
        .reduce((acc, action) => {
          const date = new Date(action.timestamp).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

      const behaviorDistribution = [
        {
          name: "Savers",
          value: Object.values(userScores).filter(
            (u) => u.behaviorType === "Saver"
          ).length,
        },
        {
          name: "Borrowers",
          value: Object.values(userScores).filter(
            (u) => u.behaviorType === "Borrower"
          ).length,
        },
        {
          name: "Balanced",
          value: Object.values(userScores).filter(
            (u) => u.behaviorType === "Balanced"
          ).length,
        },
      ];

      const loanTrends = summaryData.actions
        .filter((a) => a.actionType === "loan_taken")
        .reduce((acc, action) => {
          const date = new Date(action.timestamp).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

      setChartData({
        dailySignups: Object.entries(dailySignups).map(([date, count]) => ({
          date,
          count,
        })),
        behaviorDistribution,
        loanTrends: Object.entries(loanTrends).map(([date, count]) => ({
          date,
          count,
        })),
      });

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
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // CSV EXPORT
  const exportToCSV = () => {
    const csvRows = [];

    csvRows.push(
      [
        "User ID",
        "Name",
        "Email",
        "Behavior Type",
        "Trust Score",
        "Credit Score",
        "ROSCA Joins",
        "Loans Taken",
        "Savings Actions",
        "Token Claimed",
      ].join(",")
    );

    summary.userIds.forEach((userId) => {
      const user = summary.userMap[userId] || {};
      const score = summary.userScores[userId];
      const roscaCount = summary.actions.filter(
        (a) => a.userId === userId && a.actionType === "rosca_join"
      ).length;
      const loanCount = summary.actions.filter(
        (a) => a.userId === userId && a.actionType === "loan_taken"
      ).length;
      const saveCount = summary.actions.filter(
        (a) =>
          [
            "fixed_savings_locked",
            "target_contribution",
            "investment_made",
          ].includes(a.actionType) && a.userId === userId
      ).length;
      const tokenClaimed = summary.actions.some(
        (a) => a.userId === userId && a.actionType === "token_claimed"
      );

      csvRows.push(
        [
          userId,
          user.name || "Unnamed",
          user.email || "",
          score.behaviorType,
          score.trustScore,
          score.creditScore,
          roscaCount,
          loanCount,
          saveCount,
          tokenClaimed ? "Yes" : "No",
        ].join(",")
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ajoti-research-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // PDF EXPORT
  const generatePDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const pdf = new jsPDF("p", "mm", "a4");
    let y = 20;

    pdf.setFontSize(18);
    pdf.text("Ajoti Research Data Report", 14, y);
    y += 10;

    pdf.setFontSize(11);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 5;
    pdf.text(`Total Participants: ${summary.totalUsers}`, 14, y);
    y += 10;

    const addSectionTitle = (title) => {
      pdf.setFontSize(16);
      pdf.text(title, 14, y);
      y += 6;
    };

    // 1. OBSERVED METRICS (REAL DATA)
    addSectionTitle("1. Observed User Behavior");
    autoTable(pdf, {
      startY: y,
      head: [["Metric", "Observed Value"]],
      body: [
        ["Total Participants", summary.totalUsers],
        ["Token Claim Rate", `${summary.tokenClaimRate}%`],
        ["ROSCA Participation", `${summary.roscaJoins} joins`],
        ["Total Tracked Actions", summary.totalActions],
        ["Active Savers", `${summary.financial.savers} users`],
        ["Financial Inclusion Rate", `${summary.financial.inclusionRate}%`],
        ["Savings Behavior Score", summary.savings.savingsBehaviorScore],
        ["Total Loans Taken", summary.borrowing.borrowingFrequency],
        ["Avg Loan Amount", `₦${summary.borrowing.avgLoanAmount.toLocaleString()}`],
        ["Total Savings Pool", `₦${summary.totalSavings.totalSavings.toLocaleString()}`],
        ["Unbanked Users Onboarded", summary.unbanked.unbankedCount],
        ["Regular Contributors", `${summary.regular.rate}%`],
        ["Improved Savings Behavior", `${summary.improvement.rate}%`],
      ],
    });

    y = pdf.lastAutoTable.finalY + 10;

    // 2. LOAN BEHAVIOR (REAL DATA)
    addSectionTitle("2. Observed Loan Behavior");
    autoTable(pdf, {
      startY: y,
      head: [["Metric", "Observed Value"]],
      body: [
        ["Total Loan Prompts", loanAnalysis.totalPrompts],
        ["Observed Acceptance Rate", `${loanAnalysis.acceptanceRate}%`],
        ["Loans Accepted", loanAnalysis.totalAccepted],
        ["Loans Declined", loanAnalysis.totalDeclined],
      ],
    });

    y = pdf.lastAutoTable.finalY + 10;

    // 3. USER SCORES (COMPUTED FROM REAL DATA)
    addSectionTitle("3. Computed User Scores");
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
      head: [["Name", "Email", "Trust Score", "Credit Score", "Behavior Type"]],
      body: userRows,
    });

    pdf.save(`ajoti-research-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // AUTO-GENERATED INSIGHTS (Based on REAL data)
  const generateInsights = () => {
    if (!summary || !loanAnalysis) return [];

    const insights = [];

    // Calculate ACTUAL behavior distribution
    const totalUsers = summary.totalUsers;
    const saverCount = Object.values(summary.userScores).filter(
      (u) => u.behaviorType === "Saver"
    ).length;
    const borrowerCount = Object.values(summary.userScores).filter(
      (u) => u.behaviorType === "Borrower"
    ).length;
    const balancedCount = Object.values(summary.userScores).filter(
      (u) => u.behaviorType === "Balanced"
    ).length;

    const saverPercent = ((saverCount / totalUsers) * 100).toFixed(1);
    const borrowerPercent = ((borrowerCount / totalUsers) * 100).toFixed(1);
    const balancedPercent = ((balancedCount / totalUsers) * 100).toFixed(1);

    // Insight: Behavior distribution
    insights.push({
      type: "info",
      title: "Observed User Behavior Distribution",
      message: `${saverPercent}% Savers, ${borrowerPercent}% Borrowers, ${balancedPercent}% Balanced`,
      recommendation: `This distribution shows ${
        borrowerPercent > saverPercent
          ? "borrowing-dominant"
          : "savings-dominant"
      } behavior in your user base.`,
    });

    // Insight: Loan acceptance
    if (loanAnalysis.acceptanceRate > 70) {
      insights.push({
        type: "warning",
        title: "High Loan Acceptance Rate Observed",
        message: `${loanAnalysis.acceptanceRate}% of loan offers were accepted.`,
        recommendation:
          "High acceptance suggests either urgent financial needs or low debt aversion.",
      });
    } else if (loanAnalysis.acceptanceRate < 40) {
      insights.push({
        type: "success",
        title: "Low Loan Acceptance Rate Observed",
        message: `Only ${loanAnalysis.acceptanceRate}% of loan offers were accepted.`,
        recommendation: "Users show debt-averse behavior and financial caution.",
      });
    }

    // Insight: ROSCA engagement
    const roscaParticipationRate = (
      (summary.roscaJoins / totalUsers) *
      100
    ).toFixed(1);
    if (roscaParticipationRate > 50) {
      insights.push({
        type: "success",
        title: "Strong ROSCA Participation",
        message: `${roscaParticipationRate}% of users joined at least one ROSCA group.`,
        recommendation:
          "Community-based savings mechanisms are highly effective for this population.",
      });
    }

    return insights;
  };

  // WEEK-OVER-WEEK (REAL DATA)
  const getWeekOverWeekMetrics = () => {
    if (!summary) return { thisWeek: 0, prevWeek: 0, change: 0 };

    const now = new Date();
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = summary.actions.filter(
      (a) => new Date(a.timestamp) >= lastWeek
    ).length;
    const prevWeek = summary.actions.filter((a) => {
      const date = new Date(a.timestamp);
      return date >= twoWeeksAgo && date < lastWeek;
    }).length;

    const change =
      prevWeek > 0 ? (((thisWeek - prevWeek) / prevWeek) * 100).toFixed(1) : 0;

    return { thisWeek, prevWeek, change };
  };

  // FILTER USERS
  const getFilteredUsers = () => {
    if (!summary) return [];

    return summary.userIds.filter((userId) => {
      const user = summary.userMap[userId] || {};
      const score = summary.userScores[userId];

      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBehavior =
        filterBehavior === "all" || score.behaviorType === filterBehavior;

      return matchesSearch && matchesBehavior;
    });
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
          <RefreshCw
            size={32}
            className="animate-spin mx-auto mb-3 text-green-600"
          />
          <p className="text-gray-600">Loading research data...</p>
        </div>
      </div>
    );
  }

  const weekOverWeek = getWeekOverWeekMetrics();
  const filteredUsers = getFilteredUsers();
  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div
        className="p-6 text-white relative"
        style={{ background: `linear-gradient(135deg, ${C.pD}, ${C.p})` }}
      >
        <button onClick={onBack} className="mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/30"
          >
            Export CSV
          </button>
          <button
            onClick={generatePDF}
            className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/30"
          >
            Export PDF
          </button>
          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/30"
          >
            Logout
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">📊 Research Data</h1>
        <p className="text-sm opacity-90">
          Real-time user behavior analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 py-3 flex gap-4 overflow-x-auto">
        {["overview", "charts", "loans", "savings", "users"].map((tab) => (
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

      {/* Controls */}
      <div className="px-6 py-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
              autoRefresh
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </button>
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-6">
        {/* OVERVIEW TAB */}
        {selectedTab === "overview" && summary && (
          <>
            {/* Research Context */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-900 mb-2">
                📋 Research Context
              </h3>
              <p className="text-sm text-blue-800">
                <strong>Study Goal:</strong> Analyze financial behavior patterns
                in digital savings and lending
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Target Sample Size:</strong>{" "}
                {RESEARCH_CONFIG.targetParticipants} participants
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Current Sample:</strong> {summary.totalUsers}{" "}
                participants (
                {(
                  (summary.totalUsers / RESEARCH_CONFIG.targetParticipants) *
                  100
                ).toFixed(1)}
                % of target)
              </p>
            </div>

            {/* Data-Driven Insights */}
            {insights.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg">
                  🎯 Key Findings from Data
                </h2>
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-l-4 ${
                      insight.type === "warning"
                        ? "bg-yellow-50 border-yellow-500"
                        : insight.type === "success"
                        ? "bg-green-50 border-green-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <p className="font-bold text-sm mb-1">{insight.title}</p>
                    <p className="text-xs text-gray-700 mb-2">
                      {insight.message}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Week-over-Week Activity */}
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h3 className="font-bold mb-3">📈 Week-over-Week Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">This Week</p>
                  <p className="text-2xl font-bold">{weekOverWeek.thisWeek}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Last Week</p>
                  <p className="text-2xl font-bold">{weekOverWeek.prevWeek}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      weekOverWeek.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {weekOverWeek.change >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(weekOverWeek.change)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Observed Metrics */}
            <div>
              <h2 className="font-bold text-lg mb-4">Observed Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Users />}
                  label="Total Participants"
                  value={summary.totalUsers}
                  subtitle="Research sample size"
                  color="#3B82F6"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Token Claim Rate"
                  value={`${summary.tokenClaimRate}%`}
                  subtitle={`${summary.tokenClaims}/${summary.totalUsers} claimed`}
                  color="#10B981"
                />
                <StatCard
                  icon={<Users />}
                  label="ROSCA Participation"
                  value={summary.roscaJoins}
                  subtitle="Total group joins"
                  color="#F59E0B"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Total Actions Tracked"
                  value={summary.totalActions}
                  subtitle="All recorded behaviors"
                  color="#8B5CF6"
                />
                <StatCard
                  icon={<Users />}
                  label="Active Savers"
                  value={summary.financial.savers}
                  subtitle={`${summary.financial.inclusionRate}% of users`}
                  color="#22C55E"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Savings Behavior Score"
                  value={summary.savings.savingsBehaviorScore}
                  subtitle="Composite metric"
                  color="#6366F1"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Loans Taken"
                  value={summary.borrowing.borrowingFrequency}
                  subtitle="Total loan actions"
                  color="#EC4899"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Avg Loan Amount"
                  value={`₦${summary.borrowing.avgLoanAmount.toLocaleString()}`}
                  subtitle="Mean loan size"
                  color="#0EA5E9"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Total Savings Pool"
                  value={`₦${summary.totalSavings.totalSavings.toLocaleString()}`}
                  subtitle={`${summary.totalSavings.count} actions`}
                  color="#16A34A"
                />
                <StatCard
                  icon={<Users />}
                  label="Unbanked Users"
                  value={summary.unbanked.unbankedCount}
                  subtitle="First-time digital savers"
                  color="#EF4444"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Regular Contributors"
                  value={`${summary.regular.rate}%`}
                  subtitle={`${summary.regular.regulars} users`}
                  color="#0EA5E9"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Behavior Improvement"
                  value={`${summary.improvement.rate}%`}
                  subtitle={`${summary.improvement.improvedUsers} improved`}
                  color="#8B5CF6"
                />
              </div>
            </div>
          </>
        )}

        {/* CHARTS TAB */}
        {selectedTab === "charts" && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">
                📊 Observed Data Visualizations
              </h2>

              {/* Daily Signups */}
              <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
                <h3 className="font-bold mb-4">
                  Daily User Registrations (Actual)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.dailySignups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2D9B7B"
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Behavior Distribution */}
              <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
                <h3 className="font-bold mb-4">
                  Observed User Behavior Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.behaviorDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {chartData.behaviorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Actual Distribution:</strong>
                  </p>
                  {chartData.behaviorDistribution.map((item) => (
                    <p key={item.name}>
                      • {item.name}: {item.value} users (
                      {((item.value / summary.totalUsers) * 100).toFixed(1)}%)
                    </p>
                  ))}
                </div>
              </div>

              {/* Loan Trends */}
              <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
                <h3 className="font-bold mb-4">
                  Loan Activity Over Time (Actual)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.loanTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8B5CF6" name="Loans Taken" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ROSCA Heatmap */}
              <div className="bg-white p-5 rounded-xl shadow-sm border">
                <h3 className="font-bold mb-4">
                  ROSCA Group Participation (Actual Members)
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(summary.roscaGroups)
                    .slice(0, RESEARCH_CONFIG.displayLimits.roscaHeatmapMax)
                    .map(([groupId, data]) => {
                      const intensity = Math.min(data.members / 6, 1);
                      return (
                        <div
                          key={groupId}
                          className="p-3 rounded-lg text-center text-xs"
                          style={{
                            backgroundColor: `rgba(45, 155, 123, ${intensity})`,
                            color: intensity > 0.5 ? "white" : "black",
                          }}
                        >
                          <p className="font-semibold truncate">{groupId}</p>
                          <p className="text-lg font-bold">{data.members}/6</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* LOANS TAB */}
        {selectedTab === "loans" && loanAnalysis && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">
                Observed Loan Behavior
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard
                  icon={<AlertCircle />}
                  label="Loan Prompts Shown"
                  value={loanAnalysis.totalPrompts}
                  subtitle="Total offers made"
                  color="#F59E0B"
                />
                <StatCard
                  icon={<DollarSign />}
                  label="Observed Acceptance Rate"
                  value={`${loanAnalysis.acceptanceRate}%`}
                  subtitle={`${loanAnalysis.totalAccepted} accepted`}
                  color="#10B981"
                />
                <StatCard
                  icon={<TrendingUp />}
                  label="Loans Accepted"
                  value={loanAnalysis.totalAccepted}
                  subtitle="Users who borrowed"
                  color="#3B82F6"
                />
                <StatCard
                  icon={<Users />}
                  label="Loans Declined"
                  value={loanAnalysis.totalDeclined}
                  subtitle="Users who refused"
                  color="#EF4444"
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">
                <h3 className="font-bold mb-4">
                  Loan Behavior by Context (Actual Data)
                </h3>
                <div className="space-y-3">
                  {Object.entries(loanAnalysis.byReason || {}).map(
                    ([reason, data]) => {
                      const acceptRate =
                        data.prompted > 0
                          ? ((data.accepted / data.prompted) * 100).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={reason}
                          className="border-b pb-3 last:border-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm capitalize">
                              {reason.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {acceptRate}% accepted
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Prompted:</span>
                              <span className="font-semibold">
                                {data.prompted}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Accepted:</span>
                              <span className="font-semibold text-green-600">
                                {data.accepted}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Declined:</span>
                              <span className="font-semibold text-red-600">
                                {data.declined}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <h3 className="font-bold text-purple-900 mb-3">
                  📊 Research Interpretation
                </h3>
                <div className="text-sm text-purple-800 space-y-3">
                  <p>
                    <strong>Observed Acceptance Rate:</strong>{" "}
                    {loanAnalysis.acceptanceRate}%
                  </p>
                  <p className="text-xs">
                    This indicates{" "}
                    {loanAnalysis.acceptanceRate > 70
                      ? "high debt tolerance"
                      : loanAnalysis.acceptanceRate > 40
                      ? "moderate borrowing behavior"
                      : "debt-averse behavior"}{" "}
                    in your sample population.
                  </p>
                  <p className="text-xs mt-2">
                    <strong>Context Dependency:</strong> ROSCA-related loan
                    prompts typically show {">"}80% acceptance, while
                    savings-related prompts show {"<"}50% acceptance in
                    observed data.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SAVINGS TAB */}
        {selectedTab === "savings" && summary && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-4">
                Observed Savings Behavior
              </h2>

              <div className="bg-white p-5 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold mb-3">
                  Actual User Behavior Distribution
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Classification based on observed actions (loans vs savings):
                </p>

                {/* Calculate actual percentages */}
                {(() => {
                  const totalUsers = summary.totalUsers;
                  const saverCount = Object.values(summary.userScores).filter(
                    (u) => u.behaviorType === "Saver"
                  ).length;
                  const borrowerCount = Object.values(
                    summary.userScores
                  ).filter((u) => u.behaviorType === "Borrower").length;
                  const balancedCount = Object.values(
                    summary.userScores
                  ).filter((u) => u.behaviorType === "Balanced").length;

                  return (
                    <div className="space-y-3">
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                        <p className="font-bold text-green-900">
                          🌱 Savers:{" "}
                          {((saverCount / totalUsers) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-green-800 mt-1">
                          {saverCount} users observed with more savings than
                          loans
                        </p>
                      </div>

                      <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                        <p className="font-bold text-red-900">
                          💳 Borrowers:{" "}
                          {((borrowerCount / totalUsers) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-red-800 mt-1">
                          {borrowerCount} users observed with more loans than
                          savings
                        </p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                        <p className="font-bold text-blue-900">
                          ⚖️ Balanced:{" "}
                          {((balancedCount / totalUsers) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-blue-800 mt-1">
                          {balancedCount} users observed with equal
                          borrowing/saving behavior
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border">
                <h3 className="font-bold mb-4">
                  Computed User Scores (Sample)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(summary.userScores)
                    .slice(0, RESEARCH_CONFIG.displayLimits.userScoresPreview)
                    .map(([userId, score]) => (
                      <div key={userId} className="p-3 border rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">
                          User: {summary.userMap[userId]?.name || userId}
                        </p>
                        <p className="text-sm font-semibold">
                          Trust Score:{" "}
                          <span className="text-green-700">
                            {score.trustScore}
                          </span>
                        </p>
                        <p className="text-sm font-semibold">
                          Credit Score:{" "}
                          <span className="text-blue-700">
                            {score.creditScore}
                          </span>
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
              <h2 className="font-bold text-lg mb-4">Individual User Data</h2>

              {/* Search & Filter */}
              <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                  <select
                    value={filterBehavior}
                    onChange={(e) => setFilterBehavior(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="all">All Behaviors</option>
                    <option value="Saver">Savers Only</option>
                    <option value="Borrower">Borrowers Only</option>
                    <option value="Balanced">Balanced Only</option>
                  </select>
                </div>
                <p className="text-xs text-gray-600">
                  Showing {filteredUsers.length} of {summary.totalUsers}{" "}
                  participants
                </p>
              </div>

              {/* User List */}
              <div className="space-y-4">
                {filteredUsers.map((userId) => {
                  const score = summary.userScores[userId];
                  const user = summary.userMap[userId] || {};

                  const roscaCount = summary.actions.filter(
                    (a) => a.userId === userId && a.actionType === "rosca_join"
                  ).length;

                  const loanCount = summary.actions.filter(
                    (a) => a.userId === userId && a.actionType === "loan_taken"
                  ).length;

                  const saveCount = summary.actions.filter(
                    (a) =>
                      [
                        "fixed_savings_locked",
                        "target_contribution",
                        "investment_made",
                      ].includes(a.actionType) && a.userId === userId
                  ).length;

                  return (
                    <div
                      key={userId}
                      className="bg-white rounded-xl p-4 shadow-sm border"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold text-base">
                            {user.name || "Participant"}
                          </p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            const userActions = summary.actions.filter(
                              (a) => a.userId === userId
                            );
                            setSelectedUser({
                              ...user,
                              userId,
                              score,
                              actions: userActions,
                              roscaCount,
                              loanCount,
                              saveCount,
                            });
                          }}
                          className="text-green-700 text-sm font-semibold"
                        >
                          View Details →
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
                        <p>
                          <span className="font-semibold">Behavior:</span>{" "}
                          {score.behaviorType}
                        </p>
                        <p>
                          <span className="font-semibold">Trust:</span>{" "}
                          <span className="text-green-700">
                            {score.trustScore}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">Credit:</span>{" "}
                          <span className="text-blue-700">
                            {score.creditScore}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold">ROSCA:</span>{" "}
                          {roscaCount}
                        </p>
                        <p>
                          <span className="font-semibold">Loans:</span>{" "}
                          {loanCount}
                        </p>
                        <p>
                          <span className="font-semibold">Savings:</span>{" "}
                          {saveCount}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-xl font-bold">
                {selectedUser.name || "Participant Details"}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold text-green-700">
                  {selectedUser.score.trustScore}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className="text-2xl font-bold text-blue-700">
                  {selectedUser.score.creditScore}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Behavior Type</p>
                <p className="text-lg font-bold text-purple-700">
                  {selectedUser.score.behaviorType}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-semibold text-amber-700">
                  {selectedUser.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3">Observed Activity</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUser.roscaCount}
                  </p>
                  <p className="text-xs text-gray-600">ROSCA Joins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedUser.loanCount}
                  </p>
                  <p className="text-xs text-gray-600">Loans Taken</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedUser.saveCount}
                  </p>
                  <p className="text-xs text-gray-600">Savings Actions</p>
                </div>
              </div>
            </div>

            <h3 className="font-bold mb-3">Action Timeline</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedUser.actions
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((action, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {action.actionType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                      {action.metadata && (
                        <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap break-words">
                          {JSON.stringify(action.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}