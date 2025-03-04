import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/userSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("left");

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set animation direction based on navigation history
    const from = location.state?.from;
    if (from === "signin") {
      setAnimationDirection("right");
    } else {
      setAnimationDirection("left");
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (e.target.id === "password") {
      setPasswordStrength(calculatePasswordStrength(e.target.value));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return dispatch(signInFailure("Fill out all fields"));
    }

    try {
      dispatch(signInStart());
      const responseSignup = await fetch(
        "http://localhost:3000/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const dataSignup = await responseSignup.json();
      if (dataSignup.success === false) {
        return dispatch(signInFailure(dataSignup.message));
      }

      const responseSignin = await fetch(
        "http://localhost:3000/api/auth/signin",
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
        navigate("/quiz-intro");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Very weak";
      case 1:
        return "Weak";
      case 2:
        return "Moderate";
      case 3:
        return "Strong";
      case 4:
        return "Very strong";
      default:
        return "";
    }
  };

  const navigateToSignIn = () => {
    navigate("/sign-in", { state: { from: "signup" } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>

      <motion.div
        initial={{ opacity: 0, x: animationDirection === "right" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl h-[500px] rounded-xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left side - Sign In CTA */}
        <div className="w-1/2 bg-cover bg-center flex flex-col items-center justify-center text-white p-10 relative"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-2xl font-semibold mb-4 text-white text-center">Already have an account?</h3>
            <p className="text-white/90 text-center mb-8 max-w-xs">
              Sign in to continue your learning journey
            </p>
            <button
              onClick={navigateToSignIn}
              className="mt-auto py-2 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 transform hover:scale-105"
            >
              SIGN IN
            </button>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute top-3 right-3 flex items-center text-sm"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">
                    Password strength:
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength === 0
                      ? "w-0"
                      : passwordStrength === 1
                        ? "w-1/4 bg-red-500"
                        : passwordStrength === 2
                          ? "w-2/4 bg-yellow-500"
                          : passwordStrength === 3
                            ? "w-3/4 bg-blue-500"
                            : "w-full bg-green-500"
                      }`}
                  ></div>
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Signing up..." : "SIGN UP"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}