// app/page.js - Fintech Research MVP
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
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import Welcome from "../app/Welcome";
import KYC from "../app/KYC";
import DashboardScreen from "../app/DashboardScreen";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

import { trackAction, trackUserRegistration } from "../lib/analytics";

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
const INITIAL_ROSCA_GROUPS = [
  // Weekly 3K Groups (Budget friendly - 12 groups)
  {id: 'wk3k1', n: 'Budget Squad', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 96},
  {id: 'wk3k2', n: 'Small Steps', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 93},
  {id: 'wk3k3', n: 'Starter Circle', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 91},
  {id: 'wk3k4', n: 'Young Savers', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 94},
  {id: 'wk3k5', n: 'New Beginnings', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 92},
  {id: 'wk3k6', n: 'Fresh Start', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 95},
  {id: 'wk3k7', n: 'Baby Steps', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 90},
  {id: 'wk3k8', n: 'Smart Start', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 93},
  {id: 'wk3k9', n: 'Easy Save', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 91},
  {id: 'wk3k10', n: 'Quick Win', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 94},
  {id: 'wk3k11', n: 'First Steps', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 92},
  {id: 'wk3k12', n: 'Mini Moves', a: 3000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 95},

  // Weekly 5K Groups (Popular tier - 15 groups)
  {id: 'wk5k1', n: 'Weekly Hustlers', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 92},
  {id: 'wk5k2', n: 'Fast Track', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 95},
  {id: 'wk5k3', n: 'Quick Returns', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 88},
  {id: 'wk5k4', n: 'Side Hustle', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 90},
  {id: 'wk5k5', n: 'Weekend Squad', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 93},
  {id: 'wk5k6', n: 'Smart Savers', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 91},
  {id: 'wk5k7', n: 'Money Moves', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 89},
  {id: 'wk5k8', n: 'Steady Grind', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 94},
  {id: 'wk5k9', n: 'Goal Getters', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 87},
  {id: 'wk5k10', n: 'Rising Stars', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 92},
  {id: 'wk5k11', n: 'Progress Circle', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 90},
  {id: 'wk5k12', n: 'Momentum', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 93},
  {id: 'wk5k13', n: 'Win Circle', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 91},
  {id: 'wk5k14', n: 'Success Squad', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 94},
  {id: 'wk5k15', n: 'Achievers', a: 5000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 88},

  // Weekly 10K Groups (Mid-tier - 10 groups)
  {id: 'wk10k1', n: 'Big Moves', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 91},
  {id: 'wk10k2', n: 'High Rollers', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 89},
  {id: 'wk10k3', n: 'Power Save', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 94},
  {id: 'wk10k4', n: 'Elite Weekly', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 90},
  {id: 'wk10k5', n: 'Wealth Builders', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 92},
  {id: 'wk10k6', n: 'Double Up', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 88},
  {id: 'wk10k7', n: 'Strong Save', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Chioma', r: 93},
  {id: 'wk10k8', n: 'Level Up', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Yemi', r: 91},
  {id: 'wk10k9', n: 'Big League', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Bola', r: 89},
  {id: 'wk10k10', n: 'Premium Squad', a: 10000, f: 'Weekly', d: '6w', m: 6, c: 0, ad: 'Tunde', r: 94},

  // Monthly 20K Groups (Entry monthly - 8 groups)
  {id: 'mn20k1', n: 'Young Professionals', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 95},
  {id: 'mn20k2', n: 'Steady Growth', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 91},
  {id: 'mn20k3', n: 'Future Fund', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 93},
  {id: 'mn20k4', n: 'Smart Monthly', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 90},
  {id: 'mn20k5', n: 'Career Savers', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 92},
  {id: 'mn20k6', n: 'Monthly Movers', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 88},
  {id: 'mn20k7', n: 'Progress Path', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 94},
  {id: 'mn20k8', n: 'Next Level', a: 20000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 91},

  // Monthly 30K Groups (Popular monthly - 8 groups)
  {id: 'mn30k1', n: '30K Squad', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 90},
  {id: 'mn30k2', n: 'Salary Savers', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 92},
  {id: 'mn30k3', n: 'Smart Money', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 88},
  {id: 'mn30k4', n: 'Mid Tier', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 93},
  {id: 'mn30k5', n: 'Core Savers', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 91},
  {id: 'mn30k6', n: 'Solid Ground', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 89},
  {id: 'mn30k7', n: 'Building Blocks', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 94},
  {id: 'mn30k8', n: 'Foundation', a: 30000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 90},

  // Monthly 50K Groups (High tier - 6 groups)
  {id: 'mn50k1', n: '50K Club', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 91},
  {id: 'mn50k2', n: 'Business Builders', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 89},
  {id: 'mn50k3', n: 'Elite Savers', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 94},
  {id: 'mn50k4', n: 'Major Moves', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 90},
  {id: 'mn50k5', n: 'Prime Circle', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 92},
  {id: 'mn50k6', n: 'Growth Fund', a: 50000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 88},

  // Monthly 100K Groups (Premium - 4 groups)
  {id: 'mn100k1', n: 'Century Club', a: 100000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Tunde', r: 90},
  {id: 'mn100k2', n: 'Big League', a: 100000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Chioma', r: 92},
  {id: 'mn100k3', n: 'Elite 100', a: 100000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Yemi', r: 89},
  {id: 'mn100k4', n: 'Wealth Circle', a: 100000, f: 'Monthly', d: '6m', m: 6, c: 0, ad: 'Bola', r: 93},
];

// ===== INVESTMENTS =====
const IV = [
  {
    id: 'sf1',
    n: 'SupreFarm - Rice',
    t: 'Agriculture',
    r: '18%',
    d: '6m',
    mi: 50000,
    ri: 'Low',
    ds: 'Climate-smart rice farming with guaranteed harvest-backed returns'
  },
  {
    id: 'sf2',
    n: 'SupreFarm - Maize',
    t: 'Agriculture',
    r: '15%',
    d: '4m',
    mi: 30000,
    ri: 'Low',
    ds: 'Sustainable maize production with predictable yields'
  },
  {
    id: 'sf3',
    n: 'SupreFarm - Poultry',
    t: 'Agriculture',
    r: '20%',
    d: '3m',
    mi: 40000,
    ri: 'Low',
    ds: 'Fast-cycle poultry farming with high returns'
  },
  {
    id: 'ab1',
    n: 'Airbnb Co-hosting',
    t: 'Real Estate',
    r: '25%',
    d: '12m',
    mi: 100000,
    ri: 'Medium',
    ds: 'Share in Airbnb property revenue streams with monthly payouts'
  },
  {
    id: 'ab2',
    n: 'Short Stay Property',
    t: 'Real Estate',
    r: '30%',
    d: '12m',
    mi: 200000,
    ri: 'Medium',
    ds: 'Own a share of vacation rental properties in prime locations'
  },
  {
    id: 'tb1',
    n: 'Treasury Bills',
    t: 'Government',
    r: '12%',
    d: '3m',
    mi: 10000,
    ri: 'Very Low',
    ds: 'Government-backed securities with zero default risk'
  },
  {
    id: 'tech1',
    n: 'Tech Startup Fund',
    t: 'Equity',
    r: '40%',
    d: '12m',
    mi: 150000,
    ri: 'High',
    ds: 'Invest in pre-seed Nigerian tech startups. High risk, high reward'
  },
];

// ===== FIXED SAVINGS PLANS =====
const FS = [
  { d: '3m', r: 8, mi: 10000, label: '3 Months - 8% Returns' },
  { d: '6m', r: 12, mi: 25000, label: '6 Months - 12% Returns' },
  { d: '9m', r: 15, mi: 50000, label: '9 Months - 15% Returns' },
  { d: '12m', r: 18, mi: 50000, label: '12 Months - 18% Returns' },
];

export default function App() {
  const [s, sS] = useState("splash");
  const [uR, sUR] = useState("user");
  const [uD, sUD] = useState({
    id: Math.random().toString(36).substr(2, 9),
    name: "Test User",
    email: "",
    phone: "",
    wb: 0, // Starts at 0 - must claim research token
    at: 0,
    hC: false, // Has claimed research token
    hK: false,
    cs: 750,
    role: "user",
    jG: [], // Joined groups with payout info
    gR: [], // Group requests
    ln: [], // Active loans
    fS: [], // Fixed savings
    tS: [], // Target savings
    inv: [], // Investments
    tr: [], // Transactions
    lnP: [], // Loan prompts shown
  });
  const [aG, sAG] = useState([...INITIAL_ROSCA_GROUPS]);
  const [sG, sSG] = useState(null);
  const [sI, sSI] = useState(null);
  const [rT, sRT] = useState("All");
  const [sL, sSL] = useState(false);
  const [showLoanPrompt, setShowLoanPrompt] = useState(false);
  const [promptedGroup, setPromptedGroup] = useState(null);

  // ===== Firebase Auth =====
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          sUD(snap.data());
          sUR(snap.data().role);
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

  // ===== SIMULATION: Groups fill up with other users =====
  useEffect(() => {
    const interval = setInterval(() => {
      sAG((prevGroups) =>
        prevGroups.map((g) => {
          // 20% chance someone joins if group not full
          if (g.c < g.m && Math.random() > 0.8) {
            return { ...g, c: g.c + 1 };
          }
          return g;
        })
      );
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // ===== ROSCA WEEKLY DEDUCTION SIMULATION =====
  useEffect(() => {
    // Check for weekly deductions (simulate every 30 seconds for testing)
    const deductionInterval = setInterval(() => {
      uD.jG.forEach((joinedGroup) => {
        processWeeklyDeduction(joinedGroup);
      });
    }, 30000); // Every 30 seconds for testing (would be weekly in production)

    return () => clearInterval(deductionInterval);
  }, [uD.jG]);

  const t = async (a, d = {}) => {
    console.log("📊", a, d);
    await trackAction(uD.id, uD.name, uD.email, a, { ...d, screen: s });
  };

  const svD = async (u) => {
    const newData = { ...uD, ...u };
    sUD(newData);
    if (uD.id) await updateDoc(doc(db, "users", uD.id), u);
  };

  const hSU = async (e, p, n, ph, r) => {
    try {
      const uC = await createUserWithEmailAndPassword(auth, e, p);
      const u = uC.user;
      const nD = { ...uD, email: e, name: n, phone: ph, role: r, id: u.uid };
      await setDoc(doc(db, "users", u.uid), nD);
      await trackUserRegistration(nD);
      sUD(nD);
      sUR(r);
      await t("signed_up", { email: e, role: r });
      sS("kyc");
      return { success: true };
    } catch (er) {
      alert("Error: " + er.message);
      return { success: false };
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
        await t("logged_in");
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
    await t("logged_out");
    await signOut(auth);
    sS("welcome");
  };

  // ===== CLAIM RESEARCH TOKEN =====
  const claimToken = () => {
    if (uD.hC) {
      alert("❌ You've already claimed your research token!");
      return;
    }

    svD({
      wb: 100000,
      at: 100000,
      hC: true, // Mark as claimed
    });

    t("research_token_claimed", { amount: 100000 });
  };

  // ===== ROSCA: Join Group =====
  const jRG = (g) => {
    if (g.c >= g.m) {
      alert("❌ Group is Full!");
      return;
    }

    // Check if already joined
    if (uD.jG.some(jg => jg.id === g.id)) {
      alert("❌ You've already joined this group!");
      return;
    }

    // Check wallet balance
    if (uD.wb < g.a) {
      // Offer loan
      setPromptedGroup(g);
      setShowLoanPrompt(true);
      return;
    }

    // Join group successfully
    const position = g.c + 1; // Their payout position
    const payoutWeek = position; // Week they'll receive payout
    const totalPayout = g.a * g.m; // Total they'll receive

    const uG = aG.map((gr) => (gr.id === g.id ? { ...gr, c: gr.c + 1 } : gr));
    sAG(uG);

    svD({
      wb: uD.wb - g.a, // Deduct first contribution
      jG: [
        ...uD.jG,
        {
          ...g,
          jAt: new Date().toISOString(),
          pos: position,
          payoutWeek,
          totalPayout,
          weeksPaid: 1,
          nextDeduction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      gR: uD.gR.filter((r) => r.id !== g.id),
    });

    t("rosca_joined", { group: g.n, amt: g.a, position });
    alert(`✅ Joined ${g.n}!\n💰 Position #${position}\n📅 You'll receive ₦${totalPayout.toLocaleString()} in week ${payoutWeek}`);
    sS("rosca");
  };

  // ===== ROSCA: Weekly Deduction =====
  const processWeeklyDeduction = (joinedGroup) => {
    const nextDeductionDate = new Date(joinedGroup.nextDeduction);
    if (new Date() >= nextDeductionDate && joinedGroup.weeksPaid < joinedGroup.m) {
      if (uD.wb >= joinedGroup.a) {
        // Deduct successfully
        svD({
          wb: uD.wb - joinedGroup.a,
          jG: uD.jG.map(jg =>
            jg.id === joinedGroup.id
              ? {
                  ...jg,
                  weeksPaid: jg.weeksPaid + 1,
                  nextDeduction: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                }
              : jg
          ),
        });
        alert(`💸 ₦${joinedGroup.a.toLocaleString()} deducted for ${joinedGroup.n}`);
      } else {
        // Insufficient balance - offer loan
        setPromptedGroup(joinedGroup);
        setShowLoanPrompt(true);
      }
    }

    // Process payout if it's their week
    if (joinedGroup.weeksPaid === joinedGroup.pos && !joinedGroup.paid) {
      svD({
        wb: uD.wb + joinedGroup.totalPayout,
        jG: uD.jG.map(jg =>
          jg.id === joinedGroup.id ? { ...jg, paid: true } : jg
        ),
      });
      alert(`🎉 ROSCA Payout! You received ₦${joinedGroup.totalPayout.toLocaleString()} from ${joinedGroup.n}`);
    }
  };

  // ===== LOANS =====
  const tL = (amt, pur, groupId = null) => {
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

    svD({ wb: uD.wb + amt, ln: [...uD.ln, ln] });
    t("loan_taken", { amt, pur, groupId });
    alert(`✅ Loan Approved!\n💰 Amount: ₦${amt.toLocaleString()}\n📈 Interest: 5%\n💳 Repay: ₦${tot.toLocaleString()}`);
    sSL(false);
    setShowLoanPrompt(false);
  };

  // ===== LOAN AGAINST FUTURE ROSCA PAYOUT =====
  const loanAgainstRosca = (group) => {
    const joinedGroup = uD.jG.find(jg => jg.id === group.id);
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
      tL(maxLoan, `ROSCA Advance - ${group.n}`, group.id);
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
      style={{ background: `linear-gradient(180deg,${C.pD},${C.p})` }}
    >
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Supreb⊗se</h1>
        <div className="w-16 h-1 bg-white mx-auto mb-6" />
        <p className="text-sm opacity-90">Fintech Research Platform</p>
        <p className="text-xs opacity-75 mt-2">Testing Financial Behaviors</p>
      </div>
    </div>
  );

  const Rosca = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div
        className="p-6 text-white rounded-b-3xl"
        style={{ background: `linear-gradient(135deg,${C.pD},${C.p})` }}
      >
        <h2 className="text-2xl font-bold mb-2">ROSCA Groups</h2>
        <p className="text-sm opacity-90 mb-4">Join trusted rotating savings groups</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-xs opacity-90 mb-1">Total Groups</p>
          <p className="text-3xl font-bold">{aG.length}</p>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-4 border-b overflow-x-auto bg-white">
        {["All", "Open", "Joined", "Request"].map((tab) => (
          <button
            key={tab}
            onClick={() => sRT(tab)}
            className={`text-sm font-semibold pb-2 border-b-2 whitespace-nowrap ${
              rT === tab
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab} ({
              tab === "All" ? aG.length :
              tab === "Open" ? aG.filter(g => g.c < g.m).length :
              tab === "Joined" ? uD.jG.length :
              uD.gR.length
            })
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4 mt-4">
        {fG().map((g) => {
          const isJoined = uD.jG.some(jg => jg.id === g.id);
          const isFull = g.c >= g.m;

          return (
            <div
              key={g.id}
              className="bg-white p-5 rounded-xl shadow-sm border"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-bold">{g.n}</h4>
                  <p className="text-xs text-gray-600">
                    {g.f} • {g.d} • {g.c}/{g.m} members
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      isFull
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isFull ? "Full" : "Open"}
                  </span>
                  {isJoined && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">✓ Joined</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-gray-600 mb-1">Contribution</p>
                <p className="text-xl font-bold">₦{g.a.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">Total Payout: ₦{(g.a * g.m).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sSG(g);
                    sS("rosca-detail");
                  }}
                  className="py-2 rounded-lg text-sm font-semibold border-2 border-green-600 text-green-700"
                >
                  View Details
                </button>
                {!isJoined && !isFull && (
                  <button
                    onClick={() => jRG(g)}
                    className="py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: C.p }}
                  >
                    Join Now
                  </button>
                )}
                {isJoined && (
                  <button
                    onClick={() => loanAgainstRosca(g)}
                    className="py-2 rounded-lg text-sm font-semibold bg-yellow-500 text-white"
                  >
                    Get Advance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BN active="groups" setScreen={sS} />
    </div>
  );

  const RoscaDet = () => {
    if (!sG) return null;
    const isJoined = uD.jG.some(jg => jg.id === sG.id);
    const joinedData = uD.jG.find(jg => jg.id === sG.id);

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-6 bg-white border-b">
          <button onClick={() => sS("rosca")} className="mb-4">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">{sG.n}</h2>
          <p className="text-sm text-gray-600">{sG.f} • {sG.d}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Group Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Contribution</p>
                <p className="text-xl font-bold">₦{sG.a.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Payout</p>
                <p className="text-xl font-bold">₦{(sG.a * sG.m).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Members</p>
                <p className="text-lg font-bold">{sG.c}/{sG.m}</p>
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
              <p className="text-sm mb-2">Payout Week: Week {joinedData.payoutWeek}</p>
              <p className="text-sm mb-2">Expected Payout: ₦{joinedData.totalPayout.toLocaleString()}</p>
              <p className="text-sm">Weeks Paid: {joinedData.weeksPaid}/{sG.m}</p>
            </div>
          )}

          {!isJoined && (
            <button
              onClick={() => jRG(sG)}
              disabled={sG.c >= sG.m}
              className="w-full py-4 rounded-full font-semibold text-white disabled:bg-gray-400"
              style={{ backgroundColor: sG.c >= sG.m ? '#CBD5E0' : C.p }}
            >
              {sG.c >= sG.m ? 'Group Full' : 'Join Group'}
            </button>
          )}

          {isJoined && (
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
      <p className="text-sm text-gray-600 mb-6">Lock your money and earn guaranteed returns</p>

      <div className="space-y-4">
        {FS.map((p, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-lg">{p.d.toUpperCase()}</h4>
                <p className="text-xs text-gray-600">Min: ₦{p.mi.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <p className="text-2xl font-bold">{p.r}%</p>
                <p className="text-xs">Returns</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-600">Example:</p>
              <p className="text-sm font-semibold">
                Save ₦{p.mi.toLocaleString()} → Get ₦{(p.mi + (p.mi * p.r / 100)).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => {
                const amt = prompt(`Enter amount (min ₦${p.mi.toLocaleString()}):`);
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

                svD({
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
                      status: 'Active'
                    },
                  ],
                });

                t("fixed_savings_locked", { amt: amount, dur: p.d });
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
                  <span className="font-semibold">₦{fs.amt.toLocaleString()}</span>
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
      <p className="text-sm text-gray-600 mb-6">Save weekly towards your goals (6 weeks)</p>

      <button
        className="w-full p-6 border-2 border-dashed border-green-300 rounded-xl text-center mb-6 hover:bg-green-50"
        onClick={() => {
          const n = prompt("Goal name (e.g., 'New Phone'):");
          if (!n) return;

          const tg = parseInt(prompt("Target amount (₦):"));
          if (!tg) return;

          const wk = parseInt(prompt("How much can you save weekly? (₦):"));
          if (!wk) return;

          const weeks = Math.min(Math.ceil(tg / wk), 6); // Max 6 weeks

          svD({
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

          t("target_created", { name: n, target: tg });
          alert(`✅ Goal "${n}" created!\nSave ₦${wk.toLocaleString()}/week for ${weeks} weeks`);
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
            <div key={ts.id} className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex justify-between mb-3">
                <h4 className="font-bold">{ts.n}</h4>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  ts.st === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
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
                <p className="text-xs text-gray-600">Remaining: ₦{remaining.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Weekly: ₦{ts.wk.toLocaleString()}</p>
              </div>

              {ts.st === 'Active' && (
                <button
                  onClick={() => {
                    if (uD.wb < ts.wk) {
                      const needLoan = confirm(
                        `❌ Insufficient balance!\n\n` +
                        `You need ₦${ts.wk.toLocaleString()} but have ₦${uD.wb.toLocaleString()}\n\n` +
                        `Get a quick loan?`
                      );
                      if (needLoan) {
                        tL(ts.wk, `Target Savings - ${ts.n}`);
                      }
                      return;
                    }

                    const newCurrent = ts.cur + ts.wk;
                    const isComplete = newCurrent >= ts.tg;

                    svD({
                      wb: uD.wb - ts.wk,
                      tS: uD.tS.map((t) =>
                        t.id === ts.id
                          ? {
                              ...t,
                              cur: newCurrent,
                              wkD: t.wkD + 1,
                              st: isComplete ? 'Completed' : 'Active'
                            }
                          : t
                      ),
                    });

                    t("target_contribution", { goal: ts.n, amt: ts.wk });

                    if (isComplete) {
                      alert(`🎉 Goal Completed!\n\n"${ts.n}"\nTotal saved: ₦${newCurrent.toLocaleString()}`);
                    } else {
                      alert(`✅ Saved ₦${ts.wk.toLocaleString()}!\nWeek ${ts.wkD + 1}/${ts.wks} complete`);
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
      <p className="text-sm text-gray-600 mb-6">Grow your money through smart investments</p>

      <div className="space-y-4">
        {IV.map((inv) => {
          const riskColors = {
            'Very Low': 'bg-blue-100 text-blue-700',
            'Low': 'bg-green-100 text-green-700',
            'Medium': 'bg-yellow-100 text-yellow-700',
            'High': 'bg-red-100 text-red-700'
          };

          return (
            <div key={inv.id} className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-bold">{inv.n}</h4>
                  <p className="text-xs text-gray-600">{inv.t} • {inv.d}</p>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full mb-1">
                    <p className="text-lg font-bold">{inv.r}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${riskColors[inv.ri]}`}>
                    {inv.ri} Risk
                  </span>
                </div>
              </div>

              <p className="text-sm mb-4 text-gray-700">{inv.ds}</p>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-1">Minimum Investment</p>
                <p className="text-xl font-bold">₦{inv.mi.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Expected: ₦{(inv.mi + (inv.mi * parseFloat(inv.r) / 100)).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => {
                  const amt = prompt(`Enter amount (min ₦${inv.mi.toLocaleString()}):`);
                  const amount = parseInt(amt);

                  if (!amount || amount < inv.mi) {
                    alert(`❌ Minimum investment is ₦${inv.mi.toLocaleString()}`);
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
                      tL(amount, `Investment - ${inv.n}`);
                      // Continue with investment after loan
                    } else {
                      return;
                    }
                  }

                  const rt = parseFloat(inv.r) / 100;
                  const ret = amount * rt;
                  const maturityDate = new Date();
                  maturityDate.setMonth(maturityDate.getMonth() + parseInt(inv.d));

                  svD({
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
                        status: 'Active'
                      },
                    ],
                  });

                  t("investment_made", { name: inv.n, amt: amount });
                  alert(
                    `✅ Investment Successful!\n\n` +
                    `${inv.n}\n` +
                    `Amount: ₦${amount.toLocaleString()}\n` +
                    `Returns: ${inv.r}\n` +
                    `Expected profit: ₦${ret.toLocaleString()}\n` +
                    `Total at maturity: ₦${(amount + ret).toLocaleString()}\n` +
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
              <div key={investment.st} className="bg-white p-4 rounded-xl shadow-sm border">
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
                  Expected: ₦{investment.tot.toLocaleString()} ({investment.r} return)
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
      <p className="text-sm text-gray-600 mb-6">Get instant cash when you need it</p>

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
            onClick={() => {
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

              tL(amt, purpose);
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
              <p className="text-xs text-gray-500 mt-1">Apply for your first loan above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uD.ln.map((ln) => (
                <div key={ln.id} className="bg-white p-4 rounded-xl shadow-sm border">
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
            You don't have enough balance to join <strong>{promptedGroup.n}</strong>.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-600 mb-1">Required Amount</p>
            <p className="text-xl font-bold">₦{promptedGroup.a.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-2">Your Balance: ₦{uD.wb.toLocaleString()}</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get an instant loan at 5% interest to join this group now!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                tL(promptedGroup.a, `ROSCA - ${promptedGroup.n}`, promptedGroup.id);
                // Auto-join after loan
                setTimeout(() => jRG(promptedGroup), 500);
              }}
              className="py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: C.p }}
            >
              Get Loan
            </button>
            <button
              onClick={() => {
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
      <span className="text-xs text-center leading-tight font-medium">{label}</span>
    </button>
  );

  // ===== BOTTOM NAV =====
  const BN = ({ active, setScreen }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 max-w-md mx-auto">
      {[
        { icon: <Home />, label: "Home", key: "home", screen: "dashboard" },
        { icon: <Users />, label: "ROSCA", key: "groups", screen: "rosca" },
        { icon: <Clock />, label: "Savings", key: "savings", screen: "fixed" },
        { icon: <TrendingUp />, label: "Invest", key: "invest", screen: "invest" },
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
        return <KYC onComplete={() => sS("dashboard")} saveData={svD} />;
      case "dashboard":
        return (
          <DashboardScreen
            userData={uD}
            userRole={uR}
            setCurrentScreen={sS}
            track={t}
            onClaimToken={claimToken}
          />
        );
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
      default:
        return <DashboardScreen userData={uD} userRole={uR} setCurrentScreen={sS} track={t} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {renderScreen()}
      <LoanPromptModal />
    </div>
  );
}