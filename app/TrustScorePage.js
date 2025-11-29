// app/TrustScorePage.js - Trust Score Interface
"use client";
import React from "react";
import {
  ArrowLeft,
  Info,
  Star,
  Wallet,
  BarChart2,
  XCircle,
  Trophy,
  Shield,
  Zap,
  Medal,
  Lock,
  TrendingUp,
  Calendar,
  MessageCircle,
  Users,
} from "lucide-react";

export default function TrustScorePage({ userData, setCurrentScreen }) {
  const trustScore = userData?.trustScore || 100;
  const scorePercentage = (trustScore / 100) * 100;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  const scoreBreakdown = [
    {
      icon: <Wallet size={20} />,
      title: "Payment Reliability",
      subtitle: "On-time payment history",
      score: 95,
      color: "emerald",
    },
    {
      icon: <BarChart2 size={20} />,
      title: "Participation Rate",
      subtitle: "Group contribution consistency",
      score: 88,
      color: "blue",
    },
    {
      icon: <Star size={20} />,
      title: "Peer Reviews",
      subtitle: "Average member rating",
      score: 4.8,
      color: "amber",
      isRating: true,
    },
    {
      icon: <XCircle size={20} />,
      title: "Defaults",
      subtitle: "Missed payments or exits",
      score: 0,
      color: "red",
      inverse: true,
    },
  ];

  const achievements = [
    { icon: <Trophy />, title: "Perfect Year", subtitle: "12 months on-time", gradient: "from-yellow-400 to-amber-500", unlocked: true },
    { icon: <Shield />, title: "Trusted", subtitle: "5+ groups joined", gradient: "from-blue-400 to-indigo-500", unlocked: true },
    { icon: <Zap />, title: "Top Rated", subtitle: "4.5+ peer rating", gradient: "from-emerald-400 to-teal-500", unlocked: true },
    { icon: <Medal />, title: "Early Bird", subtitle: "Always pays first", gradient: "from-purple-400 to-pink-500", unlocked: true },
    { icon: <TrendingUp />, title: "Streak", subtitle: "24 consecutive", gradient: "from-orange-400 to-red-500", unlocked: true },
    { icon: <Lock />, title: "Locked", subtitle: "", gradient: "from-gray-300 to-gray-400", unlocked: false },
  ];

  const handleAutoPay = () => {
    // TODO: Implement auto-pay setup
    alert("Auto-pay feature coming soon! This will automatically contribute to your ROSCA groups on scheduled dates.");
  };

  const improvements = [
    {
      icon: <Calendar size={20} />,
      iconBg: "bg-blue-100 text-blue-600",
      title: "Set up auto-pay",
      description: "Never miss a payment deadline. Can add up to +30 points.",
      onClick: handleAutoPay,
    },
    {
      icon: <Users size={20} />,
      iconBg: "bg-purple-100 text-purple-600",
      title: "Join more groups",
      description: "Build trust across communities. Can add up to +20 points.",
      onClick: () => setCurrentScreen("rosca"),
    },
    {
      icon: <MessageCircle size={20} />,
      iconBg: "bg-amber-100 text-amber-600",
      title: "Request peer reviews",
      description: "Ask group members to rate your contributions. Can add up to +15 points.",
      onClick: () => {
        // TODO: Navigate to peer review screen
        alert("Peer Review System:\n\n• Members of your ROSCA groups can rate your reliability and contributions\n• Reviews are anonymous to encourage honest feedback\n• Your average rating impacts your trust score\n• Request reviews from the Groups page\n\nFeature coming soon!");
      },
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600", bar: "bg-emerald-500" },
      blue: { bg: "bg-blue-100", text: "text-blue-600", bar: "bg-blue-500" },
      amber: { bg: "bg-amber-100", text: "text-amber-600", bar: "bg-amber-400" },
      red: { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500" },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10 border-b border-gray-200/40 backdrop-blur-md bg-white/95 shrink-0">
        <button
          onClick={() => setCurrentScreen("dashboard")}
          className="flex items-center justify-center w-10 h-10"
        >
          <ArrowLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Trust Score</h1>
        <button className="flex items-center justify-center w-10 h-10">
          <Info size={20} className="text-gray-400" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-6 py-4">
        {/* Main Score Card */}
        <section className="mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-600 p-8 text-white shadow-lg shadow-teal-500/20">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 rounded-full bg-black/10 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center">
              <p className="text-sm font-medium text-white/80 mb-2">Your Trust Score</p>

              {/* Circular Progress */}
              <div className="relative w-48 h-48 mb-6">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    r="88"
                    cx="96"
                    cy="96"
                    fill="none"
                    stroke="currentColor"
                    className="text-white/20"
                    strokeWidth="12"
                  />
                  <circle
                    r="88"
                    cx="96"
                    cy="96"
                    fill="none"
                    stroke="currentColor"
                    className="text-white transition-all duration-1000"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{trustScore}</span>
                  <span className="text-xs text-white/70 mt-1">out of 100</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star size={20} className="text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-bold">
                  {trustScore >= 80 ? "Excellent Rating" : trustScore >= 60 ? "Good Rating" : "Fair Rating"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Score Breakdown */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Score Breakdown
          </h3>
          <div className="space-y-3">
            {scoreBreakdown.map((item, idx) => {
              const colorClasses = getColorClasses(item.color);
              return (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600">{item.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {item.isRating ? item.score : `${item.score}%`}
                    </span>
                  </div>
                  {item.isRating ? (
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(item.score) ? "text-amber-400 fill-amber-400" : "text-amber-200"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        style={{ width: item.inverse ? "100%" : `${item.score}%` }}
                        className={`${item.inverse ? (item.score === 0 ? colorClasses.bar : "bg-red-500") : colorClasses.bar} h-2 rounded-full`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-4 border ${
                  achievement.unlocked ? "border-gray-200" : "border-dashed border-gray-300 opacity-50"
                } shadow-sm flex flex-col items-center`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${achievement.gradient} flex items-center justify-center mb-2 shadow-md`}
                >
                  {React.cloneElement(achievement.icon, { size: 24, className: "text-white" })}
                </div>
                <span className="text-xs font-bold text-center text-gray-900">{achievement.title}</span>
                {achievement.subtitle && (
                  <span className="text-[10px] text-gray-600 text-center mt-1">{achievement.subtitle}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Community Comparison */}
        <section>
          <div className="bg-teal-50/50 rounded-3xl p-5 border border-teal-200/50">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-teal-50 text-teal-600">
                <BarChart2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Community Comparison</h3>
                <p className="text-xs text-gray-600">See how you rank</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Your Score</p>
                <p className="text-2xl font-bold text-teal-600">{trustScore}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Community Avg</p>
                <p className="text-2xl font-bold text-gray-900">62</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-emerald-600" />
                <p className="text-xs font-bold text-emerald-700">
                  You're in the top 25% of all members!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Improve Your Score */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Improve Your Score
          </h3>
          <div className="space-y-3">
            {improvements.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
