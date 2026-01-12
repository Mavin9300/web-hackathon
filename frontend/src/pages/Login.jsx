import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validate";
import { Mail, Lock, ArrowLeft, LogIn } from "lucide-react";

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;

      // Clear fields
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background watermark text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
        <div className="text-[20rem] font-black text-white transform -rotate-12 tracking-wider">Login</div>
      </div>

      {/* Decorative corner borders */}
      <div className="fixed top-8 left-8 w-20 h-20 border-t-4 border-l-4 border-white/30"></div>
      <div className="fixed top-8 right-8 w-20 h-20 border-t-4 border-r-4 border-white/30"></div>
      <div className="fixed bottom-8 left-8 w-20 h-20 border-b-4 border-l-4 border-white/30"></div>
      <div className="fixed bottom-8 right-8 w-20 h-20 border-b-4 border-r-4 border-white/30"></div>

      <div className="w-full max-w-md bg-[#FDFBF7] rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] px-8 py-8 text-center">
          <p className="text-xs tracking-[0.3em] text-[#8B4513] mb-2 font-semibold uppercase">Welcome Back</p>
          <h2 className="text-3xl font-bold text-[#2C1A11] mb-2">Login to Your Account</h2>
          <div className="w-16 h-1 bg-[#8B4513] mx-auto"></div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#C19A6B] to-[#D2B48C] text-[#2C1A11] rounded-lg font-bold text-sm tracking-wider uppercase hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-5 h-5" />
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Don't have an Account?</p>
            <Link
              to="/signup"
              className="inline-block text-blue-600 hover:text-blue-700 font-semibold tracking-wide uppercase text-sm"
            >
              Create New Account
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

export default Login;
