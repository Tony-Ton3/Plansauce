import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/userSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        navigate("/projectinput");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="flex justify-center w-full max-w-xl">
        <div className="bg-background p-8 rounded-2xl shadow-md w-3/4">
          <h2 className="font-nerko text-2xl font-bold mb-6 text-center text-gray-800">
            Sign up to StackFlow :)
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="font-nerko text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-nerko text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="font-nerko text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute top-3 right-0 pr-3 flex items-center text-sm"
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
                  <span className="font-nerko text-sm text-gray-500">
                    Password strength:
                  </span>
                  <span className="font-nerko text-sm font-medium text-gray-700">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-gray-500 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength === 0
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
              className={`font-nerko w-full py-2 px-4 bg-secondary hover:bg-accent text-white font-semibold rounded-md transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl shadow-md w-1/8 flex items-center">
        <div className="text-sm text-gray-700">
          <h3 className="font-semibold mb-2">Password Guidelines</h3>
          <p>A strong password should:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Be at least 8 characters long</li>
            <li>Include uppercase and lowercase letters</li>
            <li>Contain numbers</li>
            <li>Have special characters (e.g., !@#$%^&*)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}