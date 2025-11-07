// lib/appLogic.js
// Core business logic functions

import { LOAN_CONFIG } from './config';

// Calculate loan amount
export const calculateLoan = (principal) => {
  const interest = principal * LOAN_CONFIG.interestRate;
  return {
    principal,
    interest,
    total: principal + interest,
    interestRate: LOAN_CONFIG.interestRate * 100
  };
};

// Calculate fixed savings returns
export const calculateFixedSavingsReturns = (amount, rate, duration) => {
  const monthsMap = {
    '3 months': 3,
    '6 months': 6,
    '9 months': 9,
    '12 months': 12
  };
  
  const months = monthsMap[duration] || 12;
  const returns = (amount * (rate / 100) * (months / 12));
  
  return {
    principal: amount,
    returns,
    total: amount + returns,
    maturityDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
  };
};

// Calculate investment returns
export const calculateInvestmentReturns = (amount, returnsPercent, duration) => {
  const rate = parseFloat(returnsPercent) / 100;
  const returns = amount * rate;
  
  return {
    principal: amount,
    returns,
    total: amount + returns,
    maturityDate: new Date(Date.now() + parseInt(duration) * 30 * 24 * 60 * 60 * 1000)
  };
};

// Check if user can join ROSCA
export const canJoinRosca = (userData, group) => {
  // Check if already in group
  const alreadyJoined = userData.joinedGroups.some(g => g.id === group.id);
  if (alreadyJoined) return { can: false, reason: 'Already joined this group' };
  
  // Check if group is full
  if (group.currentMembers >= group.maxMembers) {
    return { can: false, reason: 'Group is full' };
  }
  
  // Check wallet balance
  if (userData.walletBalance < group.amount) {
    return { can: false, reason: 'Insufficient balance', needLoan: true, loanAmount: group.amount - userData.walletBalance };
  }
  
  return { can: true };
};

// Process ROSCA weekly deduction
export const processRoscaDeduction = (userData, group) => {
  if (userData.walletBalance >= group.amount) {
    return {
      success: true,
      newBalance: userData.walletBalance - group.amount,
      message: `₦${group.amount.toLocaleString()} deducted for ${group.name}`
    };
  }
  
  return {
    success: false,
    needLoan: true,
    loanAmount: group.amount - userData.walletBalance,
    message: 'Insufficient balance. Would you like a loan?'
  };
};

// Calculate ROSCA payout
export const calculateRoscaPayout = (group, position) => {
  const totalPayout = group.amount * group.maxMembers;
  const weeksToPayout = position; // Week 1, 2, 3, etc.
  const payoutDate = new Date(Date.now() + weeksToPayout * 7 * 24 * 60 * 60 * 1000);
  
  return {
    amount: totalPayout,
    position,
    weeksToPayout,
    payoutDate,
    canLoanAgainst: true, // Can loan before payout
    maxLoanAmount: totalPayout * 0.8 // 80% of expected payout
  };
};

// Process loan against future ROSCA payout
export const loanAgainstRosca = (userData, group) => {
  const userGroup = userData.joinedGroups.find(g => g.id === group.id);
  if (!userGroup) return { success: false, reason: 'Not in this group' };
  
  const payout = calculateRoscaPayout(group, userGroup.payoutPosition);
  const loanAmount = payout.maxLoanAmount;
  const loan = calculateLoan(loanAmount);
  
  return {
    success: true,
    loan: {
      ...loan,
      type: 'ROSCA Advance',
      groupId: group.id,
      groupName: group.name,
      expectedPayout: payout.amount,
      payoutDate: payout.payoutDate
    }
  };
};

// Filter ROSCA groups by tab
export const filterRoscaGroups = (allGroups, userData, tab) => {
  switch(tab) {
    case 'All':
      return allGroups;
    
    case 'Open':
      return allGroups.filter(g => g.currentMembers < g.maxMembers);
    
    case 'Joined':
      const joinedIds = userData.joinedGroups.map(g => g.id);
      return allGroups.filter(g => joinedIds.includes(g.id));
    
    case 'Request':
      const requestIds = userData.groupRequests.map(g => g.id);
      return allGroups.filter(g => requestIds.includes(g.id));
    
    default:
      return allGroups;
  }
};

// Simulate group filling (other users joining)
export const simulateGroupFilling = (groups) => {
  return groups.map(group => {
    // 30% chance every interval that someone joins
    if (group.currentMembers < group.maxMembers && Math.random() > 0.7) {
      return {...group, currentMembers: group.currentMembers + 1};
    }
    return group;
  });
};

// Generate weekly savings target
export const createTargetSavings = (name, targetAmount, weeklyAmount) => {
  const weeks = Math.ceil(targetAmount / weeklyAmount);
  const endDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    targetAmount,
    currentAmount: 0,
    weeklyAmount,
    weeks,
    weeksCompleted: 0,
    startDate: new Date(),
    endDate,
    status: 'Active',
    contributions: []
  };
};

// Process target savings contribution
export const contributeToTargetSavings = (saving, amount) => {
  const newAmount = saving.currentAmount + amount;
  const progress = (newAmount / saving.targetAmount) * 100;
  const isComplete = newAmount >= saving.targetAmount;
  
  return {
    ...saving,
    currentAmount: newAmount,
    weeksCompleted: saving.weeksCompleted + 1,
    status: isComplete ? 'Completed' : 'Active',
    contributions: [
      ...saving.contributions,
      {
        amount,
        date: new Date(),
        week: saving.weeksCompleted + 1
      }
    ],
    progress
  };
};