import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { validateEmail, validatePassword } from "../utils/validate";
import { API_URL } from "../config";
import { User, Mail, Lock, ArrowLeft, CheckCircle } from "lucide-react";

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1. Signup via Backend API (creates auth user + profile)
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Success - Backend handled everything.
      setMsg(
        "Signup successful! Please check your email for confirmation link."
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
        <div className="text-[20rem] font-black text-white transform -rotate-12 tracking-wider">Sign up</div>
      </div>

      {/* Decorative corner borders */}
      <div className="fixed top-8 left-8 w-20 h-20 border-t-4 border-l-4 border-white/30"></div>
      <div className="fixed top-8 right-8 w-20 h-20 border-t-4 border-r-4 border-white/30"></div>
      <div className="fixed bottom-8 left-8 w-20 h-20 border-b-4 border-l-4 border-white/30"></div>
      <div className="fixed bottom-8 right-8 w-20 h-20 border-b-4 border-r-4 border-white/30"></div>

      <div className="w-full max-w-md bg-[#FDFBF7] rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] px-8 py-8 text-center">
          <p className="text-xs tracking-[0.3em] text-[#8B4513] mb-2 font-semibold uppercase">New Member</p>
          <h2 className="text-3xl font-bold text-[#2C1A11] mb-2">Create Your Account</h2>
          <div className="w-16 h-1 bg-[#8B4513] mx-auto"></div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {msg ? (
            <div className="text-center space-y-6">
              <div className="rounded-lg bg-green-50 border border-green-200 p-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">{msg}</p>
              </div>
              <Link
                to="/login"
                className="inline-block px-8 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B3410] transition-colors font-semibold"
              >
                Proceed to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#2C1A11] mb-2 tracking-wider uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[#2C1A11] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#2C1A11] mb-2 tracking-wider uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[#2C1A11] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#2C1A11] mb-2 tracking-wider uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[#2C1A11] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#C19A6B] to-[#D2B48C] text-[#2C1A11] rounded-lg font-bold text-sm tracking-wider uppercase hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Already have an Account?</p>
            <Link
              to="/login"
              className="inline-block text-blue-600 hover:text-blue-700 font-semibold tracking-wide uppercase text-sm"
            >
              Login to Your Account
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[#8B4513] hover:text-[#6B3410] text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
