import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/userSlice";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("right");

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set animation direction based on navigation history
    const from = location.state?.from;
    if (from === "signup") {
      setAnimationDirection("left");
    } else {
      setAnimationDirection("right");
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure("Please fill all the fields"));
    }

    try {
      dispatch(signInStart());
      const responseSignin = await fetch(
        `${API_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const dataSignin = await responseSignin.json();
      if (dataSignin.success === false) {
        dispatch(signInFailure(dataSignin.message));
      }

      if (responseSignin.ok) {
        dispatch(signInSuccess(dataSignin));
        navigate("/projectinput");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const navigateToSignUp = () => {
    navigate("/sign-up", { state: { from: "signin" } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://t3.ftcdn.net/jpg/05/89/17/46/360_F_589174607_FhKaLYCvij9WOjlECojcmypeIfwRU3OZ.jpg')" }}>
      {/* Blur overlay with gradient */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-br from-blue-900/30 via-black/20 to-brand-pink/10"></div>

      <motion.div
        initial={{ opacity: 0, x: animationDirection === "right" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl h-[750px] rounded-xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left side - Sign In Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-brand-black mb-2">
              Welcome
            </h2>
            {/* <p className="text-brand-gray">Sign in to continue your learning journey</p> */}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-brand-black"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition duration-200"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-brand-black"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-gray hover:text-brand-black transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-lg" />
                  ) : (
                    <FaEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-gray">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-brand-yellow hover:text-brand-yellow/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            {errorMessage && (
              <div className="bg-brand-pink/10 border border-brand-pink/30 rounded-lg p-3 text-brand-pink text-sm">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black font-medium rounded-lg transition duration-200 flex items-center justify-center ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-brand-yellow/20"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right side - Sign Up CTA */}
        <div className="w-1/2 bg-cover bg-center flex flex-col items-center justify-center text-white p-10 relative"
          style={{ backgroundImage: "url('https://t3.ftcdn.net/jpg/05/89/17/46/360_F_589174607_FhKaLYCvij9WOjlECojcmypeIfwRU3OZ.jpg')" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-black/70 to-black/80 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-3xl font-bold mb-4 text-white text-center">New to Plansauce?</h3>
            <p className="text-white/90 text-center mb-8 max-w-xs text-md">
              Create an account and start your personalized project planning journey today
            </p>
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={navigateToSignUp}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 transform hover:scale-105"
              >
                Create Account
              </button>
              <p className="text-white/70 text-center text-xs">
                Plansauce is your AI-powered project planning platform
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}