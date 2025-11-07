// lib/analytics.js
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// ===== CORE TRACKING FUNCTION =====
export const trackAction = async (userId, userName, userEmail, actionType, metadata = {}) => {
  try {
    const actionData = {
      userId,
      userName,
      userEmail,
      actionType,
      metadata,
      timestamp: serverTimestamp(),
      sessionId: getSessionId(),
      deviceInfo: getDeviceInfo(),
    };

    // Save to Firestore
    await addDoc(collection(db, 'actions'), actionData);
    
    // Also log to console for immediate visibility
    console.log('📊 Action Tracked:', actionType, metadata);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Tracking Error:', error);
    return { success: false, error };
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
    const actions = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate key metrics
    const totalUsers = new Set(actions.map(a => a.userId)).size;
    const tokenClaims = actions.filter(a => a.actionType === 'token_claim').length;
    const roscaJoins = actions.filter(a => a.actionType === 'rosca_join').length;
    const loansPrompted = actions.filter(a => a.actionType === 'loan_prompt_shown').length;
    const loansTaken = actions.filter(a => a.actionType === 'loan_taken').length;
    const loansDeclined = actions.filter(a => a.actionType === 'loan_decision' && a.metadata.decision === 'declined').length;
    
    const loanAcceptanceRate = loansPrompted > 0 ? (loansTaken / loansPrompted * 100).toFixed(2) : 0;
    
    return {
      totalUsers,
      tokenClaims,
      tokenClaimRate: ((tokenClaims / totalUsers) * 100).toFixed(2),
      roscaJoins,
      loansPrompted,
      loansTaken,
      loansDeclined,
      loanAcceptanceRate,
      totalActions: actions.length,
    };
  } catch (error) {
    console.error('Analytics Error:', error);
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
  try {
    const actionsSnapshot = await getDocs(collection(db, 'actions'));
    const actions = actionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const loanPrompts = actions.filter(a => a.actionType === 'loan_prompt_shown');
    const loanDecisions = actions.filter(a => a.actionType === 'loan_decision');
    const loansTaken = actions.filter(a => a.actionType === 'loan_taken');
    
    // Group by reason
    const promptsByReason = {};
    loanPrompts.forEach(prompt => {
      const reason = prompt.metadata.reason;
      if (!promptsByReason[reason]) {
        promptsByReason[reason] = { prompted: 0, accepted: 0, declined: 0 };
      }
      promptsByReason[reason].prompted++;
    });
    
    loanDecisions.forEach(decision => {
      const reason = decision.metadata.reason;
      if (promptsByReason[reason]) {
        if (decision.metadata.decision === 'accepted') {
          promptsByReason[reason].accepted++;
        } else {
          promptsByReason[reason].declined++;
        }
      }
    });
    
    return {
      totalPrompts: loanPrompts.length,
      totalAccepted: loansTaken.length,
      totalDeclined: loanDecisions.filter(d => d.metadata.decision === 'declined').length,
      acceptanceRate: ((loansTaken.length / loanPrompts.length) * 100).toFixed(2),
      byReason: promptsByReason,
    };
  } catch (error) {
    console.error('Loan Analysis Error:', error);
    return null;
  }
};

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
};