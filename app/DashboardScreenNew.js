// app/DashboardScreenNew.js - Modern ROSCA Interface
"use client";
import React, { useState } from "react";
import {
  Wallet,
  Users,
  Target,
  TrendingUp,
  Shield,
  Bell,
  Clock,
  DollarSign,
  Plus,
  CheckCircle,
  Star,
  Calendar,
  Eye,
  BarChart3,
  User,
  Home,
  QrCode,
  HandCoins,
  History,
  UserPlus,
  ChevronRight,
  Medal,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  XCircle,
  LogOut,
} from "lucide-react";

// Modern color palette matching the templates
const colors = {
  primary: "#0d9488", // teal-600
  primaryDark: "#115e59",
  primaryLight: "#ccfbf1",
  secondary: "#f0fdfa",
  background: "#f8fafc",
  foreground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  amber: {
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    600: "#4f46e5",
  },
};

export default function DashboardScreenNew({
  userData,
  setCurrentScreen,
  saveUserData,
  handleLogout,
  seedGroups,
}) {
  const [activeTab, setActiveTab] = useState("home");

  // Safe data access
  const balance = userData?.wallets?.[userData?.selectedCurrency || "NGN"] || 0;

  // Get correct currency symbol based on selected currency
  const currencySymbols = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };
  const currencySymbol = currencySymbols[userData?.selectedCurrency || "NGN"];

  const roscaGroups = userData?.jG || []; // Use joined groups (jG)
  const trustScore = userData?.trustScore || 100;
  const creditScore = userData?.creditScore || 850;

  // Calculate next payment due (earliest nextDeduction date from active groups)
  const activeDueGroups = roscaGroups.filter(
    (g) => g.started && g.nextDeduction && g.weeksPaid < g.m
  );

  console.log("📊 Dashboard Debug:");
  console.log("- Total joined groups:", roscaGroups.length);
  console.log("- Active groups with due dates:", activeDueGroups.length);
  console.log("- Joined groups:", roscaGroups);

  const nextDueGroup = activeDueGroups.sort(
    (a, b) => new Date(a.nextDeduction) - new Date(b.nextDeduction)
  )[0];
  const upcomingPayment = nextDueGroup?.a || 0;
  const upcomingPaymentDate = nextDueGroup?.nextDeduction
    ? new Date(nextDueGroup.nextDeduction).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  console.log("- Next due group:", nextDueGroup);
  console.log("- Upcoming payment:", upcomingPayment);
  console.log("- Upcoming payment date:", upcomingPaymentDate);

  // Calculate next payout (group where it's user's turn or upcoming)
  const nextPayoutGroup = roscaGroups
    .filter((g) => g.started && !g.paid && g.weeksPaid < g.payoutWeek)
    .sort((a, b) => a.payoutWeek - a.weeksPaid - (b.payoutWeek - b.weeksPaid))[0];
  const nextPayout = nextPayoutGroup?.totalPayout || 0;
  const weeksUntilPayout = nextPayoutGroup
    ? nextPayoutGroup.payoutWeek - nextPayoutGroup.weeksPaid
    : 0;
  const nextPayoutDate =
    nextPayoutGroup && weeksUntilPayout > 0
      ? new Date(Date.now() + weeksUntilPayout * 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : null;

  // Calculate actual payment statistics
  const totalPaymentsDue = roscaGroups.reduce((sum, g) => sum + (g.weeksPaid || 0), 0);
  const onTimePayments = totalPaymentsDue; // Assuming all payments are on-time for now
  const latePayments = 0;
  const missedPayments = 0;

  // Header Component
  const Header = () => (
    <header className="px-4 pt-8 pb-4 sticky top-0 z-10 border-b border-gray-200/40 backdrop-blur-md bg-white/95 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium">Hey there,</p>
            <h1 className="text-base font-bold text-gray-900 truncate">{userData?.name || "User"}</h1>
          </div>
        </div>
        <button className="relative p-2 rounded-full bg-teal-50 hover:bg-teal-100 transition-colors shrink-0">
          <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          <Bell size={18} className="text-teal-600" />
        </button>
      </div>
    </header>
  );

  // Balance Card Component
  const BalanceCard = () => (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-500 p-6 text-white shadow-lg shadow-teal-500/20">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 rounded-full bg-black/10 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/80">Total Savings</p>
          <Eye size={20} className="text-white/70" />
        </div>
        <h2 className="text-3xl font-bold mb-6">
          {currencySymbol}{balance.toLocaleString()}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <TrendingUp size={16} className="text-white" />
            <span className="text-xs font-bold">+12%</span>
          </div>
          <span className="text-xs text-white/70">vs last month</span>
        </div>
      </div>
    </div>
  );

  // Quick Stats Component
  const QuickStats = () => {
    // If user has no groups, show empty state
    if (roscaGroups.length === 0) {
      return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-dashed border-teal-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-3">
              <Users size={28} className="text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Groups Yet</h3>
            <p className="text-sm text-gray-600 mb-4">Join or create a ROSCA group to start saving together</p>
            <button
              onClick={() => setCurrentScreen("rosca")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Browse Groups
            </button>
          </div>
        </div>
      );
    }

    // If user has groups, show the stats
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Clock size={20} />
            </div>
            <span className="text-xs font-medium text-gray-600">Due Soon</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {upcomingPayment > 0 ? `${currencySymbol}${upcomingPayment.toLocaleString()}` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {upcomingPaymentDate || "No upcoming payments"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-600">Next Payout</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {nextPayout > 0 ? `${currencySymbol}${nextPayout.toLocaleString()}` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {nextPayoutDate || "Not scheduled"}
          </p>
        </div>
      </div>
    );
  };

  // Quick Actions Component
  const QuickActions = () => (
    <section>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Quick Actions
      </h3>
      <div className="flex justify-between gap-2">
        <QuickActionButton
          icon={<Plus size={28} />}
          label="New Group"
          onClick={() => setCurrentScreen("rosca")}
        />
        <QuickActionButton
          icon={<Wallet size={28} />}
          label="Contribute"
          onClick={() => setCurrentScreen("rosca")}
        />
        <QuickActionButton
          icon={<History size={28} />}
          label="History"
          onClick={() => setActiveTab("history")}
        />
        <QuickActionButton
          icon={<UserPlus size={28} />}
          label="Invite"
          onClick={() => alert("Invite feature coming soon!")}
        />
      </div>
    </section>
  );

  const QuickActionButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 w-full">
      <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm hover:bg-teal-700 transition-all active:scale-95">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-900">{label}</span>
    </button>
  );

  // ROSCA Groups Component
  const ROSCAGroups = () => {
    const activeGroups = roscaGroups.filter(g => g.started);

    return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Your Groups</h3>
        <button
          className="text-sm font-semibold text-teal-600"
          onClick={() => setCurrentScreen("rosca")}
        >
          See All
        </button>
      </div>

      <div className="space-y-4">
        {activeGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <h4 className="font-bold text-gray-900 mb-2">No Groups Yet</h4>
            <p className="text-sm text-gray-600 mb-4">Join or create a ROSCA group to start saving</p>
            <button
              onClick={() => setCurrentScreen("rosca")}
              className="px-6 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              Browse Groups
            </button>
          </div>
        ) : (
          activeGroups.slice(0, 2).map((group, idx) => (
            <ROSCAGroupCard key={group.id || idx} group={group} />
          ))
        )}
      </div>
    </section>
    );
  };

  // Contribution Schedule Component
  const ContributionSchedule = () => {
    const [showCalendar, setShowCalendar] = useState(false);
    const upcomingContributions = roscaGroups
      .filter(g => g.started && g.nextDeduction)
      .sort((a, b) => new Date(a.nextDeduction) - new Date(b.nextDeduction))
      .slice(0, 3);

    if (upcomingContributions.length === 0) return null;

    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Payment Schedule</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-sm font-semibold text-teal-600 flex items-center gap-1"
          >
            <Calendar size={16} />
            {showCalendar ? "Hide Calendar" : "View Calendar"}
          </button>
        </div>

        {showCalendar && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm mb-4">
            <div className="text-center mb-4">
              <h4 className="font-bold text-gray-900 mb-1">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h4>
              <p className="text-xs text-gray-600">Upcoming contributions</p>
            </div>
            <div className="space-y-3">
              {upcomingContributions.map((group, idx) => {
                const daysUntil = Math.ceil((new Date(group.nextDeduction) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-12 h-12 rounded-lg bg-teal-100 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-teal-600">
                        {new Date(group.nextDeduction).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold text-teal-900">
                        {new Date(group.nextDeduction).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{group.n}</p>
                      <p className="text-xs text-gray-600">
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{currencySymbol}{group.a?.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{group.f}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {upcomingContributions.slice(0, showCalendar ? 999 : 2).map((group, idx) => {
            const daysUntil = Math.ceil((new Date(group.nextDeduction) - new Date()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysUntil <= 2;

            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-5 border-2 shadow-sm ${
                  isUrgent ? "border-amber-300 bg-amber-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{group.n}</h4>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                          Due Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(group.nextDeduction).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })} • {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{currencySymbol}{group.a?.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{group.f}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Handle payment
                    alert(`Payment of ${currencySymbol}${group.a?.toLocaleString()} for ${group.n} initiated!`);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
                    isUrgent
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  Pay Now
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // Payout Rotation Schedule Modal
  const PayoutRotationSchedule = ({ group, onClose }) => {
    // Generate full rotation schedule
    const totalMembers = group.m || 6;
    const currentCycle = group.weeksPaid || 0;
    const userPosition = group.pos || 1;
    const weeklyAmount = group.a || 0;
    const totalPayout = weeklyAmount * totalMembers;

    // Use actual member names from group data
    const members = Array.from({ length: totalMembers }, (_, i) => {
      const memberName = group.memberNames && group.memberNames[i]
        ? group.memberNames[i]
        : `Member ${i + 1}`;

      return {
        position: i + 1,
        name: i + 1 === userPosition ? "You" : memberName,
        isUser: i + 1 === userPosition,
        cycleNumber: i + 1,
        isPaid: i + 1 <= currentCycle,
        isCurrent: i + 1 === currentCycle + 1,
        isUpcoming: i + 1 > currentCycle
      };
    });

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Payout Rotation</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircle size={24} className="text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{group.n}</p>
            <div className="mt-4 flex items-center justify-between p-3 bg-teal-50 rounded-xl">
              <div>
                <p className="text-xs text-teal-600 font-bold">Total Pool</p>
                <p className="text-2xl font-bold text-teal-900">{currencySymbol}{totalPayout.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-teal-600 font-bold">Your Turn</p>
                <p className="text-2xl font-bold text-teal-900">Cycle {userPosition}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {members.map((member, idx) => {
              const weeksUntilPayout = member.cycleNumber - currentCycle;
              const payoutDate = group.nextDeduction
                ? new Date(new Date(group.nextDeduction).getTime() + (weeksUntilPayout - 1) * 7 * 24 * 60 * 60 * 1000)
                : null;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    member.isPaid
                      ? "bg-gray-50 border-gray-200"
                      : member.isCurrent
                      ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100"
                      : member.isUser
                      ? "bg-teal-50 border-teal-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          member.isPaid
                            ? "bg-gray-200 text-gray-500"
                            : member.isCurrent
                            ? "bg-emerald-600 text-white"
                            : member.isUser
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {member.position}
                      </div>
                      <div>
                        <p className={`font-bold ${member.isUser ? "text-teal-900" : "text-gray-900"}`}>
                          {member.name}
                          {member.isUser && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {member.isPaid ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle size={12} className="text-emerald-600" />
                              Paid
                            </span>
                          ) : member.isCurrent ? (
                            <span className="text-emerald-600 font-bold">Receiving This Cycle</span>
                          ) : payoutDate ? (
                            payoutDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          ) : (
                            `Cycle ${member.cycleNumber}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${member.isPaid ? "text-gray-400" : "text-gray-900"}`}>
                        {currencySymbol}{totalPayout.toLocaleString()}
                      </p>
                      {member.isUpcoming && !member.isCurrent && weeksUntilPayout > 0 && (
                        <p className="text-xs text-gray-600">
                          {weeksUntilPayout === 1
                            ? "Next week"
                            : `In ${weeksUntilPayout} ${group.f === "Weekly" ? "weeks" : "months"}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-sm text-gray-900 mb-2">How It Works</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Each member contributes {currencySymbol}{weeklyAmount.toLocaleString()} {group.f?.toLowerCase() || "weekly"}</li>
                <li>• One member receives the full pool each cycle</li>
                <li>• Rotation continues until everyone has received their payout</li>
                <li>• You're position #{userPosition} in the rotation</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ROSCAGroupCard = ({ group }) => {
    const [showSchedule, setShowSchedule] = useState(false);
    const [showMembers, setShowMembers] = useState(false);

    // Get member initials from names
    const getInitials = (name) => {
      if (!name) return "M";
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return parts[0][0] + parts[1][0];
      }
      return name.substring(0, 2).toUpperCase();
    };

    // Generate colors for member avatars
    const getAvatarColor = (index) => {
      const colors = [
        "from-teal-400 to-emerald-500",
        "from-blue-400 to-indigo-500",
        "from-purple-400 to-pink-500",
        "from-orange-400 to-red-500",
        "from-green-400 to-teal-500",
        "from-indigo-400 to-purple-500"
      ];
      return colors[index % colors.length];
    };

    const memberCount = group.memberNames?.length || group.c || 0;
    const displayMembers = group.memberNames?.slice(0, 3) || [];

    return (
      <>
        {showSchedule && (
          <PayoutRotationSchedule group={group} onClose={() => setShowSchedule(false)} />
        )}
        {showMembers && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMembers(false)}>
            <div className="bg-white rounded-3xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Group Members</h3>
                <button onClick={() => setShowMembers(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <XCircle size={24} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">{group.n}</p>
              <div className="space-y-2">
                {group.memberNames?.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white font-bold text-sm`}>
                      {getInitials(name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-600">Position {i + 1}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500 text-center py-4">No members yet</p>
                )}
              </div>
              <button
                onClick={() => setShowMembers(false)}
                className="w-full mt-4 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-lg text-gray-900">{group.n}</h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
              Active
            </span>
          </div>
          <p className="text-xs text-gray-600">Cycle {group.cp || 1} of {group.m}</p>
        </div>
        <div
          className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setShowMembers(true)}
          title="Click to view all members"
        >
          {displayMembers.map((name, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center text-white font-bold text-[10px]`}
            >
              {getInitials(name)}
            </div>
          ))}
          {memberCount > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
              +{memberCount - 3}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-2xl">
        <div>
          <p className="text-xs text-gray-600 mb-1">Monthly Contribution</p>
          <p className="font-bold text-gray-900">{currencySymbol}{group.a?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Pool</p>
          <p className="font-bold text-teal-600">{currencySymbol}{(group.a * (group.mbrs?.length || 6)).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
            <Calendar size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 uppercase font-bold">Next Payout</span>
            <span className="text-xs font-bold text-gray-900">
              {group.pos === group.cp ? "You" : `Member ${group.cp}`}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          View Schedule
        </button>
      </div>
        </div>
      </>
    );
  };

  // Trust & Credit Score Card
  const ScoreCard = () => (
    <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-6">
      {/* Trust Score */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-50">
            <Shield size={24} className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Trust Score</h4>
            <p className="text-xs text-gray-600">Your reliability rating</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Star size={20} className="text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold text-gray-900">{trustScore}</span>
          </div>
          <p className="text-[10px] text-gray-600">
            {trustScore >= 80 ? "Excellent" : trustScore >= 60 ? "Good" : "Fair"}
          </p>
        </div>
      </div>

      {/* Credit Score */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Credit Score</h4>
            <p className="text-xs text-gray-600">Your creditworthiness</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-2xl font-bold text-gray-900">{creditScore}</span>
          </div>
          <p className="text-[10px] text-gray-600">
            {creditScore >= 750 ? "Excellent" : creditScore >= 650 ? "Good" : "Fair"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Payment History</span>
          <span className="text-sm font-bold text-emerald-600">95%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div style={{ width: "95%" }} className="h-full bg-emerald-500 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <p className="text-xs text-gray-600">On-Time</p>
            <p className="text-lg font-bold text-gray-900">{onTimePayments}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Late</p>
            <p className="text-lg font-bold text-amber-600">{latePayments}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Missed</p>
            <p className="text-lg font-bold text-red-600">{missedPayments}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentScreen("trust")}
        className="w-full py-2 rounded-xl bg-teal-50 text-teal-700 text-sm font-semibold hover:bg-teal-100 transition-colors"
      >
        View Full Report
      </button>
    </div>
  );

  // Research Data Card
  const ResearchDataCard = () => (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-white/20">
          <BarChart3 size={24} />
        </div>
        <div>
          <h4 className="font-bold">Research Data</h4>
          <p className="text-xs text-purple-100">Your progress & insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-white/10 rounded-xl">
          <p className="text-xs text-purple-100 mb-1">Groups Joined</p>
          <p className="text-2xl font-bold">{roscaGroups.length}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-xl">
          <p className="text-xs text-purple-100 mb-1">Reliability</p>
          <p className="text-2xl font-bold">
            {onTimePayments + latePayments + missedPayments > 0
              ? Math.round((onTimePayments / (onTimePayments + latePayments + missedPayments)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      <button
        onClick={() => setCurrentScreen("research")}
        className="w-full py-3 rounded-xl bg-white text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
      >
        View Research Insights
      </button>
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-2 z-50 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <NavButton icon={<Home size={20} />} label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
        <NavButton icon={<Users size={20} />} label="Groups" active={activeTab === "groups"} onClick={() => setCurrentScreen("rosca")} />
        <button
          onClick={() => setCurrentScreen("analytics")}
          className="relative -top-4 bg-teal-600 text-white p-3 rounded-full shadow-xl shadow-teal-600/30 hover:scale-105 transition-transform"
        >
          <BarChart3 size={20} />
        </button>
        <NavButton icon={<Wallet size={20} />} label="Wallet" active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} />
        <NavButton icon={<User size={20} />} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
      </div>
    </nav>
  );

  const NavButton = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 transition-colors ${
        active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {icon}
      <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
    </button>
  );

  // Wallet Screen Component
  const WalletScreen = () => {
    const wallets = userData?.wallets || { NGN: 0, USD: 0, EUR: 0, GBP: 0 };
    const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };

    // Calculate total fixed savings from all active fixed deposits
    const fixedSavings = (userData?.fS || [])
      .filter(fs => fs.status === "Active")
      .reduce((total, fs) => total + fs.amt, 0);

    // Calculate total target savings from all active targets
    const targetSavings = (userData?.tS || [])
      .reduce((total, ts) => total + ts.saved, 0);

    // Calculate total investments
    const investments = (userData?.iV || [])
      .reduce((total, inv) => total + inv.amt, 0);

    return (
      <div className="space-y-6 py-4">
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Your Wallets
          </h3>
          <div className="space-y-3">
            {Object.entries(wallets).map(([currency, balance]) => (
              <div key={currency} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-teal-50">
                      <Wallet size={24} className="text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{currency} Wallet</h4>
                      <p className="text-xs text-gray-600">Available balance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {symbols[currency]}{balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Savings
          </h3>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-50">
                    <Target size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Fixed Savings</h4>
                    <p className="text-xs text-gray-600">Locked deposits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {currencySymbol}{fixedSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-amber-50">
                    <Target size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Target Savings</h4>
                    <p className="text-xs text-gray-600">Goal-based savings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">
                    {currencySymbol}{targetSavings.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-purple-50">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Investments</h4>
                    <p className="text-xs text-gray-600">Active investments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    {currencySymbol}{investments.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentScreen("loans")}
              className="p-4 rounded-2xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              Get Loan
            </button>
            <button
              onClick={() => setCurrentScreen("fixed")}
              className="p-4 rounded-2xl border-2 border-teal-600 text-teal-600 font-semibold hover:bg-teal-50 transition-colors"
            >
              Save More
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => setCurrentScreen("target")}
              className="p-4 rounded-2xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Set Goal
            </button>
            <button
              onClick={() => setCurrentScreen("invest")}
              className="p-4 rounded-2xl border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
            >
              Invest
            </button>
          </div>
        </section>
      </div>
    );
  };

  // Profile Screen Component
  const ProfileScreen = () => {
    const verificationItems = [
      {
        title: "Identity Verified",
        subtitle: userData?.kycComplete ? "Government ID confirmed" : "Pending verification",
        verified: userData?.kycComplete || false,
      },
      {
        title: "Phone Verified",
        subtitle: userData?.phone || "Not linked",
        verified: !!userData?.phone,
      },
      {
        title: "Email Verified",
        subtitle: userData?.email || "Not linked",
        verified: !!userData?.email,
      },
    ];

    return (
      <div className="space-y-6 py-4">
        <section>
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-6 text-white shadow-lg text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-4xl font-bold">{userData?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{userData?.name || "User"}</h2>
            <p className="text-sm text-white/80">{userData?.email || "No email added"}</p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Account Details
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-1">Member Since</p>
              <p className="font-bold text-gray-900">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "Recently"
                }
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-1">User ID</p>
              <p className="font-mono text-sm text-gray-900">{userData?.id?.substring(0, 16) || "N/A"}...</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-1">Phone Number</p>
              <p className="font-bold text-gray-900">{userData?.phone || "Not added"}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Verification Status
          </h3>
          <div className="space-y-3">
            {verificationItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.verified ? "bg-emerald-100" : "bg-gray-100"}`}>
                      {item.verified ? (
                        <CheckCircle size={20} className="text-emerald-600" />
                      ) : (
                        <XCircle size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-600">{item.subtitle}</p>
                    </div>
                  </div>
                  {item.verified && (
                    <CheckCircle size={24} className="text-emerald-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Settings
          </h3>
          <div className="space-y-2">
            <button className="w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Notifications</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>
            <button className="w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Security</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>
            <button className="w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Privacy</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>
          </div>
        </section>

        <section>
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-50 rounded-2xl border-2 border-red-200 text-left hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <LogOut size={20} className="text-red-600" />
              </div>
              <div>
                <span className="font-bold text-red-900">Logout</span>
                <p className="text-xs text-red-700">Sign out of your account</p>
              </div>
            </div>
          </button>
        </section>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      <Header />

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {activeTab === "home" && (
          <div className="space-y-6 py-4">
            <section className="space-y-4">
              <BalanceCard />
              <QuickStats />
            </section>

            <QuickActions />
            <ContributionSchedule />
            <ROSCAGroups />
            <ScoreCard />
            <ResearchDataCard />
          </div>
        )}

        {activeTab === "wallet" && <WalletScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      <BottomNav />
    </div>
  );
}
