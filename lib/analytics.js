// lib/analytics.js
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';



export const trackAction = async (userId, userName, userEmail, actionType, metadata = {}) => {
  try {
    const payload = {
      userId,
      userName,
      userEmail,
      actionType,
      metadata,
      timestamp: serverTimestamp(),
      sessionId: getSessionId(),
      deviceInfo: getDeviceInfo(),
    };

    await addDoc(collection(db, "actions"), payload);

    console.log("📊 Action Tracked:", payload);
    return { success: true };
  } catch (err) {
    console.error("❌ Tracking Error:", err);
    return { success: false };
  }
};

// ===== USER REGISTRATION =====
export const trackUserRegistration = async (userData) => {
  try {
    await addDoc(collection(db, 'user_registrations'), {
      userId: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      timestamp: serverTimestamp(),
    });
    
    console.log('✅ User Registration Tracked:', userData.email);
  } catch (error) {
    console.error('❌ Registration Tracking Error:', error);
  }
};

// ===== BEHAVIOR TRACKING EVENTS =====

// 1. TOKEN CLAIM
export const trackTokenClaim = async (userId, userName, claimed) => {
  return trackAction(userId, userName, '', 'token_claim', {
    claimed,
    amount: 100000,
    timeToClaim: Date.now(),
  });
};

// 2. ROSCA BEHAVIORS
export const trackRoscaView = async (userId, userName, groupId, groupName) => {
  return trackAction(userId, userName, '', 'rosca_view', {
    groupId,
    groupName,
  });
};

export const trackRoscaJoin = async (userId, userName, groupData) => {
  return trackAction(userId, userName, '', 'rosca_join', {
    groupId: groupData.id,
    groupName: groupData.n,
    amount: groupData.a,
    frequency: groupData.f,
    position: groupData.pos,
    hadSufficientBalance: groupData.hadBalance,
    tookLoan: groupData.tookLoan || false,
  });
};

export const trackRoscaPayment = async (userId, userName, groupData, paymentNumber) => {
  return trackAction(userId, userName, '', 'rosca_payment', {
    groupId: groupData.id,
    groupName: groupData.n,
    amount: groupData.a,
    paymentNumber,
    totalPayments: groupData.m,
    onTime: true,
  });
};

export const trackRoscaPayout = async (userId, userName, groupData, netAmount) => {
  return trackAction(userId, userName, '', 'rosca_payout', {
    groupId: groupData.id,
    groupName: groupData.n,
    grossAmount: groupData.totalPayout,
    loanDeduction: groupData.totalPayout - netAmount,
    netAmount,
    position: groupData.pos,
  });
};

// 3. LOAN BEHAVIORS (CRITICAL FOR RESEARCH)
export const trackLoanPrompt = async (userId, userName, reason, groupId = null) => {
  return trackAction(userId, userName, '', 'loan_prompt_shown', {
    reason, // 'rosca_join', 'rosca_payment', 'target_savings', etc.
    groupId,
    userBalance: 0, // Will be updated by caller
  });
};

export const trackLoanDecision = async (userId, userName, decision, loanData) => {
  return trackAction(userId, userName, '', 'loan_decision', {
    decision, // 'accepted' or 'declined'
    reason: loanData.purpose,
    amount: loanData.amount,
    groupId: loanData.groupId,
    promptNumber: loanData.promptNumber, // How many times prompted before accepting
  });
};

export const trackLoanTaken = async (userId, userName, loanData) => {
  return trackAction(userId, userName, '', 'loan_taken', {
    amount: loanData.amt,
    purpose: loanData.pur,
    interest: loanData.ir,
    totalRepayment: loanData.tot,
    groupId: loanData.groupId,
    isRoscaAdvance: !!loanData.groupId,
  });
};

export const trackLoanRepayment = async (userId, userName, loanData, repaymentMethod) => {
  return trackAction(userId, userName, '', 'loan_repayment', {
    loanId: loanData.id,
    amount: loanData.tot,
    method: repaymentMethod, // 'manual', 'rosca_deduction', 'auto'
  });
};

// 4. SAVINGS BEHAVIORS
export const trackFixedSavings = async (userId, userName, savingsData) => {
  return trackAction(userId, userName, '', 'fixed_savings_locked', {
    amount: savingsData.amt,
    duration: savingsData.dur,
    rate: savingsData.rt,
    expectedReturns: savingsData.ret,
  });
};

export const trackTargetSavings = async (userId, userName, goalData, contribution = false) => {
  if (contribution) {
    return trackAction(userId, userName, '', 'target_contribution', {
      goalId: goalData.id,
      goalName: goalData.n,
      contributionAmount: goalData.wk,
      currentTotal: goalData.cur,
      targetAmount: goalData.tg,
      weekNumber: goalData.wkD,
    });
  } else {
    return trackAction(userId, userName, '', 'target_created', {
      goalName: goalData.n,
      targetAmount: goalData.tg,
      weeklyAmount: goalData.wk,
      totalWeeks: goalData.wks,
    });
  }
};

// 5. INVESTMENT BEHAVIORS
export const trackInvestment = async (userId, userName, investmentData) => {
  return trackAction(userId, userName, '', 'investment_made', {
    investmentId: investmentData.id,
    name: investmentData.n,
    type: investmentData.t,
    amount: investmentData.amt,
    expectedReturns: investmentData.r,
    duration: investmentData.d,
    riskLevel: investmentData.ri,
  });
};

// 6. MONEY USAGE AFTER ROSCA PAYOUT
export const trackPayoutUsage = async (userId, userName, usageData) => {
  return trackAction(userId, userName, '', 'payout_usage', {
    source: 'rosca_payout',
    groupId: usageData.groupId,
    payoutAmount: usageData.amount,
    usageType: usageData.type, // 'fixed_savings', 'investment', 'target', 'withdrawal', 'spent'
    usageAmount: usageData.usedAmount,
    timeSincePayout: usageData.timeSincePayout,
  });
};

// 7. NAVIGATION & ENGAGEMENT
export const trackScreenView = async (userId, userName, screenName, timeSpent = 0) => {
  return trackAction(userId, userName, '', 'screen_view', {
    screenName,
    timeSpent,
  });
};

export const trackFeatureClick = async (userId, userName, featureName) => {
  return trackAction(userId, userName, '', 'feature_click', {
    featureName,
  });
};

// ===== HELPER FUNCTIONS =====
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('research_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('research_session_id', sessionId);
  }
  return sessionId;
};

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
};

// ===== ANALYTICS QUERIES (FOR ADMIN DASHBOARD) =====

export const getAnalyticsSummary = async () => {
  try {
    const actionsSnapshot = await getDocs(collection(db, 'actions'));
    const actions = actionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Extract unique users
    const userIds = [...new Set(actions.map(a => a.userId))];

    const totalUsers = userIds.length;
    const tokenClaims = actions.filter(a => a.actionType === 'token_claim').length;
    const roscaJoins = actions.filter(a => a.actionType === 'rosca_join').length;

    const loansPrompted = actions.filter(a => a.actionType === 'loan_prompt_shown').length;
    const loansTaken = actions.filter(a => a.actionType === 'loan_taken').length;

    const loansDeclined = actions.filter(
      a => a.actionType === 'loan_decision' && a.metadata.decision === 'declined'
    ).length;
    // Extract unique users with names
const userMap = {};

actions.forEach(a => {
  if (!userMap[a.userId]) {
    userMap[a.userId] = {
      name: a.userName || "Unnamed User",
      email: a.userEmail || "",
    };
  }
});

    const loanAcceptanceRate =
      loansPrompted > 0
        ? ((loansTaken / loansPrompted) * 100).toFixed(2)
        : "0.00";

    return {
      actions,         // ✔ RAW ACTIONS (needed)
      userIds,         // ✔ USER LIST (needed)
      totalUsers,
      tokenClaims,
      tokenClaimRate:
        totalUsers > 0
          ? ((tokenClaims / totalUsers) * 100).toFixed(2)
          : "0.00",
      roscaJoins,
      loansPrompted,
      loansTaken,
      loansDeclined,
      loanAcceptanceRate,
      totalActions: actions.length,
      userMap, 
    };

  } catch (error) {
    console.error("Analytics Error:", error);
    return null;
  }
};

export const getUserBehaviorProfile = async (userId) => {
  try {
    const q = query(collection(db, 'actions'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const actions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Build behavior profile
    const profile = {
      userId,
      totalActions: actions.length,
      claimedToken: actions.some(a => a.actionType === 'token_claim'),
      roscaGroups: actions.filter(a => a.actionType === 'rosca_join').length,
      loansBorrowed: actions.filter(a => a.actionType === 'loan_taken').length,
      loansDeclined: actions.filter(a => a.actionType === 'loan_decision' && a.metadata.decision === 'declined').length,
      fixedSavings: actions.filter(a => a.actionType === 'fixed_savings_locked').length,
      investments: actions.filter(a => a.actionType === 'investment_made').length,
      targetGoals: actions.filter(a => a.actionType === 'target_created').length,
      behaviorType: '', // Will calculate
    };
    
    // Classify behavior type
    if (profile.loansBorrowed > profile.fixedSavings + profile.investments) {
      profile.behaviorType = 'Borrower';
    } else if (profile.fixedSavings + profile.investments > profile.loansBorrowed) {
      profile.behaviorType = 'Saver';
    } else {
      profile.behaviorType = 'Balanced';
    }
    
    return profile;
  } catch (error) {
    console.error('User Profile Error:', error);
    return null;
  }
};

export const getLoanBehaviorAnalysis = async () => {
  const snapshot = await getDocs(collection(db, "actions"));
  const actions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const prompts = actions.filter(a => a.actionType === "loan_prompt_shown");
  const decisions = actions.filter(a => a.actionType === "loan_decision");

  const accepted = decisions.filter(d => d.metadata.decision === "accepted");
  const declined = decisions.filter(d => d.metadata.decision === "declined");

  const byReason = {};
  prompts.forEach((p) => {
    const reason = p.metadata.reason;
    if (!byReason[reason]) byReason[reason] = { prompted: 0, accepted: 0, declined: 0 };
    byReason[reason].prompted++;
  });

  accepted.forEach(a => {
    const reason = a.metadata.reason;
    if (byReason[reason]) byReason[reason].accepted++;
  });

  declined.forEach(a => {
    const reason = a.metadata.reason;
    if (byReason[reason]) byReason[reason].declined++;
  });

  return {
    totalPrompts: prompts.length,
    totalAccepted: accepted.length,
    totalDeclined: declined.length,
    acceptanceRate:
      prompts.length > 0 ? ((accepted.length / prompts.length) * 100).toFixed(2) : "0.00",
    byReason,
  };
};


export const getFinancialInclusionMetrics = (actions) => {
  const uniqueUsers = [...new Set(actions.map(a => a.userId))].length;

  const savers = new Set(
    actions.filter(a => 
      a.actionType === 'fixed_savings_locked' ||
      a.actionType === 'investment_made' ||
      a.actionType === 'target_created'
    ).map(a => a.userId)
  ).size;

  return {
    inclusionRate: ((savers / uniqueUsers) * 100).toFixed(1),
    savers,
    totalUsers: uniqueUsers,
  };
};

export const getSavingsMetrics = (actions) => {
  const targetCreations = actions.filter(a => a.actionType === 'target_created').length;
  const targetContributions = actions.filter(a => a.actionType === 'target_contribution').length;
  const fixedSavings = actions.filter(a => a.actionType === 'fixed_savings_locked').length;
  const investments = actions.filter(a => a.actionType === 'investment_made').length;

  return {
    targetCreations,
    targetContributions,
    fixedSavings,
    investments,
    savingsBehaviorScore: (
      (fixedSavings * 0.4 + investments * 0.3 + targetContributions * 0.2) / 10
    ).toFixed(1),
  };
};


export const computeTrustScore = (actions) => {
  const roscaPayments = actions.filter(a => a.actionType === "rosca_payment");
  const loans = actions.filter(a => a.actionType === "loan_taken");
  const joinCount = actions.filter(a => a.actionType === "rosca_join").length;

  // % of payments made on time
  let paymentScore = 0;
  if (roscaPayments.length > 0) {
    const onTime = roscaPayments.filter(a => a.metadata.onTime).length;
    paymentScore = (onTime / roscaPayments.length) * 40;
  }

  const participationScore = Math.min(joinCount * 10, 20); // max 20
  const repaymentScore = Math.min(loans.length * 10, 20); // max 20
  const engagementScore = Math.min(actions.length / 8, 20); // activity weight

  return Math.round(paymentScore + participationScore + repaymentScore + engagementScore);
};



export const computeCreditScore = (actions) => {
  const repayments = actions.filter(a => a.actionType === "loan_repayment").length;
  const loans = actions.filter(a => a.actionType === "loan_taken").length;

  const paymentHistory = Math.min(repayments * 30, 300);    // 35% weight
  const utilization = Math.max(0, 300 - loans * 40);        // 30% weight
  const creditAge = 200;                                    // 15% weight
  const newCredit = Math.max(0, 100 - loans * 10);          // 10% weight
  const mix = 100;                                          // 10% weight

  const score = 300 + paymentHistory + utilization + creditAge + newCredit + mix;
  return Math.min(900, Math.max(300, Math.round(score)));
};


export const getBorrowingBehavior = (actions) => {
  const loans = actions.filter(a => a.actionType === 'loan_taken');

  return {
    borrowingFrequency: loans.length,
    avgLoanAmount: loans.reduce((sum, l) => sum + Number(l.metadata.amount || 0), 0) / (loans.length || 1),
    repaymentRate: actions.filter(a => a.actionType === 'loan_repayment').length > 0
      ? ((actions.filter(a => a.actionType === 'loan_repayment').length) / loans.length * 100).toFixed(1)
      : 0,
  };
};

export const classifyUserBehavior = (actions) => {
  const borrow = actions.filter(a => a.actionType === 'loan_taken').length;
  const save = actions.filter(a => 
    a.actionType === 'fixed_savings_locked' ||
    a.actionType === 'investment_made' ||
    a.actionType === 'target_contribution'
  ).length;

  if (borrow > save) return 'Borrower';
  if (save > borrow) return 'Saver';
  return 'Balanced';
};


export const getRoscaGroupAnalysis = (actions) => {
  const groups = {};

  actions.forEach((a) => {
    if (a.actionType === "rosca_join") {
      const gid = a.metadata.groupId;
      if (!groups[gid]) groups[gid] = { members: 0, contributions: 0 };
      groups[gid].members += 1;
    }

    if (a.actionType === "rosca_payment") {
      const gid = a.metadata.groupId;
      if (!groups[gid]) groups[gid] = { members: 0, contributions: 0 };
      groups[gid].contributions += Number(a.metadata.amount || 0);
    }
  });

  return groups;
};

export const getTotalSavings = (actions) => {
  const savingActions = actions.filter(a =>
    ["target_contribution", "fixed_savings_locked", "investment_made"].includes(a.actionType)
  );

  const total = savingActions.reduce((sum, a) =>
    sum + Number(a.metadata.contributionAmount || a.metadata.amount || 0)
  , 0);

  return {
    totalSavings: total,
    count: savingActions.length,
  };
};

export const getRoscaPoolSummary = (actions) => {
  const groups = {};

  actions
    .filter(a => a.actionType === "rosca_payment")
    .forEach(a => {
      const g = a.metadata.groupId;
      if (!groups[g]) {
        groups[g] = { contributions: 0, members: new Set() };
      }

      groups[g].contributions += Number(a.metadata.amount || 0);
      groups[g].members.add(a.userId);
    });

  return Object.fromEntries(
    Object.entries(groups).map(([gid, data]) => [
      gid,
      {
        totalPool: data.contributions,
        members: data.members.size,
        avgContribution:
          data.members.size > 0
            ? data.contributions / data.members.size
            : 0,
      },
    ])
  );
};

export const getUnbankedUsers = (actions) => {
  const users = {};

  actions.forEach((a) => {
    if (!users[a.userId]) users[a.userId] = { bankLinked: false, saved: false };

    if (a.actionType === "bank_linked") users[a.userId].bankLinked = true;

    if (
      ["target_contribution", "fixed_savings_locked", "rosca_payment"].includes(
        a.actionType
      )
    ) {
      users[a.userId].saved = true;
    }
  });

  const unbanked = Object.entries(users)
    .filter(([id, u]) => u.saved && !u.bankLinked)
    .map(([id]) => id);

  return {
    unbankedCount: unbanked.length,
    users: unbanked,
  };
};


export const getRegularContributionRate = (actions) => {
  const freq = {};

  actions
    .filter(a =>
      ["target_contribution", "fixed_savings_locked", "rosca_payment"].includes(a.actionType)
    )
    .forEach(a => {
      if (!freq[a.userId]) freq[a.userId] = [];
      freq[a.userId].push(a.timestamp?.toMillis?.() || a.timestamp);
    });

  const users = Object.keys(freq);
  if (users.length === 0) {
    return { regulars: 0, rate: 0 };
  }

  let regulars = 0;

  Object.values(freq).forEach(times => {
    const sorted = times.sort();
    if (sorted.length >= 4) regulars++; 
  });

  return {
    regulars,
    rate: ((regulars / users.length) * 100).toFixed(1),
  };
};

export const getSavingsImprovement = (actions) => {
  const users = {};

  actions
    .filter(a =>
      ["target_contribution", "fixed_savings_locked"].includes(a.actionType)
    )
    .forEach(a => {
      if (!users[a.userId]) users[a.userId] = [];
      users[a.userId].push(Number(a.metadata.contributionAmount || a.metadata.amount || 0));
    });

  const userIds = Object.keys(users);
  if (userIds.length === 0) {
    return { improvedUsers: 0, rate: 0 };
  }

  let improved = 0;

  Object.values(users).forEach(amounts => {
    if (amounts.length >= 6) {
      const firstAvg = (amounts[0] + amounts[1] + amounts[2]) / 3;
      const lastAvg = 
        (amounts.at(-1) + amounts.at(-2) + amounts.at(-3)) / 3;

      if (lastAvg > firstAvg) improved++;
    }
  });

  return {
    improvedUsers: improved,
    rate: ((improved / userIds.length) * 100).toFixed(1),
  };
};
;



// ===== EXPORT ALL =====
export default {
  trackAction,
  trackUserRegistration,
  trackTokenClaim,
  trackRoscaView,
  trackRoscaJoin,
  trackRoscaPayment,
  trackRoscaPayout,
  trackLoanPrompt,
  trackLoanDecision,
  trackLoanTaken,
  trackLoanRepayment,
  trackFixedSavings,
  trackTargetSavings,
  trackInvestment,
  trackPayoutUsage,
  trackScreenView,
  trackFeatureClick,
  getAnalyticsSummary,
  getUserBehaviorProfile,
  getLoanBehaviorAnalysis,
  getSavingsImprovement,
  getRegularContributionRate,
  getUnbankedUsers,
  getTotalSavings,
  getRoscaPoolSummary,
};