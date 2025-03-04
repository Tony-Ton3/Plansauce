import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/userSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

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
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>

      <motion.div
        initial={{ opacity: 0, x: animationDirection === "right" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl h-[500px] rounded-xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left side - Sign In Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-500" />
                  ) : (
                    <FaEye className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>
        </div>

        {/* Right side - Sign Up CTA */}
        <div className="w-1/2 bg-cover bg-center flex flex-col items-center justify-center text-white p-10 relative"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-2xl font-semibold mb-4 text-white text-center">New Here?</h3>
            <p className="text-white/90 text-center mb-8 max-w-xs">
              Sign up and discover a great amount of learning resources
            </p>
            <button
              onClick={navigateToSignUp}
              className="mt-auto py-2 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 transform hover:scale-105"
            >
              SIGN UP
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}