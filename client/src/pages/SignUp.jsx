import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/userSlice";
import { FaEye, FaEyeSlash, FaArrowRight, FaCheck } from "react-icons/fa";
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

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-brand-yellow";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const navigateToSignIn = () => {
    navigate("/sign-in", { state: { from: "signup" } });
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
        {/* Left side - Sign In CTA */}
        <div className="w-1/2 bg-cover bg-center flex flex-col items-center justify-center text-white p-10 relative"
          style={{ backgroundImage: "url('https://t3.ftcdn.net/jpg/05/89/17/46/360_F_589174607_FhKaLYCvij9WOjlECojcmypeIfwRU3OZ.jpg')" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-black/70 to-black/80 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <h3 className="text-3xl font-bold mb-4 text-white text-center">Already have an account?</h3>
            <p className="text-white/90 text-center mb-8 max-w-xs text-lg">
              Sign in to continue your learning journey
            </p>
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={navigateToSignIn}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 transform hover:scale-105"
              >
                Sign In
              </button>
              <p className="text-white/70 text-center text-sm">
                Join thousands of learners already on LearnStack
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-brand-black mb-2">
              Create Your Account
            </h2>
            <p className="text-brand-gray">Start your personalized learning journey today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-brand-black"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition duration-200"
                placeholder="Enter your full name"
              />
            </div>
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
                  placeholder="Create a strong password"
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
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-gray">
                      Password strength:
                    </span>
                    <span className="text-sm font-medium text-brand-black">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Password requirements */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${formData.password.length >= 8 ? 'text-green-500' : 'text-brand-gray'}`}>
                        {formData.password.length >= 8 ? <FaCheck size={12} /> : '○'}
                      </span>
                      <span className={formData.password.length >= 8 ? 'text-brand-black' : 'text-brand-gray'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${formData.password.match(/[A-Z]/) && formData.password.match(/[a-z]/) ? 'text-green-500' : 'text-brand-gray'}`}>
                        {formData.password.match(/[A-Z]/) && formData.password.match(/[a-z]/) ? <FaCheck size={12} /> : '○'}
                      </span>
                      <span className={formData.password.match(/[A-Z]/) && formData.password.match(/[a-z]/) ? 'text-brand-black' : 'text-brand-gray'}>
                        Mix of uppercase and lowercase
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${formData.password.match(/[0-9]/) ? 'text-green-500' : 'text-brand-gray'}`}>
                        {formData.password.match(/[0-9]/) ? <FaCheck size={12} /> : '○'}
                      </span>
                      <span className={formData.password.match(/[0-9]/) ? 'text-brand-black' : 'text-brand-gray'}>
                        At least one number
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${formData.password.match(/[^A-Za-z0-9]/) ? 'text-green-500' : 'text-brand-gray'}`}>
                        {formData.password.match(/[^A-Za-z0-9]/) ? <FaCheck size={12} /> : '○'}
                      </span>
                      <span className={formData.password.match(/[^A-Za-z0-9]/) ? 'text-brand-black' : 'text-brand-gray'}>
                        At least one special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-brand-gray">
                I agree to the <Link to="/terms" className="text-brand-yellow hover:text-brand-yellow/80 font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-brand-yellow hover:text-brand-yellow/80 font-medium">Privacy Policy</Link>
              </label>
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Create Account <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
      `}</style>
    </div>
  );
}