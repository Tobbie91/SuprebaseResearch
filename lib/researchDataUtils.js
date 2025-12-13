// lib/researchDataUtils.js - Research data tracking and analytics

import { db } from "./firebase";
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where } from "firebase/firestore";

/**
 * RESEARCH DATA STRUCTURE
 *
 * For each user, we track:
 * 1. Baseline Data (from survey when they joined)
 * 2. Activity Data (ongoing tracking)
 * 3. Comparative Metrics (baseline vs current)
 */

// ===== INDIVIDUAL USER RESEARCH DATA =====

/**
 * Get complete research profile for a user
 */
export const getUserResearchData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();

    // Calculate current activity metrics
    const activityMetrics = calculateActivityMetrics(userData);

    // Compare with baseline
    const comparison = compareWithBaseline(userData.baselineSurvey, activityMetrics);

    return {
      userId,
      name: userData.name,
      email: userData.email,
      joinedAt: userData.createdAt,

      // Baseline survey responses
      baseline: userData.baselineSurvey || null,

      // Current activity metrics
      activity: activityMetrics,

      // Comparison analysis
      comparison,

      // Raw data
      rawData: {
        joinedGroups: userData.jG || [],
        trustScore: userData.trustScore || 0,
        wallets: userData.wallets || {},
        actions: userData.actions || []
      }
    };
  } catch (error) {
    console.error("Error getting user research data:", error);
    return null;
  }
};

/**
 * Calculate current activity metrics for a user
 */
const calculateActivityMetrics = (userData) => {
  const joinedGroups = userData.jG || [];
  const actions = userData.actions || [];

  // ROSCA Metrics
  const totalGroupsJoined = joinedGroups.length;
  const activeGroups = joinedGroups.filter(g => g.started && !g.completed).length;
  const completedGroups = joinedGroups.filter(g => g.completed).length;

  // Payment History
  const paymentHistory = analyzePaymentHistory(joinedGroups);

  // Trust Score
  const trustScore = userData.trustScore || 0;

  // Financial Metrics
  const wallets = userData.wallets || { NGN: 0, USD: 0, EUR: 0, GBP: 0 };
  const totalBalance = Object.values(wallets).reduce((sum, val) => sum + val, 0);

  // Upcoming commitments
  const upcomingPayments = joinedGroups
    .filter(g => g.started && g.nextDeduction)
    .map(g => ({
      groupName: g.n,
      amount: g.a,
      currency: g.currency,
      dueDate: g.nextDeduction
    }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Next payout info
  const nextPayout = calculateNextPayout(joinedGroups);

  return {
    // ROSCA participation
    rosca: {
      totalGroupsJoined,
      activeGroups,
      completedGroups,
      groupNames: joinedGroups.map(g => g.n)
    },

    // Payment behavior
    payments: paymentHistory,

    // Financial health
    financial: {
      totalBalance,
      balanceByurrency: wallets,
      upcomingCommitments: upcomingPayments.length,
      totalCommitmentAmount: upcomingPayments.reduce((sum, p) => sum + p.amount, 0)
    },

    // Trust and reliability
    trust: {
      score: trustScore,
      onTimePayments: paymentHistory.onTime,
      latePayments: paymentHistory.late,
      missedPayments: paymentHistory.missed,
      reliabilityRate: paymentHistory.total > 0
        ? ((paymentHistory.onTime / paymentHistory.total) * 100).toFixed(1)
        : 0
    },

    // Next payout
    nextPayout,

    // Activity summary
    summary: {
      daysActive: calculateDaysActive(userData.createdAt),
      lastActive: userData.lastActive || userData.createdAt,
      totalActions: actions.length
    }
  };
};

/**
 * Analyze payment history from joined groups
 */
const analyzePaymentHistory = (joinedGroups) => {
  let onTime = 0;
  let late = 0;
  let missed = 0;
  let total = 0;

  joinedGroups.forEach(group => {
    if (group.paymentHistory) {
      total += group.paymentHistory.length;

      group.paymentHistory.forEach(payment => {
        if (payment.status === "onTime") onTime++;
        else if (payment.status === "late") late++;
        else if (payment.status === "missed") missed++;
      });
    } else if (group.weeksPaid) {
      // If no detailed history, assume all on time
      total += group.weeksPaid;
      onTime += group.weeksPaid;
    }
  });

  return {
    total,
    onTime,
    late,
    missed,
    onTimeRate: total > 0 ? ((onTime / total) * 100).toFixed(1) : 0,
    lateRate: total > 0 ? ((late / total) * 100).toFixed(1) : 0,
    missedRate: total > 0 ? ((missed / total) * 100).toFixed(1) : 0
  };
};

/**
 * Calculate next payout information
 */
const calculateNextPayout = (joinedGroups) => {
  const activeGroups = joinedGroups.filter(g => g.started && !g.completed);

  if (activeGroups.length === 0) {
    return null;
  }

  // Find the group where user will receive payout soonest
  const nextPayoutGroup = activeGroups
    .filter(g => g.payoutWeek && g.weeksPaid < g.payoutWeek)
    .sort((a, b) => {
      const weeksUntilA = a.payoutWeek - a.weeksPaid;
      const weeksUntilB = b.payoutWeek - b.weeksPaid;
      return weeksUntilA - weeksUntilB;
    })[0];

  if (!nextPayoutGroup) {
    return null;
  }

  const weeksUntil = nextPayoutGroup.payoutWeek - nextPayoutGroup.weeksPaid;
  const payoutAmount = nextPayoutGroup.a * nextPayoutGroup.m;

  return {
    groupName: nextPayoutGroup.n,
    amount: payoutAmount,
    currency: nextPayoutGroup.currency,
    weeksUntil,
    position: nextPayoutGroup.pos
  };
};

/**
 * Calculate days since user joined
 */
const calculateDaysActive = (createdAt) => {
  if (!createdAt) return 0;
  const joinDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Compare baseline survey data with current activity
 */
const compareWithBaseline = (baseline, activity) => {
  if (!baseline) {
    return {
      available: false,
      message: "No baseline survey data available"
    };
  }

  const comparison = {
    available: true,

    // Financial behavior change
    savingsBehavior: {
      before: baseline.currentSavings || "Not specified",
      after: activity.financial.totalBalance,
      change: baseline.currentSavings
        ? ((activity.financial.totalBalance - baseline.currentSavings) / baseline.currentSavings * 100).toFixed(1) + "%"
        : "N/A"
    },

    // ROSCA participation
    roscaExperience: {
      before: baseline.roscaExperience || "Not specified",
      after: activity.rosca.totalGroupsJoined > 0 ? "Active participant" : "Not participating",
      groupsJoined: activity.rosca.totalGroupsJoined
    },

    // Borrowing behavior
    borrowingHabits: {
      before: baseline.borrowingFrequency || "Not specified",
      hasUsedLoans: activity.summary.totalActions > 0, // Check if they've taken loans
    },

    // Financial goals progress
    financialGoals: {
      stated: baseline.financialGoals || [],
      progress: assessGoalProgress(baseline.financialGoals, activity)
    },

    // Trust and reliability
    trustDevelopment: {
      currentScore: activity.trust.score,
      reliabilityRate: activity.trust.reliabilityRate + "%",
      paymentRecord: `${activity.trust.onTimePayments} on-time, ${activity.trust.latePayments} late, ${activity.trust.missedPayments} missed`
    }
  };

  return comparison;
};

/**
 * Assess progress toward financial goals
 */
const assessGoalProgress = (goals, activity) => {
  if (!goals || goals.length === 0) {
    return "No goals specified";
  }

  const progress = [];

  goals.forEach(goal => {
    if (goal.toLowerCase().includes("save")) {
      progress.push({
        goal,
        status: activity.rosca.activeGroups > 0 ? "In progress" : "Not started",
        metric: `${activity.rosca.activeGroups} active ROSCA groups`
      });
    } else if (goal.toLowerCase().includes("business") || goal.toLowerCase().includes("investment")) {
      progress.push({
        goal,
        status: activity.financial.totalBalance > 0 ? "Building capital" : "Planning",
        metric: `Balance: ${activity.financial.totalBalance}`
      });
    } else {
      progress.push({
        goal,
        status: "Tracking",
        metric: "Progress tracked via platform activity"
      });
    }
  });

  return progress;
};

// ===== SYSTEM-WIDE ANALYTICS =====

/**
 * Get aggregated research data for all users
 */
export const getSystemWideAnalytics = async () => {
  try {
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);

    const allUsers = [];
    usersSnap.forEach(doc => {
      allUsers.push({ id: doc.id, ...doc.data() });
    });

    // Calculate aggregate metrics
    const totalUsers = allUsers.length;
    const usersWithBaseline = allUsers.filter(u => u.baselineSurvey).length;

    // ROSCA metrics
    const totalGroupJoins = allUsers.reduce((sum, u) => sum + (u.jG?.length || 0), 0);
    const avgGroupsPerUser = totalUsers > 0 ? (totalGroupJoins / totalUsers).toFixed(2) : 0;

    // Trust scores
    const trustScores = allUsers.map(u => u.trustScore || 0);
    const avgTrustScore = trustScores.length > 0
      ? (trustScores.reduce((a, b) => a + b, 0) / trustScores.length).toFixed(1)
      : 0;

    // Payment behavior across all users
    const aggregatePayments = allUsers.reduce((acc, user) => {
      const userPayments = analyzePaymentHistory(user.jG || []);
      return {
        total: acc.total + userPayments.total,
        onTime: acc.onTime + userPayments.onTime,
        late: acc.late + userPayments.late,
        missed: acc.missed + userPayments.missed
      };
    }, { total: 0, onTime: 0, late: 0, missed: 0 });

    // Baseline comparison
    const baselineComparisons = allUsers
      .filter(u => u.baselineSurvey)
      .map(u => {
        const activity = calculateActivityMetrics(u);
        return compareWithBaseline(u.baselineSurvey, activity);
      });

    return {
      overview: {
        totalUsers,
        usersWithBaseline,
        baselineCompletionRate: totalUsers > 0
          ? ((usersWithBaseline / totalUsers) * 100).toFixed(1) + "%"
          : "0%"
      },

      rosca: {
        totalGroupJoins,
        avgGroupsPerUser,
        activeParticipants: allUsers.filter(u => (u.jG?.length || 0) > 0).length
      },

      trust: {
        avgTrustScore,
        distribution: {
          excellent: trustScores.filter(s => s >= 80).length,
          good: trustScores.filter(s => s >= 60 && s < 80).length,
          fair: trustScores.filter(s => s < 60).length
        }
      },

      payments: {
        total: aggregatePayments.total,
        onTimeRate: aggregatePayments.total > 0
          ? ((aggregatePayments.onTime / aggregatePayments.total) * 100).toFixed(1) + "%"
          : "0%",
        lateRate: aggregatePayments.total > 0
          ? ((aggregatePayments.late / aggregatePayments.total) * 100).toFixed(1) + "%"
          : "0%",
        missedRate: aggregatePayments.total > 0
          ? ((aggregatePayments.missed / aggregatePayments.total) * 100).toFixed(1) + "%"
          : "0%"
      },

      baselineComparisons: {
        available: baselineComparisons.length,
        summary: summarizeBaselineChanges(baselineComparisons)
      },

      // Individual user data for detailed analysis
      users: allUsers.map(u => ({
        id: u.id,
        name: u.name,
        hasBaseline: !!u.baselineSurvey,
        groupsJoined: u.jG?.length || 0,
        trustScore: u.trustScore || 0,
        joinedAt: u.createdAt
      }))
    };
  } catch (error) {
    console.error("Error getting system-wide analytics:", error);
    return null;
  }
};

/**
 * Summarize baseline changes across all users
 */
const summarizeBaselineChanges = (comparisons) => {
  if (comparisons.length === 0) {
    return "No baseline comparisons available";
  }

  const participationIncrease = comparisons.filter(c =>
    c.roscaExperience?.after === "Active participant"
  ).length;

  const avgReliability = comparisons
    .map(c => parseFloat(c.trustDevelopment?.reliabilityRate) || 0)
    .reduce((a, b) => a + b, 0) / comparisons.length;

  return {
    totalWithBaseline: comparisons.length,
    nowActiveInRosca: participationIncrease,
    avgReliabilityRate: avgReliability.toFixed(1) + "%",
    behaviorChange: participationIncrease > 0
      ? "Positive engagement with ROSCA platform"
      : "Early adoption phase"
  };
};

/**
 * Track payment event for research
 */
export const trackPaymentEvent = async (userId, groupId, status, amount, currency) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();
    const updatedGroups = (userData.jG || []).map(group => {
      if (group.id === groupId) {
        const paymentHistory = group.paymentHistory || [];
        paymentHistory.push({
          date: new Date().toISOString(),
          status, // "onTime", "late", or "missed"
          amount,
          currency
        });

        return {
          ...group,
          paymentHistory
        };
      }
      return group;
    });

    await updateDoc(userRef, {
      jG: updatedGroups,
      lastActive: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Error tracking payment event:", error);
    return false;
  }
};

/**
 * Export research data to CSV format
 */
export const exportResearchDataToCSV = (analytics) => {
  if (!analytics || !analytics.users) {
    return null;
  }

  const headers = [
    "User ID",
    "Name",
    "Has Baseline Survey",
    "Groups Joined",
    "Trust Score",
    "Joined Date"
  ].join(",");

  const rows = analytics.users.map(user => {
    return [
      user.id,
      user.name || "N/A",
      user.hasBaseline ? "Yes" : "No",
      user.groupsJoined,
      user.trustScore,
      user.joinedAt || "N/A"
    ].join(",");
  });

  return [headers, ...rows].join("\n");
};
