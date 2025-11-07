"use client";
import React, { useState } from "react";
import { User } from "lucide-react";

export default function KYC({ onComplete, saveData }) {
  const [step, setStep] = useState(1);
  const [kycData, setKycData] = useState({
    bvn: "",
    dob: "",
    street: "",
    city: "",
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save verification data and continue
      if (saveData) saveData({ hK: true, kyc: kycData });
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* --- Progress bar --- */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 mx-1 rounded ${
                s <= step ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm">Step {step}/3</p>
      </div>

      {/* --- Step 1 --- */}
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Verify Identity</h2>
          <input
            type="text"
            placeholder="BVN"
            className="w-full p-4 border rounded-xl mb-4"
            value={kycData.bvn}
            onChange={(e) => setKycData({ ...kycData, bvn: e.target.value })}
          />
          <input
            type="date"
            className="w-full p-4 border rounded-xl mb-6"
            value={kycData.dob}
            onChange={(e) => setKycData({ ...kycData, dob: e.target.value })}
          />
        </>
      )}

      {/* --- Step 2 --- */}
      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Address</h2>
          <input
            type="text"
            placeholder="Street"
            className="w-full p-4 border rounded-xl mb-4"
            value={kycData.street}
            onChange={(e) => setKycData({ ...kycData, street: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            className="w-full p-4 border rounded-xl mb-4"
            value={kycData.city}
            onChange={(e) => setKycData({ ...kycData, city: e.target.value })}
          />
        </>
      )}

      {/* --- Step 3 --- */}
      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold mb-2">Almost Done!</h2>
          <div className="border-2 border-dashed rounded-lg p-12 text-center mb-6 bg-white">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Take a selfie (optional for test)</p>
          </div>
        </>
      )}

      {/* --- Next button --- */}
      <button
        onClick={handleNext}
        className="w-full py-4 rounded-full font-semibold text-white"
        style={{ backgroundColor: "#2D9B7B" }}
      >
        {step === 3 ? "Complete" : "Continue"}
      </button>
    </div>
  );
}
