// "use client";
// import React, { useState } from "react";
// import { Wallet } from "lucide-react";

// export default function Welcome({ onSignup, onLogin }) {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "user",   // ALWAYS user
//   });
//   const [isLogin, setIsLogin] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if (isLogin) {
//         const res = await onLogin(form.email, form.password);
//         if (res.success) return;
//       } else {
//         const res = await onSignup(
//           form.email,
//           form.password,
//           form.name,
//           form.phone,
//           "user"  // FORCE ROLE HERE
//         );
//         if (res.success) return;
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
//       style={{ backgroundColor: "#F7FAFC" }}
//     >
//       <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md">
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-700">
//             <Wallet size={32} className="text-white" />
//           </div>
//           <h2 className="text-xl font-bold">
//             {isLogin ? "Welcome Back" : "Create Account"}
//           </h2>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           {!isLogin && (
//             <input
//               name="name"
//               placeholder="Full Name"
//               className="w-full p-3 border rounded-lg"
//               value={form.name}
//               onChange={handleChange}
//             />
//           )}

//           <input
//             name="email"
//             placeholder="Email"
//             type="email"
//             className="w-full p-3 border rounded-lg"
//             value={form.email}
//             onChange={handleChange}
//           />

//           {!isLogin && (
//             <input
//               name="phone"
//               placeholder="Phone"
//               className="w-full p-3 border rounded-lg"
//               value={form.phone}
//               onChange={handleChange}
//             />
//           )}

//           <input
//             name="password"
//             placeholder="Password"
//             type="password"
//             className="w-full p-3 border rounded-lg"
//             value={form.password}
//             onChange={handleChange}
//           />

//           {/* HIDDEN ROLE */}
//           <input type="hidden" name="role" value="user" />

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 mt-2 rounded-full font-semibold text-white bg-green-700"
//           >
//             {loading
//               ? "Processing..."
//               : isLogin
//               ? "Log In"
//               : "Create Account"}
//           </button>
//         </form>

//         <button
//           type="button"
//           onClick={() => setIsLogin(!isLogin)}
//           className="w-full mt-3 text-sm text-center text-gray-600"
//         >
//           {isLogin
//             ? "Don’t have an account? Sign up"
//             : "Have an account? Log in"}
//         </button>
//       </div>
//     </div>
//   );
// }

// FIXED Welcome.js with Complete Error Handling
"use client";
import React, { useState } from "react";
import { Wallet, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Welcome({ onSignup, onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-submit

  const colors = {
    primary: "#2D9B7B",
    primaryDark: "#1F6B56",
    background: "#F7FAFC",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // 🔒 ENHANCED VALIDATION
  const validateForm = () => {
    // Name validation - no signup
    if (!isLogin) {
      const trimmedName = form.name.trim();
      if (!trimmedName) {
        setError("Please enter your full name");
        return false;
      }
      if (trimmedName.length < 2) {
        setError("Name must be at least 2 characters");
        return false;
      }
      if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
        setError("Name can only contain letters, spaces, hyphens and apostrophes");
        return false;
      }
    }

    // Email validation
    const trimmedEmail = form.email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Phone validation - no signup
    if (!isLogin) {
      const trimmedPhone = form.phone.trim();
      if (!trimmedPhone) {
        setError("Please enter your phone number");
        return false;
      }
      // Remove all non-digits
      const digitsOnly = trimmedPhone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        setError("Please enter a valid phone number (10-15 digits)");
        return false;
      }
    }

    // Password validation
    if (!form.password) {
      setError("Please enter your password");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!isLogin && form.password.length < 8) {
      setError("For new accounts, password must be at least 8 characters");
      return false;
    }

    return true;
  };

  // 🔒 HANDLE FIREBASE AUTH ERRORS
  const getFirebaseErrorMessage = (error) => {
    const errorCode = error.code || error.message;
    
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in instead.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 8 characters.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/operation-not-allowed":
        return "This operation is not allowed. Please contact support.";
      default:
        return error.message || "An error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔒 PREVENT DOUBLE SUBMISSION
    if (isSubmitting) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    try {
      // 🔒 SANITIZE INPUTS
      const sanitizedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password, // Don't trim password
        role: "user",
      };

      // 🔒 TIMEOUT PROTECTION (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout. Please try again.")), 30000)
      );

      if (isLogin) {
        const res = await Promise.race([
          onLogin(sanitizedForm.email, sanitizedForm.password),
          timeoutPromise
        ]);
        
        if (!res || !res.success) {
          setError("Login failed. Please check your credentials.");
        }
      } else {
        const res = await Promise.race([
          onSignup(
            sanitizedForm.email,
            sanitizedForm.password,
            sanitizedForm.name,
            sanitizedForm.phone,
            "user"
          ),
          timeoutPromise
        ]);
        
        if (!res || !res.success) {
          setError("Signup failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      // Re-enable submission after 1 second to prevent rapid clicking
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-lg">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Wallet size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Join Ajoti"}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin
              ? "Sign in to continue your financial journey"
              : "Start your financial research experience"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                name="name"
                placeholder="John Doe"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
                value={form.name}
                onChange={handleChange}
                required={!isLogin}
                maxLength={50}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              name="email"
              placeholder="you@example.com"
              type="email"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                name="phone"
                placeholder="+234 XXX XXX XXXX"
                type="tel"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
                value={form.phone}
                onChange={handleChange}
                required={!isLogin}
                autoComplete="tel"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                name="password"
                placeholder={isLogin ? "Enter password" : "Min 8 characters"}
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="w-full py-4 mt-2 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "user",
              });
            }}
            disabled={loading}
            className="text-sm font-medium hover:underline disabled:opacity-50"
            style={{ color: colors.primary }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {!isLogin && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-xs text-yellow-800 text-center">
              <span className="font-semibold">Research Platform</span> 
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our research terms
        </p>
      </div>
    </div>
  );
}
