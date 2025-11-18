// components/DashboardScreen.js
"use client";
import React from "react";
import {
  Wallet,
  Users,
  Target,
  TrendingUp,
  Shield,
  Send,
  User,
  Bell,
  Clock,
  DollarSign,
  Plus,
  AlertTriangle,
  Gift,
  CheckCircle,
} from "lucide-react";
import useUserRole from "../lib/useUserRole";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";


// ✅ Use your same color palette (C) from the app
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

// ✅ Reusable subcomponents
const QuickAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-3 hover:bg-gray-50 transition"
  >
    <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2 text-green-700 bg-green-50">
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-700">{label}</p>
  </button>
);

const FeatureCard = ({ icon, title, subtitle, onClick, color = C.p }) => (
  <div
    onClick={onClick}
    className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
  >
    <div 
      className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
      style={{ backgroundColor: `${color}15` }}
    >
      {React.cloneElement(icon, { size: 24, style: { color } })}
    </div>
    <h3 className="text-base font-bold mb-2">{title}</h3>
    <p className="text-xs text-gray-600 leading-relaxed">{subtitle}</p>
  </div>
);

// ✅ Full DashboardScreen Component
export default function DashboardScreen({
  userData,
  userRole,
  setCurrentScreen,
  track,
  onClaimToken,
}) {
  const { role, loading } = useUserRole();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (role === "superadmin") {
    router.replace("/admin");
    return null;
  }
  
  // Claim research token function
  const claimResearchToken = () => {
    if (userData.hC) {
      alert("✅ You've already claimed your research token!");
      return;
    }

    const confirmClaim = confirm(
      "🎁 Research Token\n\n" +
      "Claim ₦100,000 to test our platform!\n\n" +
      "This is a one-time claim for research purposes.\n\n" +
      "Continue?"
    );

    if (confirmClaim && onClaimToken) {
      onClaimToken();
      alert("✅ ₦100,000 added to your wallet!\n\nStart exploring our features!");
    }
  };

  // Calculate total active loans
  const totalLoans = userData.ln?.reduce((sum, loan) => sum + loan.tot, 0) || 0;
  const hasActiveLoans = userData.ln?.length > 0;

  // Check if any loans are tied to ROSCA
  const roscaLoans = userData.ln?.filter(ln => ln.groupId) || [];
  const auth = getAuth();

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/");     // Redirect to login/welcome page
  } catch (error) {
    console.error("Logout error:", error);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- Top Banner --- */}
      <div
        className="p-6 pb-20 text-white relative"
        // style={{
        //   background: `linear-gradient(135deg, ${C.pD} 0%, ${C.p} 100%)`,
        // }}
        style={{ background: "linear-gradient(180deg, #4CC79A, #2FAF7C)" }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm opacity-90">
                Hello {userData?.name || "User"}
              </p>
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                Research
              </span>
            </div>
            <p className="text-xs opacity-75">
              Your financial playground for research 🔍
            </p>
          </div>
          <div className="flex gap-3">
            <Bell size={22} />
            {/* <User
              size={22}
              onClick={() => setCurrentScreen("profile")}
              className="cursor-pointer"
            /> */}
            <User
  size={22}
  onClick={handleLogout}
  className="cursor-pointer"
  title="Logout"
/>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center relative z-10">
          <p className="text-sm opacity-90 mb-1">Wallet Balance</p>
          <h1 className="text-4xl font-bold mb-2">
            ₦{(userData?.wb || 0).toLocaleString()}.00
          </h1>
          <p className="text-xs opacity-75">
          Credit Score: {userData?.cs ?? "—"}
          </p>
          
          {/* Show if token not claimed */}
          {!userData?.hC && (
            <button
              onClick={claimResearchToken}
              className="mt-4 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 mx-auto hover:bg-yellow-300 transition shadow-lg animate-pulse"
            >
              <Gift size={16} />
              Claim ₦100,000 Research Token
            </button>
          )}

          {userData?.hC && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs opacity-90">
              <CheckCircle size={14} />
              <span>Research token claimed</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Active Loan Alert --- */}
      {hasActiveLoans && (
        <div className="-mt-20 px-6 mb-4 relative z-20">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">⚠️ Active Loans</h3>
                <p className="text-sm text-red-800 mb-2">
                  You have {userData.ln.length} active loan{userData.ln.length > 1 ? 's' : ''}
                </p>
                <p className="text-lg font-bold text-red-900">
                  Total Repayment: ₦{totalLoans.toLocaleString()}
                </p>
                
                {/* Show ROSCA repayment info */}
                {roscaLoans.length > 0 && (
                  <div className="mt-3 bg-white/60 rounded-lg p-3 border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-2">
                      💡 ROSCA Loan Repayment Info:
                    </p>
                    {roscaLoans.map((loan, idx) => {
                      const groupName = userData.jG?.find(g => g.id === loan.groupId)?.n || 'ROSCA Group';
                      return (
                        <p key={idx} className="text-xs text-red-800 mb-1">
                          • ₦{loan.tot.toLocaleString()} will be auto-deducted from your <strong>{groupName}</strong> payout
                        </p>
                      );
                    })}
                    <p className="text-xs text-red-700 mt-2 italic">
                      Your ROSCA payout will be reduced by the loan amount
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setCurrentScreen("loans")}
                  className="mt-3 text-xs font-semibold text-red-700 underline"
                >
                  View All Loans →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Quick Actions --- */}
      <div className={`px-6 mb-8 ${hasActiveLoans ? '' : '-mt-16'}`}>
        <div className="grid grid-cols-4 gap-3 mt-18">
          <QuickAction
            icon={<Plus size={18} />}
            label="Claim Token"
            onClick={() => {
              if (!userData.hC) {
                claimResearchToken();
              } else {
                alert("✅ You've already claimed your ₦100,000 research token!");
              }
            }}
          />
          <QuickAction
            icon={<Send size={18} />}
            label="Withdraw"
            onClick={() => setCurrentScreen("withdraw")}
          />
          <QuickAction
            icon={<Users size={18} />}
            label="Join ROSCA"
            onClick={() => setCurrentScreen("rosca")}
          />
          <QuickAction
            icon={<TrendingUp size={18} />}
            label="Invest"
            onClick={() => setCurrentScreen("invest")}
          />
        </div>
      </div>

      {/* --- Main Categories --- */}
      <div className="px-6">
        <h3 className="font-bold text-lg mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon={<Users size={24} />}
            title="ROSCA"
            subtitle="Join ROSCA to save with your peers"
            onClick={() => setCurrentScreen("rosca")}
            color="#2D9B7B"
          />

          <FeatureCard
            icon={<Clock size={24} />}
            title="Fixed Save"
            subtitle="Lock amount of money for a long period of time"
            onClick={() => setCurrentScreen("fixed")}
            color="#3B82F6"
          />

          <FeatureCard
            icon={<Target size={24} />}
            title="Target"
            subtitle="Save towards a goal with up to 10% returns"
            onClick={() => setCurrentScreen("target")}
            color="#F59E0B"
          />

          <FeatureCard
            icon={<TrendingUp size={24} />}
            title="Invest"
            subtitle="Explore profitable opportunities with Ajoti"
            onClick={() => setCurrentScreen("invest")}
            color="#10B981"
          />

          <FeatureCard
            icon={<DollarSign size={24} />}
            title="Loans"
            subtitle="Borrow instantly at 5% interest rate"
            onClick={() => setCurrentScreen("loans")}
            color="#8B5CF6"
          />

          <FeatureCard
            icon={<Send size={24} />}
            title="Remittance"
            subtitle="Send money locally and internationally"
            onClick={() => setCurrentScreen("remittance")}
            color="#06B6D4"
          />
        </div>
      </div>

      {/* --- Research Analytics for Super Admin --- */}
      {userRole === "superadmin" && (
        <div className="px-6 mt-8 mb-6">
          <button
            onClick={() => setCurrentScreen("analytics")}
            className="w-full py-4 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#805AD5" }}
          >
            📊 View Research Analytics
          </button>
        </div>
      )}
    </div>
  );
}