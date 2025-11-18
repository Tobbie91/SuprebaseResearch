"use client";
import React, { useState } from "react";
import { Wallet } from "lucide-react";

export default function Welcome({ onSignup, onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",   // ALWAYS user
  });
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await onLogin(form.email, form.password);
        if (res.success) return;
      } else {
        const res = await onSignup(
          form.email,
          form.password,
          form.name,
          form.phone,
          "user"  // FORCE ROLE HERE
        );
        if (res.success) return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
      style={{ backgroundColor: "#F7FAFC" }}
    >
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-700">
            <Wallet size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg"
              value={form.name}
              onChange={handleChange}
            />
          )}

          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full p-3 border rounded-lg"
            value={form.email}
            onChange={handleChange}
          />

          {!isLogin && (
            <input
              name="phone"
              placeholder="Phone"
              className="w-full p-3 border rounded-lg"
              value={form.phone}
              onChange={handleChange}
            />
          )}

          <input
            name="password"
            placeholder="Password"
            type="password"
            className="w-full p-3 border rounded-lg"
            value={form.password}
            onChange={handleChange}
          />

          {/* HIDDEN ROLE */}
          <input type="hidden" name="role" value="user" />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-full font-semibold text-white bg-green-700"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Log In"
              : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-3 text-sm text-center text-gray-600"
        >
          {isLogin
            ? "Don’t have an account? Sign up"
            : "Have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
