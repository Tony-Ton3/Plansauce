import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from "../redux/userSlice";
import {
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Settings() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    password: "",
    newPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // const toggleShowPassword = () => setShowPassword(!showPassword);
  // const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      return dispatch(updateFailure("Name is required"));
    }

    try {
      dispatch(updateStart());

      const updateData = {
        name: formData.name,
      };

      // if (formData.password) {
      //   updateData.password = formData.password;
      // }

      // if (formData.newPassword) {
      //   updateData.newPassword = formData.newPassword;
      // }

      const res = await fetch(`${API_URL}/api/user/update-name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return dispatch(updateFailure(data.message));
      }

      dispatch(updateSuccess(data));
      setSuccessMessage("Settings updated successfully!");
      setFormData({
        ...formData,
        password: "",
        newPassword: "",
      });
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(
        `${API_URL}/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return dispatch(deleteUserFailure(data.message));
      }

      dispatch(deleteUserSuccess());
      navigate("/sign-in");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-light mb-12">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/20 border border-green-500/20 text-green-400 p-3 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-light mb-6">Profile</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-brand-yellow"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* <div>
              <h2 className="text-xl font-light mb-6">Security</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-brand-yellow pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-brand-yellow pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={toggleShowNewPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || currentUser.name === formData.name}
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                  loading || currentUser.name === formData.name
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-yellow text-black hover:bg-brand-yellow/90'
                }`}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-light mb-6">Background</h2>
          <div className="bg-[#2C2C2C] p-6 rounded-lg border border-gray-700">
            {!currentUser?.background ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Complete the quiz to help us understand your technology
                  preferences
                </p>
                <button
                  onClick={() => navigate("/quiz")}
                  className="px-6 py-2 bg-brand-yellow text-black font-medium rounded-lg hover:bg-brand-yellow/90 transition-colors flex items-center"
                >
                  Complete Quiz <FaArrowRight className="ml-2" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentUser?.background?.known_tech && (
                <div>
                  <h3 className="text-white text-sm mb-3">Tools you know</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser?.background?.known_tech?.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                )}
                {currentUser?.background?.starred_tech && (
                <div>
                  <h3 className="text-white text-sm mb-3">Tools you like - will be recommended more</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser?.background?.starred_tech?.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                )}
                {currentUser?.background?.disliked_tech && (
                <div>
                  <h3 className="text-white text-sm mb-3">Tools you dislike</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser?.background?.disliked_tech?.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                )}
                <button
                  onClick={() => navigate("/quiz")}
                  className="rounded-md bg-brand-yellow px-4 py-2 text-brand-black hover:text-white transition-colors text-sm font-medium"
                >
                  Update background
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-light text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-6 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2C] p-6 rounded-xl max-w-md w-full">
            <h2 className="text-2xl font-light text-white mb-4">
              Confirm Account Deletion
            </h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
