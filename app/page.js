// app/page.js - Fintech Research MVP - FIXED ANALYTICS
"use client";
import React, { useState, useEffect } from "react";
import {
  Wallet,
  Users,
  Target,
  TrendingUp,
  Shield,
  Send,
  User,
  Home,
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  LogOut,
  ArrowLeft,
  Calendar,
  Leaf,
  Building,
  FileText,
  ArrowUp, // ADD THIS
  ArrowDown, // ADD THIS
  Phone, // ADD THIS
  CreditCard,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import Welcome from "../app/Welcome";
import BaselineSurvey from "../app/BaselineSurvey";
import DashboardScreen from "../app/DashboardScreen";
import DashboardScreenNew from "../app/DashboardScreenNew";
import TrustScorePage from "../app/TrustScorePage";
import AdminAnalytics from "../app/AdminAnalytics";
import ResearchDataScreen from "../app/ResearchDataScreen";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection } from "firebase/firestore";

import {
  trackAction,
  trackUserRegistration,
  trackRoscaJoin,
  trackRoscaPayment,
  trackRoscaPayout,
  trackLoanTaken,
  trackLoanPrompt,
  trackLoanDecision,
  trackFixedSavings,
  trackTargetSavings,
  trackInvestment,
  trackTokenClaim,
} from "../lib/analytics";
import { getCurrencyConfig, CURRENCY_SYMBOLS, TOKEN_AMOUNTS } from "../lib/currencyUtils";

const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

const safeNumber = (val, defaultVal = 0) => {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? defaultVal : num;
};

const safeDate = (dateStr) => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

const safeDivide = (numerator, denominator, defaultVal = 0) => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  return den === 0 ? defaultVal : num / den;
};

const C = {
  p: "#2D9B7B",
  pD: "#1F6B56",
  pL: "#A8E6CF",
  w: "#FFF",
  d: "#1A202C",
  lG: "#F7FAFC",
  g: "#718096",
  wa: "#F6AD55",
  da: "#FC8181",
};

// ===== REAL ROSCA GROUPS (30+ groups for 200 users) =====
// ===== REAL ROSCA GROUPS (30+ groups for 200 users) =====
const INITIAL_ROSCA_GROUPS = [
  // PRE-FILLED ACTIVE GROUPS (Already started with members)
  {
    id: "active1",
    n: "Winners Circle",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 6, // FULL
    ad: "Admin",
    r: 98,
    started: true,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 weeks ago
    members: ["demo1", "demo2", "demo3", "demo4", "demo5", "demo6"],
    memberNames: ["Tunde A.", "Chioma B.", "Yemi C.", "Bola D.", "Kemi E.", "Segun F."],
    weeksPaid: 2,
    currentPayoutPosition: 3,
    nextDeduction: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "active2",
    n: "Dream Team",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 6, // FULL
    ad: "Admin",
    r: 95,
    started: true,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Started 1 month ago
    members: ["demo7", "demo8", "demo9", "demo10", "demo11", "demo12"],
    memberNames: ["Ada M.", "Femi N.", "Grace O.", "John P.", "Peace Q.", "Victor R."],
    weeksPaid: 1,
    currentPayoutPosition: 2,
    nextDeduction: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // ALMOST FULL GROUPS (Filling up fast!)
  {
    id: "filling1",
    n: "Rising Stars",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 4, // 4 out of 6
    ad: "Admin",
    r: 94,
    started: false,
    startDate: null,
    members: ["demo13", "demo14", "demo15", "demo16"],
    memberNames: ["Ayo S.", "Blessing T.", "Chidi U.", "Dayo V."],
  },
  {
    id: "filling2",
    n: "Goal Getters",
    a: 15000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 5, // 5 out of 6 - ONE SPOT LEFT!
    ad: "Admin",
    r: 97,
    started: false,
    startDate: null,
    members: ["demo17", "demo18", "demo19", "demo20", "demo21"],
    memberNames: ["Emeka W.", "Faith X.", "Gift Y.", "Henry Z.", "Ibukun A."],
  },

  // Weekly 3K Groups (Budget friendly - 12 groups)
  {
    id: "wk3k1",
    n: "Budget Squad",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 96,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k2",
    n: "Small Steps",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k3",
    n: "Starter Circle",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k4",
    n: "Young Savers",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k5",
    n: "New Beginnings",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k6",
    n: "Fresh Start",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 95,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k7",
    n: "Baby Steps",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k8",
    n: "Smart Start",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k9",
    n: "Easy Save",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k10",
    n: "Quick Win",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k11",
    n: "First Steps",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "wk3k12",
    n: "Mini Moves",
    a: 3000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 95,
    started: false,
    startDate: null,
  },

  // Weekly 5K Groups (Popular tier - 15 groups)
  {
    id: "wk5k1",
    n: "Weekly Hustlers",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k2",
    n: "Fast Track",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 95,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k3",
    n: "Quick Returns",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 88,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k4",
    n: "Side Hustle",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k5",
    n: "Weekend Squad",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k6",
    n: "Smart Savers",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k7",
    n: "Money Moves",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k8",
    n: "Steady Grind",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k9",
    n: "Goal Getters",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 87,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k10",
    n: "Rising Stars",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k11",
    n: "Progress Circle",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k12",
    n: "Momentum",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k13",
    n: "Win Circle",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k14",
    n: "Success Squad",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "wk5k15",
    n: "Achievers",
    a: 5000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 88,
    started: false,
    startDate: null,
  },

  // Weekly 10K Groups (Mid-tier - 10 groups)
  {
    id: "wk10k1",
    n: "Big Moves",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k2",
    n: "High Rollers",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k3",
    n: "Power Save",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k4",
    n: "Elite Weekly",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k5",
    n: "Wealth Builders",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k6",
    n: "Double Up",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 88,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k7",
    n: "Strong Save",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k8",
    n: "Level Up",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k9",
    n: "Big League",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "wk10k10",
    n: "Premium Squad",
    a: 10000,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 94,
    started: false,
    startDate: null,
  },

  // Monthly 20K Groups (Entry monthly - 8 groups)
  {
    id: "mn20k1",
    n: "Young Professionals",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 95,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k2",
    n: "Steady Growth",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k3",
    n: "Future Fund",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k4",
    n: "Smart Monthly",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k5",
    n: "Career Savers",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k6",
    n: "Monthly Movers",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 88,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k7",
    n: "Progress Path",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "mn20k8",
    n: "Next Level",
    a: 20000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 91,
    started: false,
    startDate: null,
  },

  // Monthly 30K Groups (Popular monthly - 8 groups)
  {
    id: "mn30k1",
    n: "30K Squad",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k2",
    n: "Salary Savers",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k3",
    n: "Smart Money",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 88,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k4",
    n: "Mid Tier",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 93,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k5",
    n: "Core Savers",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k6",
    n: "Solid Ground",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k7",
    n: "Building Blocks",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "mn30k8",
    n: "Foundation",
    a: 30000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 90,
    started: false,
    startDate: null,
  },

  // Monthly 50K Groups (High tier - 6 groups)
  {
    id: "mn50k1",
    n: "50K Club",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 91,
    started: false,
    startDate: null,
  },
  {
    id: "mn50k2",
    n: "Business Builders",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "mn50k3",
    n: "Elite Savers",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 94,
    started: false,
    startDate: null,
  },
  {
    id: "mn50k4",
    n: "Major Moves",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "mn50k5",
    n: "Prime Circle",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "mn50k6",
    n: "Growth Fund",
    a: 50000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 88,
    started: false,
    startDate: null,
  },

  // Monthly 100K Groups (Premium - 4 groups)
  {
    id: "mn100k1",
    n: "Century Club",
    a: 100000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 90,
    started: false,
    startDate: null,
  },
  {
    id: "mn100k2",
    n: "Big League",
    a: 100000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 92,
    started: false,
    startDate: null,
  },
  {
    id: "mn100k3",
    n: "Elite 100",
    a: 100000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 89,
    started: false,
    startDate: null,
  },
  {
    id: "mn100k4",
    n: "Wealth Circle",
    a: 100000,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
  },

  {
    id: "usd1",
    n: "Dollar Hustlers",
    a: 50,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 94,
    started: false,
    startDate: null,
    currency: "USD",
  },
  {
    id: "usd2",
    n: "USD Savers",
    a: 100,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 92,
    started: false,
    startDate: null,
    currency: "USD",
  },
  {
    id: "usd3",
    n: "Green Circle",
    a: 75,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 90,
    started: false,
    startDate: null,
    currency: "USD",
  },
  {
    id: "usd4",
    n: "Dollar Squad",
    a: 200,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
    currency: "USD",
  },
  {
    id: "usd5",
    n: "US Wealth",
    a: 150,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 91,
    started: false,
    startDate: null,
    currency: "USD",
  },
  {
    id: "usd6",
    n: "America Circle",
    a: 300,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 95,
    started: false,
    startDate: null,
    currency: "USD",
  },

  // GBP Groups - 6 groups
  {
    id: "gbp1",
    n: "Pound Power",
    a: 40,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 93,
    started: false,
    startDate: null,
    currency: "GBP",
  },
  {
    id: "gbp2",
    n: "Sterling Savers",
    a: 80,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 91,
    started: false,
    startDate: null,
    currency: "GBP",
  },
  {
    id: "gbp3",
    n: "UK Circle",
    a: 60,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 94,
    started: false,
    startDate: null,
    currency: "GBP",
  },
  {
    id: "gbp4",
    n: "London Squad",
    a: 150,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 92,
    started: false,
    startDate: null,
    currency: "GBP",
  },
  {
    id: "gbp5",
    n: "British Wealth",
    a: 200,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 90,
    started: false,
    startDate: null,
    currency: "GBP",
  },
  {
    id: "gbp6",
    n: "Pound Circle",
    a: 250,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 95,
    started: false,
    startDate: null,
    currency: "GBP",
  },

  // EUR Groups - 6 groups
  {
    id: "eur1",
    n: "Euro Savers",
    a: 45,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 92,
    started: false,
    startDate: null,
    currency: "EUR",
  },
  {
    id: "eur2",
    n: "EU Circle",
    a: 90,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 94,
    started: false,
    startDate: null,
    currency: "EUR",
  },
  {
    id: "eur3",
    n: "Euro Power",
    a: 65,
    f: "Weekly",
    d: "6w",
    m: 6,
    c: 0,
    ad: "Yemi",
    r: 91,
    started: false,
    startDate: null,
    currency: "EUR",
  },
  {
    id: "eur4",
    n: "Europe Squad",
    a: 180,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Bola",
    r: 93,
    started: false,
    startDate: null,
    currency: "EUR",
  },
  {
    id: "eur5",
    n: "Continental Wealth",
    a: 220,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Tunde",
    r: 90,
    started: false,
    startDate: null,
    currency: "EUR",
  },
  {
    id: "eur6",
    n: "Euro Elite",
    a: 280,
    f: "Monthly",
    d: "6m",
    m: 6,
    c: 0,
    ad: "Chioma",
    r: 95,
    started: false,
    startDate: null,
    currency: "EUR",
  },
];

// ===== INVESTMENTS =====
const IV = [
  {
    id: "sf1",
    n: "SupreFarm - Rice",
    t: "Agriculture",
    r: "18%",
    d: "6m",
    mi: 50000,
    ri: "Low",
    ds: "Climate-smart rice farming with guaranteed harvest-backed returns",
  },
  {
    id: "sf2",
    n: "SupreFarm - Maize",
    t: "Agriculture",
    r: "15%",
    d: "4m",
    mi: 30000,
    ri: "Low",
    ds: "Sustainable maize production with predictable yields",
  },
  {
    id: "sf3",
    n: "SupreFarm - Poultry",
    t: "Agriculture",
    r: "20%",
    d: "3m",
    mi: 40000,
    ri: "Low",
    ds: "Fast-cycle poultry farming with high returns",
  },
  {
    id: "ab1",
    n: "Airbnb Co-hosting",
    t: "Real Estate",
    r: "25%",
    d: "12m",
    mi: 100000,
    ri: "Medium",
    ds: "Share in Airbnb property revenue streams with monthly payouts",
  },
  {
    id: "ab2",
    n: "Short Stay Property",
    t: "Real Estate",
    r: "30%",
    d: "12m",
    mi: 200000,
    ri: "Medium",
    ds: "Own a share of vacation rental properties in prime locations",
  },
  {
    id: "tb1",
    n: "Treasury Bills",
    t: "Government",
    r: "12%",
    d: "3m",
    mi: 10000,
    ri: "Very Low",
    ds: "Government-backed securities with zero default risk",
  },
  {
    id: "tech1",
    n: "Tech Startup Fund",
    t: "Equity",
    r: "40%",
    d: "12m",
    mi: 150000,
    ri: "High",
    ds: "Invest in pre-seed Nigerian tech startups. High risk, high reward",
  },
];

// ===== FIXED SAVINGS PLANS =====
const FS = [
  { d: "3m", r: 8, mi: 10000, label: "3 Months - 8% Returns" },
  { d: "6m", r: 12, mi: 25000, label: "6 Months - 12% Returns" },
  { d: "9m", r: 15, mi: 50000, label: "9 Months - 15% Returns" },
  { d: "12m", r: 18, mi: 50000, label: "12 Months - 18% Returns" },
];

export default function App() {
  const [s, sS] = useState("splash");
  const [uR, sUR] = useState("user");

  const [uD, sUD] = useState(null);
  const [aG, sAG] = useState([...INITIAL_ROSCA_GROUPS]);
  const [sG, sSG] = useState(null);
  const [sI, sSI] = useState(null);
  const [rT, sRT] = useState("All");
  const [sL, sSL] = useState(false);
  const [showLoanPrompt, setShowLoanPrompt] = useState(false);
  const [promptedGroup, setPromptedGroup] = useState(null);

  // ===== Firebase Auth =====
  // Load groups from Firebase on app start - MULTIPLE TRIGGERS
  useEffect(() => {
    if (uD?.id && auth?.currentUser) {
      console.log("🎯 Triggering group load for user:", uD.name);
      loadGroupsFromFirebase();
    }
  }, [uD?.id, auth?.currentUser?.uid]); // Watch both user data AND auth state

  // ALSO load when user completes signup/login
  useEffect(() => {
    if (s === "dashboard" && uD?.id) {
      console.log("🎯 Dashboard loaded, ensuring groups are fresh");
      setTimeout(() => {
        loadGroupsFromFirebase();
      }, 500); // Small delay to ensure auth is ready
    }
  }, [s, uD?.id]);

  // Expose seeding function globally for button access
  useEffect(() => {
    window.seedGroupsToFirebase = seedGroupsToFirebase;
    window.loadGroupsFromFirebase = loadGroupsFromFirebase;

    return () => {
      delete window.seedGroupsToFirebase;
      delete window.loadGroupsFromFirebase;
    };
  }, []);

// 🔥 REAL-TIME GROUP SYNC - All users see updates instantly
useEffect(() => {
  if (!auth?.currentUser) return;

  console.log("🎯 Starting real-time group listener");

  // Create array to store unsubscribe functions
  const unsubscribers = [];

  // Listen to each group individually for real-time updates
  INITIAL_ROSCA_GROUPS.forEach((group) => {
    const groupRef = doc(db, "groups", group.id);
    
    const unsubscribe = onSnapshot(
      groupRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const updatedGroup = docSnap.data();
          
          // Update local state with new group data
          sAG((prevGroups) =>
            prevGroups.map((g) =>
              g.id === group.id ? updatedGroup : g
            )
          );

          console.log(`✅ Real-time update: ${updatedGroup.n} (${updatedGroup.c}/${updatedGroup.m})`);
        } else {
          // Group doesn't exist in Firebase yet, use local definition
          sAG((prevGroups) =>
            prevGroups.map((g) => (g.id === group.id ? group : g))
          );
        }
      },
      (error) => {
        console.error(`❌ Error listening to ${group.id}:`, error);
      }
    );

    unsubscribers.push(unsubscribe);
  });

  // Cleanup: unsubscribe from all listeners when component unmounts
  return () => {
    console.log("🛑 Stopping real-time group listeners");
    unsubscribers.forEach((unsub) => unsub());
  };
}, [auth?.currentUser?.uid]); // Re-run when user changes


// 🔥 REAL-TIME USER DATA SYNC
useEffect(() => {
  if (!uD?.id || !auth?.currentUser) return;

  console.log("🎯 Starting real-time user data listener");

  const userRef = doc(db, "users", uD.id);
  
  const unsubscribe = onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const freshUserData = docSnap.data();
        sUD(freshUserData);
        console.log("✅ User data synced:", freshUserData.name);
      }
    },
    (error) => {
      console.error("❌ Error syncing user data:", error);
    }
  );

  return () => {
    console.log("🛑 Stopping user data listener");
    unsubscribe();
  };
}, [uD?.id, auth?.currentUser?.uid]);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const userData = snap.data();

          sUD(userData);
          sUR(userData.role);

          sS("dashboard");
        }
      } else {
        sS("welcome");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (s === "splash") setTimeout(() => sS("welcome"), 2500);
  }, [s]);

  // ===== EXPOSE AUTO-FILL FOR TESTING =====
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.autoFillGroup = autoFillGroup;
      console.log("🧪 Test helper available: window.autoFillGroup('groupId')");
    }
  }, []);

  // ===== REAL-TIME GROUP UPDATES =====
  useEffect(() => {
    if (!auth?.currentUser || !uD?.jG || uD.jG.length === 0) {
      return;
    }

    console.log("🔄 Setting up real-time group listeners for", uD.jG.length, "groups");

    // Create listeners for each group the user has joined
    const unsubscribers = [];

    uD.jG.forEach((joinedGroup) => {
      const groupRef = doc(db, "groups", joinedGroup.id);

      const unsubscribe = onSnapshot(groupRef, (snapshot) => {
        if (snapshot.exists()) {
          const updatedGroupData = snapshot.data();
          console.log(`🔔 Group update: ${updatedGroupData.n} - ${updatedGroupData.c}/${updatedGroupData.m} members`);

          // Update the user's joined groups with the latest data
          sUD(prevUserData => {
            const updatedJoinedGroups = prevUserData.jG.map(group => {
              if (group.id === joinedGroup.id) {
                return {
                  ...group,
                  c: updatedGroupData.c,
                  members: updatedGroupData.members,
                  memberNames: updatedGroupData.memberNames,
                  started: updatedGroupData.started,
                  nextDeduction: updatedGroupData.nextDeduction,
                  weeksPaid: updatedGroupData.weeksPaid
                };
              }
              return group;
            });

            return {
              ...prevUserData,
              jG: updatedJoinedGroups
            };
          });
        }
      }, (error) => {
        console.error(`❌ Error listening to group ${joinedGroup.id}:`, error);
      });

      unsubscribers.push(unsubscribe);
    });

    // Cleanup all listeners on unmount
    return () => {
      console.log("🛑 Cleaning up group listeners");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [uD?.id, uD?.jG?.length]); // Re-run when user joins/leaves groups

  // ===== ROSCA WEEKLY DEDUCTION SIMULATION =====
  useEffect(() => {
    if (!uD || !uD.jG) return;

    const interval = setInterval(() => {
      uD.jG.forEach((joinedGroup) => {
        processWeeklyDeduction(joinedGroup);
      });
    }, 15000); // runs every 15 seconds for testing

    return () => clearInterval(interval);
  }, [uD?.jG]);

  const svD = async (u) => {
    const newData = { ...uD, ...u };
    sUD(newData);
    if (uD.id) await updateDoc(doc(db, "users", uD.id), u);
  };

  // ===== FIREBASE GROUP SEEDING & LOADING =====

  // Seed groups to Firebase with random member counts
  const seedGroupsToFirebase = async () => {
    console.log("🌱 Starting Firebase group seeding...");

    try {
      let created = 0;
      let skipped = 0;

      for (const group of INITIAL_ROSCA_GROUPS) {
        const groupRef = doc(db, "groups", group.id);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          // If group has pre-filled member data, use it; otherwise random
          const hasPrefilledMembers = group.members && group.members.length > 0;
          const memberCount = hasPrefilledMembers
            ? group.c || group.members.length
            : Math.floor(Math.random() * 6); // 0 to 5

          await setDoc(groupRef, {
            ...group,
            c: memberCount, // Current member count
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            members: group.members || [], // Use pre-filled members or empty
            memberNames: group.memberNames || [], // Use pre-filled names or empty
          });

          created++;
          console.log(
            `✅ Created: ${group.n} (${memberCount}/${group.m} members)${hasPrefilledMembers ? ' [Pre-filled]' : ''}`
          );
        } else {
          skipped++;
          console.log(`⏭️ Skipped: ${group.n} (already exists)`);
        }
      }

      console.log(
        `✅ Seeding complete! Created: ${created}, Skipped: ${skipped}`
      );
      alert(
        `✅ Groups Database Initialized!\n\n` +
          `Created: ${created} groups\n` +
          `Skipped: ${skipped} existing\n\n` +
          `Groups now have realistic member counts!`
      );

      // Reload groups from Firebase
      await loadGroupsFromFirebase();
    } catch (error) {
      console.error("❌ Seeding error:", error);
      alert(`❌ Seeding failed: ${error.message}`);
    }
  };

  // ===== AUTO-FILL GROUP WITH DUMMY USERS FOR TESTING =====
  const autoFillGroup = async (groupId) => {
    console.log(`🤖 Auto-filling group: ${groupId}`);

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        alert("❌ Group not found!");
        return;
      }

      const groupData = groupSnap.data();
      const currentMembers = groupData.members || [];
      const currentMemberNames = groupData.memberNames || [];
      const maxMembers = groupData.m || 6;
      const slotsToFill = maxMembers - currentMembers.length;

      if (slotsToFill <= 0) {
        alert("✅ Group is already full!");
        return;
      }

      // Generate dummy test users
      const dummyNames = [
        "Adewale Johnson", "Chioma Okafor", "Yemi Adeleke",
        "Bola Adeyemi", "Kemi Oladipo", "Segun Fashola",
        "Ngozi Umeh", "Tunde Bakare", "Folake Oni"
      ];

      const newMembers = [];
      const newMemberNames = [];

      for (let i = 0; i < slotsToFill; i++) {
        const dummyId = `test_user_${Date.now()}_${i}`;
        const dummyName = dummyNames[currentMembers.length + i] || `Test User ${i + 1}`;
        newMembers.push(dummyId);
        newMemberNames.push(dummyName);
      }

      // Calculate next deduction date (7 days from now)
      const nextDeduction = new Date();
      nextDeduction.setDate(nextDeduction.getDate() + 7);

      // Update group to be full and started
      await updateDoc(groupRef, {
        c: maxMembers,
        members: [...currentMembers, ...newMembers],
        memberNames: [...currentMemberNames, ...newMemberNames],
        started: true,
        weeksPaid: 0,
        nextDeduction: nextDeduction.toISOString(),
        lastUpdated: new Date().toISOString()
      });

      console.log(`✅ Group filled! Added ${slotsToFill} dummy users`);
      alert(
        `✅ Group Auto-Filled!\n\n` +
        `Group: ${groupData.n}\n` +
        `Added: ${slotsToFill} dummy members\n` +
        `Status: STARTED\n` +
        `Next payment: ${nextDeduction.toLocaleDateString()}\n\n` +
        `Members: ${[...currentMemberNames, ...newMemberNames].join(", ")}`
      );

      // Reload groups
      await loadGroupsFromFirebase();
    } catch (error) {
      console.error("❌ Auto-fill error:", error);
      alert(`❌ Auto-fill failed: ${error.message}`);
    }
  };

  // Load groups from Firebase
  const loadGroupsFromFirebase = async () => {
    console.log("📥 Loading groups from Firebase...");
    console.log("Auth state:", auth?.currentUser?.uid);
    console.log("User data:", uD?.id, uD?.name);

    if (!auth?.currentUser) {
      console.warn("⚠️ No authenticated user, skipping group load");
      return;
    }

    try {
      const loadedGroups = [];
      let successCount = 0;
      let failCount = 0;

      for (const group of INITIAL_ROSCA_GROUPS) {
        const groupRef = doc(db, "groups", group.id);

        try {
          const groupSnap = await getDoc(groupRef);

          if (groupSnap.exists()) {
            const groupData = groupSnap.data();
            loadedGroups.push(groupData);
            successCount++;
            console.log(`✅ ${group.n}: ${groupData.c}/${groupData.m} members`);
          } else {
            // Group not in Firebase, use local definition
            loadedGroups.push(group);
            failCount++;
            console.warn(
              `⚠️ ${group.n} not in Firebase, using local (c: ${group.c})`
            );
          }
        } catch (error) {
          console.error(`❌ Error loading ${group.id}:`, error);
          loadedGroups.push(group);
          failCount++;
        }
      }

      sAG(loadedGroups);
      console.log(
        `✅ Loaded ${successCount} from Firebase, ${failCount} from local`
      );

      // Alert user if mostly failed
      if (failCount > 70) {
        console.warn(
          "⚠️ Most groups loaded from local data - Firebase might not be seeded"
        );
        // Don't alert users, just log for debugging
      }
    } catch (error) {
      console.error("❌ Critical error loading groups:", error);
      console.error("Error details:", error.code, error.message);

      // Fallback to local groups
      sAG([...INITIAL_ROSCA_GROUPS]);

      // Only alert on critical errors
      if (error.code === "permission-denied") {
        alert(
          "⚠️ Permission denied loading groups. Please check Firebase rules."
        );
      }
    }
  };

  // Refresh a single group from Firebase
  const refreshGroupFromFirebase = async (groupId) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const updatedGroup = groupSnap.data();
        sAG((prevGroups) =>
          prevGroups.map((g) => (g.id === groupId ? updatedGroup : g))
        );
        return updatedGroup;
      }
    } catch (error) {
      console.error("Error refreshing group:", error);
    }
  };

  // ===== INITIALS AVATAR COMPONENT =====
  const InitialsAvatar = ({ name, size = 40 }) => {
    const getInitials = (name) => {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    };

    const getColor = (name) => {
      const colors = [
        "#2D9B7B",
        "#3B82F6",
        "#F59E0B",
        "#10B981",
        "#8B5CF6",
        "#06B6D4",
        "#EC4899",
        "#F97316",
        "#14B8A6",
        "#6366F1",
      ];
      const index = (name || "U").charCodeAt(0) % colors.length;
      return colors[index];
    };

    return (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white"
        style={{
          width: size,
          height: size,
          backgroundColor: getColor(name),
          fontSize: size * 0.4,
        }}
      >
        {getInitials(name)}
      </div>
    );
  };

  const hSU = async (e, p, n, ph, r, currency) => {
    try {
      const uC = await createUserWithEmailAndPassword(auth, e, p);
      const u = uC.user;

      // 🔒 SAFE INITIALIZATION with MULTI-CURRENCY
      const nD = {
        id: u.uid,
        email: e,
        name: n || "User",
        phone: ph || "",
        role: r || "user",

        // 💱 NEW: Multi-currency wallets
        wallets: {
          NGN: 0,
          USD: 0,
          EUR: 0,
          GBP: 0,
        },

        wb: 0,
        selectedCurrency: currency || "NGN",

        at: 0,
        cs: 0,
        hC: false,
        jG: [], // Empty - users join groups themselves
        gR: [],
        ln: [],
        fS: [],
        tS: [],
        inv: [],
        kycComplete: false,
        createdAt: new Date().toISOString(),

        // Perfect scores for new users until behavior changes them
        trustScore: 100,
        creditScore: 850,

        // Baseline survey data (to be filled later)
        baselineSurvey: null,
        surveyCompletedAt: null,
        baselineSurveySkipped: false,
      };

      await setDoc(doc(db, "users", u.uid), nD);
      await trackUserRegistration(nD);

      sUD(nD);
      sUR(r);

      console.log("✅ User registered successfully:", {
        userId: u.uid,
        name: nD.name,
        currency: nD.selectedCurrency
      });

      sS("kyc");
      return { success: true };
    } catch (er) {
      console.error("Signup error:", er);
      alert("Error: " + er.message);
      return { success: false, error: er };
    }
  };

  const hLI = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const userData = snap.data();
        sUD(userData);
        sUR(userData.role);
        await trackAction(
          userData.id,
          userData.name || "Unknown",
          userData.email || "",
          "logged_in",
          {}
        );

        // 🔥 FORCE LOAD GROUPS AFTER LOGIN
        console.log("🔄 Loading groups after login...");
        setTimeout(async () => {
          await loadGroupsFromFirebase();
          console.log("✅ Groups loaded after login");
        }, 500);

        sS("dashboard");
        return { success: true };
      } else {
        alert("User record not found.");
        return { success: false };
      }
    } catch (err) {
      alert("Login failed: " + err.message);
      return { success: false };
    }
  };

  const hLO = async () => {
    if (uD) {
      await trackAction(
        uD.id,
        uD.name || "Unknown",
        uD.email || "",
        "logged_out",
        {}
      );
    }
    await signOut(auth);
    sS("welcome");
  };

  // ===== CLAIM RESEARCH TOKEN =====
  const claimToken = async () => {
    // 🔒 CRITICAL: Check if already claimed
    if (uD?.hC === true) {
      alert("❌ You've already claimed your research token!");
      return;
    }

    // 💱 Use user's selected currency automatically
    const userCurrency = uD?.selectedCurrency || "NGN";
    const currencyConfig = getCurrencyConfig(userCurrency);

    const currency = {
      code: currencyConfig.code,
      amount: currencyConfig.tokenAmount,
      symbol: currencyConfig.symbol
    };

    try {
      const userRef = doc(db, "users", uD.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().hC === true) {
        alert("❌ Token already claimed!");
        sUD({ ...uD, hC: true });
        return;
      }

      // Update with multi-currency
      const newWallets = {
        ...uD.wallets,
        [currency.code]: (uD.wallets?.[currency.code] || 0) + currency.amount,
      };

      await updateDoc(userRef, {
        wallets: newWallets,
        wb: currency.code === "NGN" ? newWallets.NGN : uD.wb, // Keep wb synced with NGN
        selectedCurrency: currency.code,
        at: currency.amount,
        hC: true,
        tokenClaimedAt: new Date().toISOString(),
      });

      await trackTokenClaim(uD.id, uD.name || "Unknown", true);

      sUD({
        ...uD,
        wallets: newWallets,
        wb: currency.code === "NGN" ? newWallets.NGN : uD.wb,
        selectedCurrency: currency.code,
        at: currency.amount,
        hC: true,
      });

      alert(
        `✅ ${
          currency.symbol
        }${currency.amount.toLocaleString()} research token added to your ${
          currency.code
        } wallet!`
      );
      console.log("✅ Token claim tracked");
    } catch (error) {
      console.error("Token claim error:", error);
      alert("❌ Error claiming token. Please try again.");
    }
  };
  // ===== MIGRATE OLD USERS TO MULTI-CURRENCY =====
  const migrateToMultiCurrency = async () => {
    if (uD && !uD.wallets && uD.wb !== undefined) {
      console.log("🔄 Migrating user to multi-currency system...");

      const wallets = {
        NGN: uD.wb || 0, // Move existing balance to NGN wallet
        USD: 0,
        EUR: 0,
        GBP: 0,
      };

      await svD({
        wallets,
        selectedCurrency: "NGN",
      });

      console.log("✅ Migration complete!", wallets);
      alert(
        "✅ Your wallet has been upgraded to multi-currency!\n\nYour ₦ balance has been preserved."
      );
    }
  };

  // Call migration when user data loads
  useEffect(() => {
    if (uD && !uD.wallets && uD.wb !== undefined) {
      migrateToMultiCurrency();
    }
  }, [uD]);

  // ===== CURRENCY EXCHANGE =====
  const exchangeCurrency = async (fromCurrency, toCurrency, amount) => {
    try {
      // 🔒 Initialize wallets if they don't exist
      const currentWallets = uD.wallets || {
        NGN: uD.wb || 0,
        USD: 0,
        EUR: 0,
        GBP: 0,
      };

      const currentBalance = currentWallets[fromCurrency] || 0;

      if (currentBalance < amount) {
        alert(
          `❌ Insufficient ${fromCurrency} balance!\nYou have: ${currentBalance.toLocaleString()}`
        );
        return;
      }

      // Exchange rates (simplified for research)
      const rates = {
        NGN: { USD: 0.00063, EUR: 0.00059, GBP: 0.0005, NGN: 1 },
        USD: { NGN: 1580, EUR: 0.94, GBP: 0.79, USD: 1 },
        EUR: { NGN: 1680, USD: 1.06, GBP: 0.84, EUR: 1 },
        GBP: { NGN: 2000, USD: 1.27, EUR: 1.19, GBP: 1 },
      };

      const rate = rates[fromCurrency][toCurrency];
      const convertedAmount = amount * rate;
      const fee = convertedAmount * 0.01; // 1% exchange fee
      const finalAmount = convertedAmount - fee;

      const confirmed = confirm(
        `💱 Currency Exchange\n\n` +
          `From: ${amount.toLocaleString()} ${fromCurrency}\n` +
          `To: ${finalAmount.toFixed(2)} ${toCurrency}\n` +
          `Rate: 1 ${fromCurrency} = ${rate} ${toCurrency}\n` +
          `Fee: ${fee.toFixed(2)} ${toCurrency} (1%)\n\n` +
          `Proceed with exchange?`
      );

      if (!confirmed) return;

      const newWallets = {
        ...currentWallets,
        [fromCurrency]: currentWallets[fromCurrency] - amount,
        [toCurrency]: (currentWallets[toCurrency] || 0) + finalAmount,
      };

      await svD({
        wallets: newWallets,
        wb: newWallets.NGN, // Keep wb synced with NGN for backward compatibility
      });

      alert(
        `✅ Exchange successful!\n\n` +
          `Sent: ${amount.toLocaleString()} ${fromCurrency}\n` +
          `Received: ${finalAmount.toFixed(2)} ${toCurrency}\n` +
          `Fee: ${fee.toFixed(2)} ${toCurrency}`
      );

      console.log("✅ Currency exchange completed:", {
        from: fromCurrency,
        to: toCurrency,
        amount,
        finalAmount,
      });
    } catch (error) {
      console.error("Exchange error:", error);
      alert("❌ Exchange failed. Please try again.");
    }
  };
  // ===== ROSCA: Join Group (FIREBASE VERSION - FIXED) =====
  const jRG = async (g) => {
    try {
      // 🔒 VALIDATE GROUP DATA
      if (!g || !g.id || !g.a || !g.m) {
        alert("❌ Invalid group data!");
        return;
      }

      // 🔒 CHECK IF ALREADY JOINED
      if (safeArray(uD.jG).some((jg) => jg.id === g.id)) {
        alert("❌ You've already joined this group!");
        return;
      }

      // 💱 GET CURRENCY INFO
      const currency = g.currency || "NGN";
      const wallets = uD.wallets || { NGN: uD.wb || 0, USD: 0, EUR: 0, GBP: 0 };
      const currentBalance = wallets[currency] || 0;
      const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
      const symbol = symbols[currency];

      // 🔒 CHECK GROUP CAPACITY (Re-check from Firebase)
      const groupRef = doc(db, "groups", g.id);
      const groupSnap = await getDoc(groupRef);

      let currentGroup;
      if (groupSnap.exists()) {
        currentGroup = groupSnap.data();
      } else {
        currentGroup = g;
      }

      if (currentGroup.c >= currentGroup.m) {
        alert("❌ Group is now full!");
        sAG(aG.map((gr) => (gr.id === g.id ? currentGroup : gr)));
        return;
      }

      // 🔒 CHECK IF USER HAS ENOUGH BALANCE (even though we won't deduct yet)
      if (currentBalance < g.a) {
        alert(
          `❌ You need ${symbol}${g.a.toLocaleString()} in your ${currency} wallet to join this group!\n\n` +
            `Your ${currency} balance: ${symbol}${currentBalance.toLocaleString()}\n\n` +
            `💡 Money will be deducted when the group is full.`
        );

        if (uR !== "superadmin") {
          await trackLoanPrompt(
            uD.id,
            uD.name || "Unknown",
            "rosca_join",
            g.id
          );
          setPromptedGroup(g);
          setShowLoanPrompt(true);
        }
        return;
      }

      // ✅ JOIN GROUP SUCCESSFULLY
      const position = currentGroup.c + 1;
      const totalPayout = g.a * g.m;
      const isLastMember = position === g.m;

      // If this is the last member, START the group!
      const groupStartDate = isLastMember ? new Date().toISOString() : null;
      const groupStarted = isLastMember;

      // 🔥 UPDATE GROUP IN FIREBASE
      // Get user's display name for member tracking
      const userName = uD.name || uD.email?.split('@')[0] || `User ${uD.id.substring(0, 6)}`;

      if (groupSnap.exists()) {
        await updateDoc(groupRef, {
          c: position,
          started: groupStarted,
          startDate: groupStartDate,
          lastUpdated: new Date().toISOString(),
          members: [...(currentGroup.members || []), uD.id],
          memberNames: [...(currentGroup.memberNames || []), userName],
        });
      } else {
        await setDoc(groupRef, {
          ...g,
          c: position,
          started: groupStarted,
          startDate: groupStartDate,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          members: [uD.id],
          memberNames: [userName],
        });
      }

      if (isLastMember) {
        const updatedGroupSnap = await getDoc(groupRef);
        if (updatedGroupSnap.exists()) {
          await deductFirstContributionFromAllMembers(
            g.id,
            updatedGroupSnap.data()
          );
        }
      }
      // Update local group state
      const updatedGroups = aG.map((gr) =>
        gr.id === g.id
          ? {
              ...gr,
              c: position,
              started: groupStarted,
              startDate: groupStartDate,
            }
          : gr
      );
      sAG(updatedGroups);

      const updatedGroup = updatedGroups.find((gr) => gr.id === g.id);

      // 💰 ONLY DEDUCT MONEY IF GROUP IS STARTING NOW (last member joined)
      let newWallets = wallets;
      let weeksPaid = 0;
      let nextDeduction = null;

      if (isLastMember) {
        // Group is full! Deduct first contribution
        newWallets = {
          ...wallets,
          [currency]: currentBalance - g.a,
        };
        weeksPaid = 1;
        nextDeduction = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        console.log(
          `💸 Group started! First contribution deducted: ${symbol}${g.a.toLocaleString()}`
        );
      } else {
        // Group not full yet, no deduction
        console.log(
          `⏳ Spot reserved. No deduction until group is full (${position}/${g.m})`
        );
      }

      // Update user data
      await svD({
        wallets: newWallets,
        wb: newWallets.NGN,
        jG: [
          ...safeArray(uD.jG),
          {
            ...updatedGroup,
            currency: currency,
            jAt: new Date().toISOString(),
            pos: position,
            payoutWeek: position,
            totalPayout: totalPayout,
            weeksPaid: weeksPaid,
            nextDeduction: nextDeduction,
            paid: false,
            started: groupStarted,
            startDate: groupStartDate,
          },
        ],
        gR: safeArray(uD.gR).filter((r) => r.id !== g.id),
      });

      // Track analytics
      await trackRoscaJoin(uD.id, uD.name || "Unknown", {
        id: updatedGroup.id,
        n: updatedGroup.n,
        a: updatedGroup.a,
        f: updatedGroup.f,
        m: updatedGroup.m,
        pos: position,
        currency: currency,
        hadBalance: true,
        tookLoan: false,
      });

      console.log("✅ ROSCA join tracked");

      // Show appropriate success message
      if (isLastMember) {
        alert(
          `🎉 GROUP STARTED! You're the final member!\n\n` +
            `Currency: ${currency}\n` +
            `First contribution: ${symbol}${g.a.toLocaleString()} (deducted now)\n` +
            `Next payment: in 7 days\n` +
            `Position: #${position}\n` +
            `Your payout week: Week ${position}\n` +
            `Expected payout: ${symbol}${totalPayout.toLocaleString()}`
        );
      } else {
        alert(
          `✅ Spot Reserved in ${updatedGroup.n}!\n\n` +
            `Currency: ${currency}\n` +
            `Position: #${position}/${g.m}\n` +
            `Required contribution: ${symbol}${g.a.toLocaleString()}\n` +
            `Expected payout: ${symbol}${totalPayout.toLocaleString()}\n\n` +
            `⏳ Waiting for ${g.m - position} more member${
              g.m - position > 1 ? "s" : ""
            }\n` +
            `💡 Your first payment will be deducted when the group fills up`
        );
      }

      // Refresh groups from Firebase
      await loadGroupsFromFirebase();

      sS("rosca");
    } catch (error) {
      console.error("Join group error:", error);
      alert("❌ Error joining group. Please try again.");
    }
  };

  // ===== DEDUCT FIRST CONTRIBUTION FROM ALL MEMBERS WHEN GROUP STARTS =====
  const deductFirstContributionFromAllMembers = async (groupId, groupData) => {
    console.log(
      `💸 Processing first deduction for all members of ${groupData.n}`
    );

    try {
      const memberIds = groupData.members || [];
      const currency = groupData.currency || "NGN";
      const amount = groupData.a;
      const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
      const symbol = symbols[currency];

      for (const memberId of memberIds) {
        // Skip current user (already deducted in jRG)
        if (memberId === uD.id) continue;

        try {
          const memberRef = doc(db, "users", memberId);
          const memberSnap = await getDoc(memberRef);

          if (memberSnap.exists()) {
            const memberData = memberSnap.data();
            const memberWallets = memberData.wallets || {
              NGN: memberData.wb || 0,
              USD: 0,
              EUR: 0,
              GBP: 0,
            };
            const memberBalance = memberWallets[currency] || 0;

            if (memberBalance >= amount) {
              // Deduct first contribution
              const newWallets = {
                ...memberWallets,
                [currency]: memberBalance - amount,
              };

              // Update their joined group to mark payment
              const updatedJoinedGroups = memberData.jG.map((jg) =>
                jg.id === groupId
                  ? {
                      ...jg,
                      weeksPaid: 1,
                      started: true,
                      startDate: groupData.startDate,
                      nextDeduction: new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                      ).toISOString(),
                    }
                  : jg
              );

              await updateDoc(memberRef, {
                wallets: newWallets,
                wb: newWallets.NGN,
                jG: updatedJoinedGroups,
              });

              console.log(
                `✅ Deducted ${symbol}${amount.toLocaleString()} from ${
                  memberData.name
                }`
              );
            } else {
              console.warn(
                `⚠️ ${memberData.name} has insufficient balance for first deduction`
              );
            }
          }
        } catch (error) {
          console.error(`Error deducting from member ${memberId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in deductFirstContributionFromAllMembers:", error);
    }
  };

  // ===== ROSCA: Weekly Deduction =====
  const processWeeklyDeduction = async (joinedGroup) => {
    if (!joinedGroup.started || !joinedGroup.startDate) {
      console.log(`Group ${joinedGroup.n} hasn't started yet.`);
      return;
    }

    if (!joinedGroup.nextDeduction) return;

    const nextDeductionDate = new Date(joinedGroup.nextDeduction);
    if (isNaN(nextDeductionDate)) return;

    if (
      new Date() >= nextDeductionDate &&
      joinedGroup.weeksPaid < joinedGroup.m
    ) {
      const currency = joinedGroup.currency || "NGN";
      const wallets = uD.wallets || { NGN: uD.wb || 0, USD: 0, EUR: 0, GBP: 0 };
      const currentBalance = wallets[currency] || 0;
      const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
      const symbol = symbols[currency];

      if (currentBalance >= joinedGroup.a) {
        // Deduct from correct wallet
        const newWallets = {
          ...wallets,
          [currency]: currentBalance - joinedGroup.a,
        };

        await svD({
          wallets: newWallets,
          wb: newWallets.NGN,
          jG: uD.jG.map((jg) =>
            jg.id === joinedGroup.id
              ? {
                  ...jg,
                  weeksPaid: jg.weeksPaid + 1,
                  nextDeduction: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : jg
          ),
        });

        await trackRoscaPayment(
          uD.id,
          uD.name || "Unknown",
          {
            id: joinedGroup.id,
            n: joinedGroup.n,
            a: joinedGroup.a,
            m: joinedGroup.m,
            currency: currency,
          },
          joinedGroup.weeksPaid + 1
        );

        alert(
          `💸 ${symbol}${joinedGroup.a.toLocaleString()} deducted for ${
            joinedGroup.n
          }`
        );
      } else {
        await trackLoanPrompt(
          uD.id,
          uD.name || "Unknown",
          "rosca_payment",
          joinedGroup.id
        );
        setPromptedGroup(joinedGroup);
        setShowLoanPrompt(true);
      }
    }

    // Process payout in correct currency
    if (joinedGroup.weeksPaid === joinedGroup.payoutWeek && !joinedGroup.paid) {
      let payoutAmount = joinedGroup.totalPayout;
      const currency = joinedGroup.currency || "NGN";
      const wallets = uD.wallets || { NGN: uD.wb || 0, USD: 0, EUR: 0, GBP: 0 };

      // Deduct loan if exists
      const loan = uD.ln.find((l) => l.groupId === joinedGroup.id);
      if (loan) {
        payoutAmount -= loan.tot;
        await svD({
          ln: uD.ln.filter((l) => l.id !== loan.id),
        });
      }

      // Add payout to correct wallet
      const newWallets = {
        ...wallets,
        [currency]: (wallets[currency] || 0) + payoutAmount,
      };

      await svD({
        wallets: newWallets,
        wb: newWallets.NGN,
        jG: uD.jG.map((jg) =>
          jg.id === joinedGroup.id ? { ...jg, paid: true } : jg
        ),
      });

      await trackRoscaPayout(
        uD.id,
        uD.name || "Unknown",
        {
          id: joinedGroup.id,
          n: joinedGroup.n,
          totalPayout: joinedGroup.totalPayout,
          pos: joinedGroup.pos,
          currency: currency,
        },
        payoutAmount
      );
    }
  };

  // ===== LOANS =====
  const tL = async (amt, pur, groupId = null) => {
    const ir = 0.05; // 5% interest
    const tot = amt + amt * ir;
    const ln = {
      id: Math.random().toString(36).substr(2, 9),
      amt,
      ir,
      tot,
      pur,
      groupId,
      tAt: new Date().toISOString(),
      st: "Active",
      repayBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await svD({ wb: uD.wb + amt, ln: [...uD.ln, ln] });

    // ✅ TRACK LOAN TAKEN
    await trackLoanTaken(uD.id, uD.name || "Unknown", {
      amt,
      pur,
      ir,
      tot,
      groupId,
    });

    console.log("✅ Loan taken tracked");

    alert(
      `✅ Loan Approved!\n💰 Amount: ₦${amt.toLocaleString()}\n📈 Interest: 5%\n💳 Repay: ₦${tot.toLocaleString()}`
    );
    sSL(false);
    setShowLoanPrompt(false);
  };

  // ===== LOAN AGAINST FUTURE ROSCA PAYOUT =====
  const loanAgainstRosca = async (group) => {
    const joinedGroup = uD.jG.find((jg) => jg.id === group.id);
    if (!joinedGroup) {
      alert("❌ You're not in this group yet");
      return;
    }

    // Can loan up to 80% of expected payout
    const maxLoan = Math.floor(joinedGroup.totalPayout * 0.8);
    const weeksUntilPayout = joinedGroup.pos - joinedGroup.weeksPaid;

    if (weeksUntilPayout <= 0) {
      alert("❌ You've already received your payout!");
      return;
    }

    // ✅ TRACK LOAN PROMPT
    await trackLoanPrompt(
      uD.id,
      uD.name || "Unknown",
      "rosca_advance",
      group.id
    );

    const confirmed = confirm(
      `💰 Loan Against ROSCA Payout\n\n` +
        `Group: ${group.n}\n` +
        `Your Payout: ₦${joinedGroup.totalPayout.toLocaleString()} in ${weeksUntilPayout} weeks\n\n` +
        `Max Loan: ₦${maxLoan.toLocaleString()} (80% of payout)\n` +
        `Interest: 5%\n\n` +
        `Loan will be deducted from your ROSCA payout.\n\n` +
        `Get loan now?`
    );

    if (confirmed) {
      // ✅ TRACK LOAN DECISION
      await trackLoanDecision(uD.id, uD.name || "Unknown", "accepted", {
        purpose: `ROSCA Advance - ${group.n}`,
        amount: maxLoan,
        groupId: group.id,
        promptNumber: 1,
      });
      await tL(maxLoan, `ROSCA Advance - ${group.n}`, group.id);
    } else {
      // ✅ TRACK LOAN DECLINED
      await trackLoanDecision(uD.id, uD.name || "Unknown", "declined", {
        purpose: `ROSCA Advance - ${group.n}`,
        amount: maxLoan,
        groupId: group.id,
        promptNumber: 1,
      });
    }
  };

  // ===== FILTER GROUPS =====
  const fG = () => {
    switch (rT) {
      case "All":
        return aG;
      case "Open":
        return aG.filter((g) => g.c < g.m);
      case "Joined":
        return aG.filter((g) => uD.jG.some((j) => j.id === g.id));
      case "Request":
        return aG.filter((g) => uD.gR.some((r) => r.id === g.id));
      default:
        return aG;
    }
  };

  // ===== SCREENS =====
  const Splash = () => (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(180deg, #4CC79A, #2FAF7C)" }}
    >
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Ajoti</h1>
        <div className="w-16 h-1 bg-white mx-auto mb-6" />
        <p className="text-sm opacity-90">Fintech Research Platform</p>
        <p className="text-xs opacity-75 mt-2">Testing Financial Behaviors</p>
      </div>
    </div>
  );

  // ===== CURRENCY SELECTOR =====
  const CurrencySelector = ({ userData, onCurrencyChange }) => {
    const currencies = [
      { code: "NGN", symbol: "₦", name: "Naira" },
      { code: "USD", symbol: "$", name: "Dollar" },
      { code: "EUR", symbol: "€", name: "Euro" },
      { code: "GBP", symbol: "£", name: "Pound" },
    ];

    const selectedCurrency = userData?.selectedCurrency || "NGN";
    const wallets = userData?.wallets || { NGN: 0, USD: 0, EUR: 0, GBP: 0 };

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">
          Select Currency
        </p>
        <div className="grid grid-cols-4 gap-2">
          {currencies.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            const balance = wallets[curr.code] || 0;

            return (
              <button
                key={curr.code}
                onClick={() => onCurrencyChange(curr.code)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 bg-white hover:border-teal-300"
                }`}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">{curr.symbol}</p>
                  <p className="text-[10px] font-semibold text-gray-600">
                    {curr.code}
                  </p>
                  <p
                    className={`text-xs font-bold mt-1 ${
                      isSelected ? "text-teal-600" : "text-gray-500"
                    }`}
                  >
                    {balance.toLocaleString()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== ROSCA SCREEN - 100% REAL DATA =====
  // ===== ROSCA SCREEN - 100% REAL DATA =====
  const Rosca = () => {
    const [currencyFilter, setCurrencyFilter] = React.useState("ALL");

    if (!uD) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <Activity
              size={48}
              className="text-gray-400 mx-auto mb-4 animate-spin"
            />
            <p className="text-gray-600">Loading your data...</p>
          </div>
        </div>
      );
    }

    // Calculate REAL totals from user's actual joined groups
    const joinedGroups = uD?.jG || [];
    const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };

    // 💱 Calculate total savings by currency
    const savingsByCurrency = joinedGroups.reduce((acc, g) => {
      const currency = g.currency || "NGN";
      const contributed = g.a * (g.weeksPaid || 0);
      acc[currency] = (acc[currency] || 0) + contributed;
      return acc;
    }, {});

    // Get primary currency savings for display
    const selectedCurrency = uD?.selectedCurrency || "NGN";
    const totalSavings = savingsByCurrency[selectedCurrency] || 0;
    const symbol = symbols[selectedCurrency];

    // Get next payment due (earliest nextDeduction date)
    const activeDueGroups = joinedGroups.filter(
      (g) => g.started && g.nextDeduction && g.weeksPaid < g.m
    );
    const nextDue = activeDueGroups.sort(
      (a, b) => new Date(a.nextDeduction) - new Date(b.nextDeduction)
    )[0];

    // 🔧 Better due soon calculation
    const dueSoonGroup = nextDue;
    const dueSoon = dueSoonGroup?.a || 0;
    const dueSoonCurrency = dueSoonGroup?.currency || "NGN";
    const dueSoonSymbol = symbols[dueSoonCurrency];
    const dueSoonDate = dueSoonGroup?.nextDeduction
      ? new Date(dueSoonGroup.nextDeduction).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No active payments";

    // Count unstarted groups
    const unstartedGroups = joinedGroups.filter((g) => !g.started);

    // Get next payout (group where it's user's turn or upcoming)
    const nextPayoutGroup = joinedGroups
      .filter((g) => g.started && !g.paid && g.weeksPaid < g.payoutWeek)
      .sort(
        (a, b) => a.payoutWeek - a.weeksPaid - (b.payoutWeek - b.weeksPaid)
      )[0];

    // 🔧 Better payout calculation
    const nextPayout = nextPayoutGroup?.totalPayout || 0;
    const nextPayoutCurrency = nextPayoutGroup?.currency || "NGN";
    const nextPayoutSymbol = symbols[nextPayoutCurrency];
    const weeksUntilPayout = nextPayoutGroup
      ? nextPayoutGroup.payoutWeek - nextPayoutGroup.weeksPaid
      : 0;
    const nextPayoutDate =
      nextPayoutGroup && weeksUntilPayout > 0
        ? new Date(
            Date.now() + weeksUntilPayout * 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Not yet scheduled";

    // 🆕 CREDIT SCORE & TRUST SCORE CALCULATIONS
    const creditScore = 100; // Fixed perfect credit for research

    // Calculate Trust Score (1.0 - 5.0)
    const calculateTrustScore = () => {
      const totalPaymentsDue = joinedGroups.reduce(
        (sum, g) => sum + (g.weeksPaid || 0),
        0
      );
      const onTimePayments = totalPaymentsDue; // Assuming all payments are on-time for now
      const latePayments = 0;
      const missedPayments = 0;

      let score = 3.0; // Base score

      // +0.5 for every 5 on-time payments
      score += Math.floor(onTimePayments / 5) * 0.5;

      // -1.0 for each missed payment
      score -= missedPayments * 1.0;

      // -0.5 for each late payment
      score -= latePayments * 0.5;

      // Bonus for consistent payment history
      if (onTimePayments >= 20) score += 0.5;
      if (onTimePayments >= 50) score += 0.5;

      // Cap between 1.0 and 5.0
      return Math.max(1.0, Math.min(5.0, score));
    };

    const totalPaymentsDue = joinedGroups.reduce(
      (sum, g) => sum + (g.weeksPaid || 0),
      0
    );
    const onTimePayments = totalPaymentsDue;
    const latePayments = 0;
    const missedPayments = 0;
    const paymentHistoryPercent = totalPaymentsDue > 0 ? 100 : 0;
    const trustScore =
      totalPaymentsDue > 0 ? calculateTrustScore().toFixed(1) : "N/A";

    // Build contribution schedule from REAL data
    const buildContributionSchedule = () => {
      if (joinedGroups.length === 0) return [];

      const schedule = [];

      joinedGroups.forEach((group) => {
        const currency = group.currency || "NGN";
        const symbol = symbols[currency];

        // Past payments
        for (let i = 1; i < group.weeksPaid; i++) {
          const paymentDate = new Date(group.jAt);
          paymentDate.setDate(paymentDate.getDate() + (i - 1) * 7);
          schedule.push({
            month: paymentDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            status: "Paid",
            amount: group.a,
            currency: currency,
            symbol: symbol,
            date: paymentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            type: "paid",
            groupName: group.n,
          });
        }
        // Current payment due
        if (group.nextDeduction && group.weeksPaid < group.m) {
          const dueDate = new Date(group.nextDeduction);
          schedule.push({
            month: dueDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            status: "Due",
            amount: group.a,
            currency: currency,
            symbol: symbol,
            date: dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            type: "due",
            groupName: group.n,
          });
        }

        // Next upcoming payment
        if (group.weeksPaid + 1 < group.m && group.nextDeduction) {
          const upcomingDate = new Date(group.nextDeduction);
          upcomingDate.setDate(upcomingDate.getDate() + 7);
          schedule.push({
            month: upcomingDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            status: "Upcoming",
            amount: group.a,
            currency: currency,
            symbol: symbol,
            date: upcomingDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            type: "upcoming",
            groupName: group.n,
          });
        }
      });

      return schedule
        .sort((a, b) => {
          const dateA = new Date(a.month + " " + a.date);
          const dateB = new Date(b.month + " " + b.date);
          return dateA - dateB;
        })
        .slice(0, 3);
    };

    const contributionSchedule = buildContributionSchedule();

    // Build payout rotation from REAL data
    const buildPayoutRotation = () => {
      if (joinedGroups.length === 0) return [];

      // Get the first active group for rotation display
      const activeGroup = joinedGroups[0];
      if (!activeGroup) return [];

      const rotation = [];
      const userPosition = activeGroup.pos;
      const currentWeek = activeGroup.weeksPaid;

      // Show user's position
      rotation.push({
        position: userPosition,
        name: `You (${uD.name || "User"})`,
        date: new Date(
          Date.now() + (userPosition - currentWeek) * 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isNext: userPosition === currentWeek + 1,
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      });

      // Show next 2 positions (simulated members)
      for (let i = 1; i <= 2; i++) {
        const pos = ((userPosition + i - 1) % activeGroup.m) + 1;
        rotation.push({
          position: pos,
          name: `Member ${pos}`,
          date: new Date(
            Date.now() + (pos - currentWeek) * 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          isNext: false,
          avatar: `https://randomuser.me/api/portraits/men/${30 + i}.jpg`,
        });
      }

      return rotation.sort((a, b) => a.position - b.position);
    };

    const payoutRotation = buildPayoutRotation();

    // Build payment history from REAL data
    // Build payment history from REAL data
    const buildPaymentHistory = () => {
      const history = [];

      joinedGroups.forEach((group) => {
        const currency = group.currency || "NGN";
        const symbol = symbols[currency];

        // Add contribution payments
        for (let i = 0; i < group.weeksPaid; i++) {
          const paymentDate = new Date(group.jAt);
          paymentDate.setDate(paymentDate.getDate() + i * 7);
          history.push({
            type: "Contribution Paid",
            date: paymentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: "2:34 PM",
            amount: -group.a,
            currency: currency,
            symbol: symbol,
            icon: ArrowDown,
            color: "emerald",
            groupName: group.n,
          });
        }

        // Add payout if received
        if (group.paid) {
          const payoutDate = new Date(group.jAt);
          payoutDate.setDate(payoutDate.getDate() + group.payoutWeek * 7);
          history.push({
            type: "Payout Received",
            date: payoutDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: "9:12 AM",
            amount: group.totalPayout,
            currency: currency,
            symbol: symbol,
            icon: ArrowUp,
            color: "green",
            groupName: group.n,
          });
        }
      });

      // Sort by date descending and return top 3
      return history
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    };
    const paymentHistory = buildPaymentHistory();

    // Verification status - based on user data
    const verificationItems = [
      {
        title: "Identity Verified",
        subtitle: uD?.kycComplete
          ? "Government ID confirmed"
          : "Pending verification",
        icon: Shield,
        verified: uD?.kycComplete || false,
      },
      {
        title: "Payment Method",
        subtitle: uD?.wb >= 0 ? "Wallet active" : "Setup required",
        icon: CreditCard,
        verified: uD?.wb >= 0,
      },
      {
        title: "Phone Verified",
        subtitle: uD?.phone ? "Phone linked" : "Setup required",
        icon: Phone,
        verified: !!uD?.phone,
      },
    ];

    // Get available groups to join
    const availableGroups = aG.filter(
      (g) => {
        const notJoined = g.c < g.m && !joinedGroups.some((jg) => jg.id === g.id);
        if (currencyFilter === "ALL") return notJoined;
        return notJoined && (g.currency || "NGN") === currencyFilter;
      }
    );
    // .slice(0, 5);

    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-12 pb-6 bg-white sticky top-0 z-10 border-b border-gray-200 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            {/* <div className="relative">
            <img
              alt="User Profile"
              src="https://randomuser.me/api/portraits/women/44.jpg"
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-600"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div> */}
            <div className="relative">
              <InitialsAvatar name={uD?.name || "User"} size={40} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Hey there,</p>
              <h1 className="text-lg font-bold">{uD?.name || "User"}</h1>
            </div>
          </div>
          <button className="relative p-2 rounded-full bg-teal-50 hover:bg-teal-100 transition-colors">
            {(uD?.ln?.length > 0 || nextDue) && (
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
            <Bell size={24} className="text-teal-600" />
          </button>
        </header>

        <main className="flex-1 px-6 space-y-8 overflow-y-auto">
          {/* Total Savings Section */}
          {/* Total Savings Section */}
          <section className="space-y-4 mt-4">
            <div className="relative overflow-hidden rounded-3xl bg-teal-600 p-6 text-white shadow-lg shadow-teal-600/20">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 rounded-full bg-black/10 blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white/80">
                    Total Savings ({selectedCurrency})
                  </p>
                  <Activity size={20} className="text-white/70" />
                </div>
                {/* 💱 FIX: Show correct currency */}
                <h2 className="text-3xl font-bold mb-2">
                  {symbol}
                  {totalSavings.toLocaleString()}
                </h2>

                {/* Show other currency balances if they exist */}
                {Object.keys(savingsByCurrency).length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(savingsByCurrency).map(([curr, amount]) => {
                      if (curr === selectedCurrency || amount === 0)
                        return null;
                      return (
                        <span
                          key={curr}
                          className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded"
                        >
                          {symbols[curr]}
                          {amount.toLocaleString()} {curr}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <TrendingUp size={16} className="text-white" />
                    <span className="text-xs font-bold">
                      {joinedGroups.filter((g) => g.started).length} Active
                    </span>
                  </div>
                  {unstartedGroups.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Clock size={16} className="text-white/70" />
                      <span className="text-xs font-bold">
                        {unstartedGroups.length} Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                    <Clock size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    Due Soon
                  </span>
                </div>
                {/* 💱 FIX: Show correct currency for due payment */}
                <p className="text-lg font-bold">
                  {dueSoon > 0
                    ? `${dueSoonSymbol}${dueSoon.toLocaleString()}`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{dueSoonDate}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    Next Payout
                  </span>
                </div>
                {/* 💱 FIX: Show correct currency for payout */}
                <p className="text-lg font-bold">
                  {nextPayout > 0
                    ? `${nextPayoutSymbol}${nextPayout.toLocaleString()}`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">{nextPayoutDate}</p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="flex justify-between gap-2">
              <button
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  })
                }
                className="flex flex-col items-center gap-2 w-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-600 hover:text-white transition-all active:scale-95">
                  <Plus size={28} />
                </div>
                <span className="text-xs font-medium">New Group</span>
              </button>
              <button
                onClick={() => sS("loans")}
                className="flex flex-col items-center gap-2 w-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-600 hover:text-white transition-all active:scale-95">
                  <Wallet size={28} />
                </div>
                <span className="text-xs font-medium">Get Loan</span>
              </button>
              <button className="flex flex-col items-center gap-2 w-full">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-600 hover:text-white transition-all active:scale-95">
                  <Activity size={28} />
                </div>
                <span className="text-xs font-medium">History</span>
              </button>
              <button className="flex flex-col items-center gap-2 w-full">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-sm hover:bg-teal-600 hover:text-white transition-all active:scale-95">
                  <Users size={28} />
                </div>
                <span className="text-xs font-medium">Invite</span>
              </button>
            </div>
          </section>

          {/* Your Groups */}
          {/* Your Groups */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Your Groups</h3>
              <button className="text-sm font-semibold text-teal-600">
                See All
              </button>
            </div>

            {joinedGroups.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-200">
                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold mb-1">No Groups Yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Join your first ROSCA group below
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinedGroups.map((group) => {
                  const isYourPayoutNext =
                    group.weeksPaid === group.payoutWeek && !group.paid;
                  const progress = (group.weeksPaid / group.m) * 100;

                  // 💱 GET GROUP CURRENCY
                  const groupCurrency = group.currency || "NGN";
                  const groupSymbol = symbols[groupCurrency];

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{group.n}</h4>
                            {/* 💱 SHOW CURRENCY BADGE FOR NON-NGN */}
                            {groupCurrency !== "NGN" && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                {groupCurrency}
                              </span>
                            )}
                            {group.started ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {group.f} • Week {group.weeksPaid} of {group.m}
                          </p>
                        </div>
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(3, group.m) }).map(
                            (_, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                              >
                                <InitialsAvatar
                                  name={`Member ${idx + 1}`}
                                  size={32}
                                />
                              </div>
                            )
                          )}
                          {group.m > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                              +{group.m - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 💱 FIX: SHOW CORRECT CURRENCY */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-2xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Contribution
                          </p>
                          <p className="font-bold">
                            {groupSymbol}
                            {group.a.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Total Pool
                          </p>
                          <p className="font-bold text-teal-600">
                            {groupSymbol}
                            {group.totalPayout.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
                            <Calendar size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">
                              Position #{group.pos}
                            </span>
                            <span className="text-xs font-bold">
                              {!group.started
                                ? `Waiting for ${group.m - group.c} more`
                                : isYourPayoutNext
                                ? "Your turn next!"
                                : `Payout week ${group.payoutWeek}`}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sSG(group);
                            sS("rosca-detail");
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            isYourPayoutNext
                              ? "bg-teal-600 text-white hover:bg-teal-700"
                              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ROSCA Management - Only show if user has groups */}
          {joinedGroups.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">ROSCA Management</h3>
                <button className="text-sm font-semibold text-teal-600">
                  Settings
                </button>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-6">
                {/* Trust Score */}
                {/* Trust Score & Credit Score */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  {/* Trust Score */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-teal-50">
                        <Shield size={20} className="text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Trust Score</h4>
                        <p className="text-xs text-gray-500">
                          Payment reliability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={18} className="text-amber-500" />
                      <span className="text-2xl font-bold">{trustScore}</span>
                      <span className="text-sm text-gray-500">/5.0</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {trustScore >= 4.5
                        ? "Excellent"
                        : trustScore >= 3.5
                        ? "Good"
                        : trustScore >= 2.5
                        ? "Fair"
                        : "Building"}
                    </p>
                  </div>

                  {/* Credit Score */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-emerald-50">
                        <TrendingUp size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Credit Score</h4>
                        <p className="text-xs text-gray-500">
                          Creditworthiness
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-emerald-600">
                        {creditScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                      Excellent
                    </p>
                  </div>
                </div>

                {/* Payment History Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Payment History
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {paymentHistoryPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${paymentHistoryPercent}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">On-Time</p>
                      <p className="text-lg font-bold">{onTimePayments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Late</p>
                      <p className="text-lg font-bold text-amber-600">
                        {latePayments}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Missed</p>
                      <p className="text-lg font-bold text-red-500">
                        {missedPayments}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contribution Schedule */}
                {/* Contribution Schedule */}
                {contributionSchedule.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold">Contribution Schedule</h5>
                      <button className="text-xs font-semibold text-teal-600">
                        View Calendar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {contributionSchedule.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            item.type === "paid"
                              ? "bg-gray-50"
                              : item.type === "due"
                              ? "bg-teal-50 border-2 border-teal-600"
                              : "bg-gray-100"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              item.type === "paid"
                                ? "bg-emerald-100 text-emerald-600"
                                : item.type === "due"
                                ? "bg-teal-100 text-teal-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {item.type === "paid" ? (
                              <CheckCircle size={20} />
                            ) : item.type === "due" ? (
                              <Calendar size={20} />
                            ) : (
                              <Clock size={20} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-bold ${
                                item.type === "upcoming" ? "text-gray-600" : ""
                              }`}
                            >
                              {item.month} - {item.status}
                            </p>
                            {/* 💱 FIXED: Show correct currency */}
                            <p className="text-xs text-gray-500">
                              {item.symbol}
                              {item.amount.toLocaleString()}{" "}
                              {item.currency !== "NGN" ? item.currency : ""} •{" "}
                              {item.groupName}
                            </p>
                          </div>
                          {item.type === "paid" ? (
                            <CheckCircle
                              size={20}
                              className="text-emerald-600"
                            />
                          ) : item.type === "due" ? (
                            <button
                              onClick={() => {
                                alert(
                                  `Payment of ${
                                    item.symbol
                                  }${item.amount.toLocaleString()} for ${
                                    item.groupName
                                  } will be processed`
                                );
                              }}
                              className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold"
                            >
                              Pay Now
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payout Rotation Order */}
                {payoutRotation.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold">Payout Rotation Order</h5>
                      <button className="text-xs font-semibold text-teal-600">
                        Full Schedule
                      </button>
                    </div>
                    <div className="space-y-2">
                      {payoutRotation.map((member) => (
                        <div
                          key={member.position}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            member.isNext
                              ? "bg-emerald-50 border border-emerald-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              member.isNext
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {member.position}
                          </div>
                          <img
                            alt="Member"
                            src={member.avatar}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold">{member.name}</p>
                            <p
                              className={`text-xs font-semibold ${
                                member.isNext
                                  ? "text-emerald-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {member.isNext
                                ? `Next - ${member.date}`
                                : member.date}
                            </p>
                          </div>
                          {member.isNext && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                              NEXT
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {paymentHistory.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold">Payment History</h5>
                      <button className="text-xs font-semibold text-teal-600">
                        View All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {paymentHistory.map((payment, idx) => {
                        const IconComponent = payment.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  payment.color === "emerald"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-teal-50 text-teal-600"
                                }`}
                              >
                                <IconComponent size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">
                                  {payment.type}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payment.groupName} • {payment.date}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-bold ${
                                payment.amount > 0 ? "text-teal-600" : ""
                              }`}
                            >
                              {payment.amount > 0 ? "+" : ""}
                              {payment.symbol}
                              {Math.abs(payment.amount).toLocaleString()}
                              {payment.currency !== "NGN" && (
                                <span className="text-xs text-gray-500 ml-1">
                                  {payment.currency}
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Member Verification */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold">Member Verification</h5>
                  </div>
                  <div className="space-y-2">
                    {verificationItems.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            item.verified
                              ? "bg-emerald-50 border border-emerald-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent
                              size={20}
                              className={
                                item.verified
                                  ? "text-emerald-600"
                                  : "text-gray-400"
                              }
                            />
                            <div>
                              <p className="text-sm font-bold">{item.title}</p>
                              <p className="text-xs text-gray-600">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          {item.verified ? (
                            <CheckCircle
                              size={20}
                              className="text-emerald-600"
                            />
                          ) : (
                            <AlertCircle size={20} className="text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Default Tracking */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold">Default Tracking</h5>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        missedPayments === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {missedPayments === 0
                        ? "No Issues"
                        : `${missedPayments} Issues`}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-xl border text-center ${
                      missedPayments === 0
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {missedPayments === 0 ? (
                      <>
                        <CheckCircle
                          size={48}
                          className="text-emerald-600 mx-auto mb-2"
                        />
                        <p className="text-sm font-bold mb-1">Perfect Record</p>
                        <p className="text-xs text-gray-600">
                          No missed payments or defaults
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle
                          size={48}
                          className="text-red-600 mx-auto mb-2"
                        />
                        <p className="text-sm font-bold mb-1">Payment Issues</p>
                        <p className="text-xs text-gray-600">
                          {missedPayments} missed payment(s)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Available Groups to Join */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Available Groups
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrencyFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    currencyFilter === "ALL"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCurrencyFilter("NGN")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    currencyFilter === "NGN"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  ₦ Naira
                </button>
                <button
                  onClick={() => setCurrencyFilter("USD")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    currencyFilter === "USD"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  $ Dollar
                </button>
                <button
                  onClick={() => setCurrencyFilter("GBP")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    currencyFilter === "GBP"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  £ Pound
                </button>
              </div>
            </div>

          {availableGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <h4 className="font-bold text-gray-900 mb-2">No Groups Available</h4>
              <p className="text-sm text-gray-600">
                {currencyFilter !== "ALL"
                  ? `No ${currencyFilter} groups available at the moment. Try a different currency filter.`
                  : "All available groups are full or you've already joined them."}
              </p>
            </div>
          ) : (
            availableGroups.map((g) => {
            const currency = g.currency || "NGN";
            const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
            const symbol = symbols[currency];

            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{g.n}</h4>
                      {/* 💱 SHOW CURRENCY BADGE */}
                      {currency !== "NGN" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {currency}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {g.f} • {g.d} • {g.m} members
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {g.m - g.c} spots left
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl mb-3">
                  <p className="text-xs text-gray-500 mb-1">Contribution</p>
                  {/* 💱 SHOW CORRECT CURRENCY SYMBOL */}
                  <p className="text-2xl font-bold">
                    {symbol}
                    {g.a.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total Pool: {symbol}
                    {(g.a * g.m).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sSG(g);
                      sS("rosca-detail");
                    }}
                    className="py-2 rounded-lg text-sm font-semibold border-2 border-teal-600 text-teal-700"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => jRG(g)}
                    className="py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  >
                    Join Now
                  </button>
                </div>
              </div>
            );
          })
          )}
          </section>
        </main>

        <BN active="groups" setScreen={sS} />
      </div>
    );
  };

  const RoscaDet = () => {
    if (!sG) return null;
    const isJoined = uD.jG.some((jg) => jg.id === sG.id);
    const joinedData = uD.jG.find((jg) => jg.id === sG.id);

    // 💱 FIX: Get correct currency
    const currency = sG.currency || "NGN";
    const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-6 bg-white border-b">
          <button onClick={() => sS("rosca")} className="mb-4">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold">{sG.n}</h2>
            {currency !== "NGN" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {currency}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {sG.f} • {sG.d}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Group Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Contribution</p>
                {/* 💱 FIX: Show correct currency */}
                <p className="text-xl font-bold">
                  {symbol}
                  {sG.a.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Payout</p>
                {/* 💱 FIX: Show correct currency */}
                <p className="text-xl font-bold">
                  {symbol}
                  {(sG.a * sG.m).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Members</p>
                <p className="text-lg font-bold">
                  {sG.c}/{sG.m}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
                <p className="text-lg font-bold">{sG.r}%</p>
              </div>
            </div>
          </div>

          {isJoined && joinedData && (
            <div className="bg-green-50 border-2 border-green-200 p-5 rounded-xl">
              <h3 className="font-bold mb-3">Your Position</h3>
              <p className="text-sm mb-2">Position: #{joinedData.pos}</p>
              <p className="text-sm mb-2">
                Payout Week: Week {joinedData.payoutWeek}
              </p>
              {/* 💱 FIX: Show correct currency */}
              <p className="text-sm mb-2">
                Expected Payout: {symbol}
                {joinedData.totalPayout.toLocaleString()}
              </p>
              <p className="text-sm">
                Weeks Paid: {joinedData.weeksPaid}/{sG.m}
              </p>
              {!joinedData.started && (
                <p className="text-sm text-amber-600 mt-2 font-semibold">
                  ⏳ Group hasn't started yet ({sG.m - sG.c} spots remaining)
                </p>
              )}
            </div>
          )}

          {!isJoined && (
            <button
              onClick={() => jRG(sG)}
              disabled={sG.c >= sG.m}
              className="w-full py-4 rounded-full font-semibold text-white disabled:bg-gray-400"
              style={{ backgroundColor: sG.c >= sG.m ? "#CBD5E0" : C.p }}
            >
              {sG.c >= sG.m
                ? "Group Full"
                : `Join for ${symbol}${sG.a.toLocaleString()}`}
            </button>
          )}

          {isJoined && joinedData && joinedData.started && (
            <button
              onClick={() => loanAgainstRosca(sG)}
              className="w-full py-4 rounded-full font-semibold bg-yellow-500 text-white"
            >
              Get Loan Against Payout
            </button>
          )}
        </div>
      </div>
    );
  };
  const Fixed = () => (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <button onClick={() => sS("dashboard")} className="mb-4">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-2">Fixed Savings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Lock your money and earn guaranteed returns
      </p>

      <div className="space-y-4">
        {FS.map((p, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-sm border-2 border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg">{p.d.toUpperCase()}</h4>
                <p className="text-xs text-gray-600">
                  Min: ₦{p.mi.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <p className="text-2xl font-bold">{p.r}%</p>
                <p className="text-xs">Returns</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-600">Example:</p>
              <p className="text-sm font-semibold">
                Save ₦{p.mi.toLocaleString()} → Get ₦
                {(p.mi + (p.mi * p.r) / 100).toLocaleString()}
              </p>
            </div>

            <button
              onClick={async () => {
                const amt = prompt(
                  `Enter amount (min ₦${p.mi.toLocaleString()}):`
                );
                const amount = parseInt(amt);

                if (!amount || amount < p.mi) {
                  alert(`❌ Minimum amount is ₦${p.mi.toLocaleString()}`);
                  return;
                }

                if (uD.wb < amount) {
                  alert("❌ Insufficient balance!");
                  return;
                }

                const ret = amount * (p.r / 100);
                const maturityDate = new Date();
                maturityDate.setMonth(maturityDate.getMonth() + parseInt(p.d));

                await svD({
                  wb: uD.wb - amount,
                  fS: [
                    ...uD.fS,
                    {
                      id: Math.random().toString(36).substr(2, 9),
                      amt: amount,
                      rt: p.r,
                      dur: p.d,
                      ret,
                      tot: amount + ret,
                      st: new Date().toISOString(),
                      maturity: maturityDate.toISOString(),
                      status: "Active",
                    },
                  ],
                });

                // ✅ TRACK FIXED SAVINGS
                await trackFixedSavings(uD.id, uD.name || "Unknown", {
                  amt: amount,
                  dur: p.d,
                  rt: p.r,
                  ret,
                });

                console.log("✅ Fixed savings tracked");

                alert(
                  `✅ Fixed Savings Locked!\n\n` +
                    `Amount: ₦${amount.toLocaleString()}\n` +
                    `Duration: ${p.d}\n` +
                    `Returns: ₦${ret.toLocaleString()} (${p.r}%)\n` +
                    `Total at maturity: ₦${(amount + ret).toLocaleString()}\n` +
                    `Maturity: ${maturityDate.toLocaleDateString()}`
                );
              }}
              className="w-full py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: C.p }}
            >
              Lock Funds
            </button>
          </div>
        ))}
      </div>

      {uD.fS.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-3">Your Fixed Savings</h3>
          <div className="space-y-3">
            {uD.fS.map((fs) => (
              <div key={fs.id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    ₦{fs.amt.toLocaleString()}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {fs.rt}% • {fs.dur}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Maturity: {new Date(fs.maturity).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-green-700 mt-1">
                  +₦{fs.ret.toLocaleString()} returns
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Target = () => (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <button onClick={() => sS("dashboard")} className="mb-4">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-2">Target Savings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Save weekly towards your goals (6 weeks)
      </p>

      <button
        className="w-full p-6 border-2 border-dashed border-green-300 rounded-xl text-center mb-6 hover:bg-green-50"
        onClick={async () => {
          const n = prompt("Goal name (e.g., 'New Phone'):");
          if (!n) return;

          const tg = parseInt(prompt("Target amount (₦):"));
          if (!tg) return;

          const wk = parseInt(prompt("How much can you save weekly? (₦):"));
          if (!wk) return;

          const weeks = Math.min(Math.ceil(tg / wk), 6); // Max 6 weeks

          await svD({
            tS: [
              ...uD.tS,
              {
                id: Math.random().toString(36).substr(2, 9),
                n,
                tg,
                cur: 0,
                wk,
                wks: weeks,
                wkD: 0,
                st: "Active",
                created: new Date().toISOString(),
              },
            ],
          });

          // ✅ TRACK TARGET CREATION
          await trackTargetSavings(
            uD.id,
            uD.name || "Unknown",
            {
              n,
              tg,
              wk,
              wks: weeks,
            },
            false
          );

          console.log("✅ Target savings created and tracked");

          alert(
            `✅ Goal "${n}" created!\nSave ₦${wk.toLocaleString()}/week for ${weeks} weeks`
          );
        }}
      >
        <Plus size={32} className="mx-auto mb-2" style={{ color: C.p }} />
        <p className="font-semibold" style={{ color: C.p }}>
          Create New Goal
        </p>
      </button>

      <div className="space-y-4">
        {uD.tS.map((ts) => {
          const progress = (ts.cur / ts.tg) * 100;
          const remaining = ts.tg - ts.cur;

          return (
            <div
              key={ts.id}
              className="bg-white p-5 rounded-xl shadow-sm border"
            >
              <div className="flex justify-between mb-3">
                <h4 className="font-bold">{ts.n}</h4>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    ts.st === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ts.st}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>₦{ts.cur.toLocaleString()}</span>
                  <span>₦{ts.tg.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: C.p,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {progress.toFixed(1)}% complete • {ts.wkD}/{ts.wks} weeks
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-gray-600">
                  Remaining: ₦{remaining.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  Weekly: ₦{ts.wk.toLocaleString()}
                </p>
              </div>

              {ts.st === "Active" && (
                <button
                  onClick={async () => {
                    if (uD.wb < ts.wk) {
                      const needLoan = confirm(
                        `❌ Insufficient balance!\n\n` +
                          `You need ₦${ts.wk.toLocaleString()} but have ₦${uD.wb.toLocaleString()}\n\n` +
                          `Get a quick loan?`
                      );
                      if (needLoan) {
                        await tL(ts.wk, `Target Savings - ${ts.n}`);
                      }
                      return;
                    }

                    const newCurrent = ts.cur + ts.wk;
                    const isComplete = newCurrent >= ts.tg;

                    await svD({
                      wb: uD.wb - ts.wk,
                      tS: uD.tS.map((t) =>
                        t.id === ts.id
                          ? {
                              ...t,
                              cur: newCurrent,
                              wkD: t.wkD + 1,
                              st: isComplete ? "Completed" : "Active",
                            }
                          : t
                      ),
                    });

                    // ✅ TRACK TARGET CONTRIBUTION
                    await trackTargetSavings(
                      uD.id,
                      uD.name || "Unknown",
                      {
                        id: ts.id,
                        n: ts.n,
                        wk: ts.wk,
                        cur: newCurrent,
                        tg: ts.tg,
                        wkD: ts.wkD + 1,
                      },
                      true
                    );

                    console.log("✅ Target contribution tracked");

                    if (isComplete) {
                      alert(
                        `🎉 Goal Completed!\n\n"${
                          ts.n
                        }"\nTotal saved: ₦${newCurrent.toLocaleString()}`
                      );
                    } else {
                      alert(
                        `✅ Saved ₦${ts.wk.toLocaleString()}!\nWeek ${
                          ts.wkD + 1
                        }/${ts.wks} complete`
                      );
                    }
                  }}
                  className="w-full py-3 rounded-full font-semibold text-white"
                  style={{ backgroundColor: C.p }}
                >
                  Save ₦{ts.wk.toLocaleString()} This Week
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const Invest = () => (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <button onClick={() => sS("dashboard")} className="mb-4">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-2">Investments</h2>
      <p className="text-sm text-gray-600 mb-6">
        Grow your money through smart investments
      </p>

      <div className="space-y-4">
        {IV.map((inv) => {
          const riskColors = {
            "Very Low": "bg-blue-100 text-blue-700",
            Low: "bg-green-100 text-green-700",
            Medium: "bg-yellow-100 text-yellow-700",
            High: "bg-red-100 text-red-700",
          };

          return (
            <div
              key={inv.id}
              className="bg-white p-5 rounded-xl shadow-sm border"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-bold">{inv.n}</h4>
                  <p className="text-xs text-gray-600">
                    {inv.t} • {inv.d}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full mb-1">
                    <p className="text-lg font-bold">{inv.r}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      riskColors[inv.ri]
                    }`}
                  >
                    {inv.ri} Risk
                  </span>
                </div>
              </div>

              <p className="text-sm mb-4 text-gray-700">{inv.ds}</p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-1">Minimum Investment</p>
                <p className="text-xl font-bold">₦{inv.mi.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Expected: ₦
                  {(
                    inv.mi +
                    (inv.mi * parseFloat(inv.r)) / 100
                  ).toLocaleString()}
                </p>
              </div>

              <button
                onClick={async () => {
                  const amt = prompt(
                    `Enter amount (min ₦${inv.mi.toLocaleString()}):`
                  );
                  const amount = parseInt(amt);

                  if (!amount || amount < inv.mi) {
                    alert(
                      `❌ Minimum investment is ₦${inv.mi.toLocaleString()}`
                    );
                    return;
                  }

                  if (uD.wb < amount) {
                    const needLoan = confirm(
                      `❌ Insufficient balance!\n\n` +
                        `Investment: ₦${amount.toLocaleString()}\n` +
                        `Your balance: ₦${uD.wb.toLocaleString()}\n\n` +
                        `Get a loan to invest?`
                    );
                    if (needLoan) {
                      await tL(amount, `Investment - ${inv.n}`);
                      // Continue with investment after loan
                    } else {
                      return;
                    }
                  }

                  const rt = parseFloat(inv.r) / 100;
                  const ret = amount * rt;
                  const maturityDate = new Date();
                  maturityDate.setMonth(
                    maturityDate.getMonth() + parseInt(inv.d)
                  );

                  await svD({
                    wb: uD.wb - amount,
                    inv: [
                      ...uD.inv,
                      {
                        ...inv,
                        amt: amount,
                        ret,
                        tot: amount + ret,
                        st: new Date().toISOString(),
                        maturity: maturityDate.toISOString(),
                        status: "Active",
                      },
                    ],
                  });

                  // ✅ TRACK INVESTMENT
                  await trackInvestment(uD.id, uD.name || "Unknown", {
                    id: inv.id,
                    n: inv.n,
                    t: inv.t,
                    amt: amount,
                    r: inv.r,
                    d: inv.d,
                    ri: inv.ri,
                  });

                  console.log("✅ Investment tracked");

                  alert(
                    `✅ Investment Successful!\n\n` +
                      `${inv.n}\n` +
                      `Amount: ₦${amount.toLocaleString()}\n` +
                      `Returns: ${inv.r}\n` +
                      `Expected profit: ₦${ret.toLocaleString()}\n` +
                      `Total at maturity: ₦${(
                        amount + ret
                      ).toLocaleString()}\n` +
                      `Duration: ${inv.d}`
                  );
                }}
                className="w-full py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: C.p }}
              >
                Invest Now
              </button>
            </div>
          );
        })}
      </div>

      {uD.inv.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-3">Your Investments</h3>
          <div className="space-y-3">
            {uD.inv.map((investment) => (
              <div
                key={investment.st}
                className="bg-white p-4 rounded-xl shadow-sm border"
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">{investment.n}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Invested: ₦{investment.amt.toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-green-700">
                  Expected: ₦{investment.tot.toLocaleString()} ({investment.r}{" "}
                  return)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Matures: {new Date(investment.maturity).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Loans = () => (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <button onClick={() => sS("dashboard")} className="mb-4">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-2">Loans</h2>
      <p className="text-sm text-gray-600 mb-6">
        Get instant cash when you need it
      </p>

      {sL ? (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold mb-4">Quick Loan Application</h3>
          <input
            type="number"
            placeholder="Enter amount (₦5,000 - ₦500,000)"
            id="loanAmt"
            className="w-full p-4 border-2 rounded-xl mb-4"
          />
          <select
            id="loanPurpose"
            className="w-full p-4 border-2 rounded-xl mb-4"
          >
            <option value="">Select purpose</option>
            <option value="ROSCA">ROSCA Contribution</option>
            <option value="Emergency">Emergency</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
          </select>

          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold mb-2">Loan Terms:</p>
            <ul className="text-xs space-y-1">
              <li>• Interest Rate: 5%</li>
              <li>• Repayment: 30 days</li>
              <li>• Instant approval</li>
              <li>• No collateral required</li>
            </ul>
          </div>

          <button
            onClick={async () => {
              const amt = parseInt(document.getElementById("loanAmt").value);
              const purpose = document.getElementById("loanPurpose").value;

              if (!amt || amt < 5000) {
                alert("❌ Minimum loan amount is ₦5,000");
                return;
              }
              if (amt > 500000) {
                alert("❌ Maximum loan amount is ₦500,000");
                return;
              }
              if (!purpose) {
                alert("❌ Please select loan purpose");
                return;
              }

              await tL(amt, purpose);
            }}
            className="w-full py-4 rounded-full font-semibold text-white"
            style={{ backgroundColor: C.p }}
          >
            Get Loan (5% interest)
          </button>
          <button
            onClick={() => sSL(false)}
            className="w-full mt-2 py-3 text-gray-600 font-semibold"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-6 text-white">
            <h3 className="font-bold text-lg mb-2">💰 Need Money Now?</h3>
            <p className="text-sm mb-4 opacity-90">
              Get instant loans up to ₦500,000 at just 5% interest
            </p>
            <button
              onClick={() => sSL(true)}
              className="w-full py-3 rounded-lg font-semibold bg-white text-green-700"
            >
              Apply for Loan
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm mb-6">
            <h3 className="font-bold mb-3">Why Choose Our Loans?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Instant Approval</p>
                  <p className="text-xs text-gray-600">Get money in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Low Interest</p>
                  <p className="text-xs text-gray-600">Only 5% flat rate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">No Collateral</p>
                  <p className="text-xs text-gray-600">Trust-based lending</p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold mb-3">Active Loans ({uD.ln.length})</h3>
          {uD.ln.length === 0 ? (
            <div className="bg-white p-6 rounded-xl text-center">
              <p className="text-gray-600">No active loans</p>
              <p className="text-xs text-gray-500 mt-1">
                Apply for your first loan above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {uD.ln.map((ln) => (
                <div
                  key={ln.id}
                  className="bg-white p-4 rounded-xl shadow-sm border"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-bold">₦{ln.amt.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{ln.pur}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Repayment Amount</p>
                    <p className="text-lg font-bold text-red-600">
                      ₦{ln.tot.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: {new Date(ln.repayBy).toLocaleDateString()}
                    </p>
                  </div>
                  {ln.groupId && (
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Will be deducted from ROSCA payout
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  // ===== LOAN PROMPT MODAL =====
  const LoanPromptModal = () => {
    if (!showLoanPrompt || !promptedGroup) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h3 className="font-bold text-lg mb-3">💰 Need a Quick Loan?</h3>
          <p className="text-sm text-gray-700 mb-4">
            You don't have enough balance to join{" "}
            <strong>{promptedGroup.n}</strong>.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-600 mb-1">Required Amount</p>
            <p className="text-xl font-bold">
              ₦{promptedGroup.a.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Your Balance: ₦{uD.wb.toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get an instant loan at 5% interest to join this group now!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                // ✅ TRACK LOAN DECISION
                await trackLoanDecision(
                  uD.id,
                  uD.name || "Unknown",
                  "accepted",
                  {
                    purpose: `ROSCA - ${promptedGroup.n}`,
                    amount: promptedGroup.a,
                    groupId: promptedGroup.id,
                    promptNumber: 1,
                  }
                );

                await tL(
                  promptedGroup.a,
                  `ROSCA - ${promptedGroup.n}`,
                  promptedGroup.id
                );
                // Auto-join after loan
                setTimeout(() => jRG(promptedGroup), 500);
              }}
              className="py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: C.p }}
            >
              Get Loan
            </button>
            <button
              onClick={async () => {
                // ✅ TRACK LOAN DECLINED
                await trackLoanDecision(
                  uD.id,
                  uD.name || "Unknown",
                  "declined",
                  {
                    purpose: `ROSCA - ${promptedGroup.n}`,
                    amount: promptedGroup.a,
                    groupId: promptedGroup.id,
                    promptNumber: 1,
                  }
                );

                setShowLoanPrompt(false);
                setPromptedGroup(null);
              }}
              className="py-3 rounded-full font-semibold border-2 border-gray-300 text-gray-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== QUICK ACTIONS =====
  const QA = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: C.pL }}
      >
        {React.cloneElement(icon, { size: 20, style: { color: C.p } })}
      </div>
      <span className="text-xs text-center leading-tight font-medium">
        {label}
      </span>
    </button>
  );

  // ===== BOTTOM NAV =====
  const BN = ({ active, setScreen }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 max-w-md mx-auto">
      {[
        { icon: <Home />, label: "Home", key: "home", screen: "dashboard" },
        { icon: <Users />, label: "ROSCA", key: "groups", screen: "rosca" },
        { icon: <Clock />, label: "Savings", key: "savings", screen: "fixed" },
        {
          icon: <TrendingUp />,
          label: "Invest",
          key: "invest",
          screen: "invest",
        },
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => setScreen(item.screen)}
          className="flex flex-col items-center gap-1"
        >
          {React.cloneElement(item.icon, {
            size: 24,
            style: { color: active === item.key ? C.p : C.g },
          })}
          <span
            className="text-xs"
            style={{ color: active === item.key ? C.p : C.g }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );

  // ===== SCREEN SWITCHER =====
  const renderScreen = () => {
    switch (s) {
      case "splash":
        return <Splash />;
      case "welcome":
        return <Welcome onSignup={hSU} onLogin={hLI} />;
      case "kyc":
        return <BaselineSurvey
          onComplete={async () => {
            // Automatically claim token for new users
            if (!uD?.hC) {
              await claimToken();
            }
            sS("dashboard");
          }}
          saveData={svD}
        />;
      case "dashboard":
        if (uR === "superadmin")
          return (
            <AdminAnalytics onBack={() => sS("dashboard")} userData={uD} />
          );
        return (
          <DashboardScreenNew
            userData={uD}
            setCurrentScreen={sS}
            saveUserData={svD}
            handleLogout={hLO}
            seedGroups={seedGroupsToFirebase}
          />
        );
      case "trust":
        return <TrustScorePage userData={uD} setCurrentScreen={sS} />;
      case "research":
        return <ResearchDataScreen userData={uD} setCurrentScreen={sS} />;
      case "rosca":
        return <Rosca />;
      case "rosca-detail":
        return <RoscaDet />;
      case "fixed":
        return <Fixed />;
      case "target":
        return <Target />;
      case "invest":
        return <Invest />;
      case "loans":
        return <Loans />;
      case "analytics":
        return <AdminAnalytics onBack={() => sS("dashboard")} userData={uD} />;
      default:
        return (
          <DashboardScreenNew
            userData={uD}
            setCurrentScreen={sS}
            saveUserData={svD}
            handleLogout={hLO}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {renderScreen()}
      <LoanPromptModal />
    </div>
  );
}
