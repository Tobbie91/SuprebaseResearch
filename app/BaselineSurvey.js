"use client";
import React, { useState } from "react";
import { TrendingUp, DollarSign, Target, Users, ChevronRight, CheckCircle } from "lucide-react";

export default function BaselineSurvey({ onComplete, saveData }) {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState({
    // Financial Situation
    monthlyIncome: "",
    currentSavings: "",
    savingsFrequency: "",

    // Current Behaviors
    participatesInROSCA: "",
    borrowingFrequency: "",
    borrowingSources: [],
    hasInvested: "",

    // Goals & Challenges
    financialGoal: "",
    savingsChallenges: [],

    // Demographics
    ageRange: "",
    employmentStatus: "",
    location: "",
  });

  const colors = {
    primary: "#2D9B7B",
    background: "#F7FAFC",
  };

  const handleChange = (name, value) => {
    setSurveyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setSurveyData((prev) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const handleNext = () => {
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save baseline survey data
      if (saveData) {
        saveData({
          baselineSurvey: surveyData,
          surveyCompletedAt: new Date().toISOString()
        });
      }
      if (onComplete) onComplete();
    }
  };


  const canContinue = () => {
    if (step === 1) {
      return surveyData.monthlyIncome && surveyData.currentSavings && surveyData.savingsFrequency;
    }
    if (step === 2) {
      return surveyData.participatesInROSCA && surveyData.borrowingFrequency && surveyData.hasInvested;
    }
    if (step === 3) {
      return surveyData.financialGoal && surveyData.ageRange && surveyData.employmentStatus;
    }
    return false;
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={32} style={{ color: colors.primary }} />
          <h1 className="text-2xl font-bold text-gray-900">Financial Baseline Survey</h1>
        </div>
        <p className="text-sm text-gray-600">
          Help us understand your financial journey so we can measure your progress and improve our platform.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                s <= step ? "bg-teal-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500">Step {step} of 3</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
        {/* STEP 1: Financial Situation */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={24} style={{ color: colors.primary }} />
              <h2 className="text-xl font-bold text-gray-900">Your Current Financial Situation</h2>
            </div>

            {/* Monthly Income */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What is your approximate monthly income?
              </label>
              <div className="space-y-2">
                {[
                  { value: "below_30k", label: "Below ₦30,000 / $50" },
                  { value: "30k_100k", label: "₦30,000 - ₦100,000 / $50-$150" },
                  { value: "100k_300k", label: "₦100,000 - ₦300,000 / $150-$500" },
                  { value: "above_300k", label: "₦300,000+ / $500+" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("monthlyIncome", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.monthlyIncome === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.monthlyIncome === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Savings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How much do you currently have in savings?
              </label>
              <div className="space-y-2">
                {[
                  { value: "none", label: "No savings" },
                  { value: "below_1month", label: "Less than 1 month's income" },
                  { value: "1_3months", label: "1-3 months' income" },
                  { value: "3_6months", label: "3-6 months' income" },
                  { value: "above_6months", label: "6+ months' income" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("currentSavings", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.currentSavings === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.currentSavings === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Savings Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How often do you save money?
              </label>
              <div className="space-y-2">
                {[
                  { value: "never", label: "Never / Rarely" },
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                  { value: "daily", label: "Daily" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("savingsFrequency", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.savingsFrequency === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.savingsFrequency === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Financial Behaviors */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={24} style={{ color: colors.primary }} />
              <h2 className="text-xl font-bold text-gray-900">Your Financial Behaviors</h2>
            </div>

            {/* ROSCA Participation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Do you participate in any savings group (ROSCA/Ajo/Esusu)?
              </label>
              <div className="space-y-2">
                {[
                  { value: "yes_active", label: "Yes, actively participating" },
                  { value: "yes_not_current", label: "Yes, but not currently" },
                  { value: "no_never", label: "No, never tried" },
                  { value: "no_interested", label: "No, but interested" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("participatesInROSCA", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.participatesInROSCA === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.participatesInROSCA === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Borrowing Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How often do you borrow money?
              </label>
              <div className="space-y-2">
                {[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely (once a year or less)" },
                  { value: "sometimes", label: "Sometimes (few times a year)" },
                  { value: "often", label: "Often (monthly)" },
                  { value: "very_often", label: "Very often (weekly)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("borrowingFrequency", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.borrowingFrequency === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.borrowingFrequency === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Borrowing Sources - only show if they borrow */}
            {surveyData.borrowingFrequency && surveyData.borrowingFrequency !== "never" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Where do you usually borrow from? (Select all that apply)
                </label>
                <div className="space-y-2">
                  {[
                    { value: "family_friends", label: "Family/Friends" },
                    { value: "banks", label: "Banks" },
                    { value: "microfinance", label: "Microfinance institutions" },
                    { value: "money_lenders", label: "Money lenders" },
                    { value: "mobile_apps", label: "Mobile apps/Fintechs" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect("borrowingSources", option.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        surveyData.borrowingSources?.includes(option.value)
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        {surveyData.borrowingSources?.includes(option.value) && (
                          <CheckCircle size={20} className="text-teal-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Have you invested money before?
              </label>
              <div className="space-y-2">
                {[
                  { value: "yes_current", label: "Yes, currently investing" },
                  { value: "yes_not_anymore", label: "Yes, but not anymore" },
                  { value: "no_never", label: "No, never" },
                  { value: "no_interested", label: "No, but interested" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("hasInvested", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.hasInvested === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.hasInvested === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Goals & Demographics */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={24} style={{ color: colors.primary }} />
              <h2 className="text-xl font-bold text-gray-900">Your Goals & Background</h2>
            </div>

            {/* Financial Goal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What is your primary financial goal?
              </label>
              <div className="space-y-2">
                {[
                  { value: "emergency_savings", label: "Build emergency savings" },
                  { value: "specific_purchase", label: "Save for a specific purchase" },
                  { value: "pay_debt", label: "Pay off debt" },
                  { value: "business", label: "Start/grow a business" },
                  { value: "invest", label: "Invest for returns" },
                  { value: "send_money_home", label: "Send money home to family" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("financialGoal", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.financialGoal === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.financialGoal === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Savings Challenges */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What prevents you from saving regularly? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { value: "low_income", label: "Low income" },
                  { value: "unexpected_expenses", label: "Unexpected expenses" },
                  { value: "supporting_family", label: "Supporting family/friends" },
                  { value: "lack_discipline", label: "Lack of discipline" },
                  { value: "dont_know_how", label: "Don't know how to save" },
                  { value: "dont_trust", label: "Don't trust banks/saving platforms" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect("savingsChallenges", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.savingsChallenges?.includes(option.value)
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.savingsChallenges?.includes(option.value) && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Age Range
              </label>
              <div className="space-y-2">
                {[
                  { value: "18_24", label: "18-24" },
                  { value: "25_34", label: "25-34" },
                  { value: "35_44", label: "35-44" },
                  { value: "45_54", label: "45-54" },
                  { value: "55_plus", label: "55+" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("ageRange", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.ageRange === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.ageRange === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Employment Status
              </label>
              <div className="space-y-2">
                {[
                  { value: "employed_fulltime", label: "Employed (full-time)" },
                  { value: "employed_parttime", label: "Employed (part-time)" },
                  { value: "self_employed", label: "Self-employed/Business owner" },
                  { value: "student", label: "Student" },
                  { value: "unemployed", label: "Unemployed" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange("employmentStatus", option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      surveyData.employmentStatus === option.value
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {surveyData.employmentStatus === option.value && (
                        <CheckCircle size={20} className="text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location (Optional)
              </label>
              <input
                type="text"
                placeholder="City, State/Country"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
                value={surveyData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className="w-full py-4 rounded-full font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: colors.primary }}
        >
          {step === 3 ? "Complete Survey" : "Continue"}
          <ChevronRight size={20} />
        </button>

        <p className="text-xs text-center text-gray-500">
          Your responses help us improve the platform and measure your financial progress
        </p>
      </div>
    </div>
  );
}
