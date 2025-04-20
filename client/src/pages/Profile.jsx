import { useState, useEffect } from "react";
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
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaArrowRight,
} from "react-icons/fa";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
  });

  const [updateMode, setUpdateMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        password: "",
        newPassword: "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const toggleUpdateMode = () => {
    setUpdateMode(!updateMode);
    setSuccessMessage("");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updateMode && !formData.name) {
      return dispatch(updateFailure("Name is required"));
    }

    try {
      dispatch(updateStart());

      const updateData = {
        name: formData.name,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const res = await fetch(`http://localhost:3000/api/user/update`, {
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
      setSuccessMessage("Profile updated successfully!");
      setUpdateMode(false);
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
        `http://localhost:3000/api/user/delete/${currentUser._id}`,
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
    <div className="min-h-screen pt-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl text-brand-black mb-6 text-center">
          Your Profile
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-brand-yellow flex items-center justify-center">
            <FaUser className="text-brand-black text-4xl" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xl text-brand-black mb-2">
            {currentUser?.name || ""}
          </h2>
          <p className="text-brand-gray">{currentUser?.email || ""}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-500 mb-1">Name</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder="Name"
                className={`w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-white border ${
                  updateMode ? "border-brand-yellow" : "border-gray-700"
                } focus:outline-none focus:ring-1 focus:ring-brand-yellow`}
                value={formData.name}
                onChange={handleChange}
                disabled={!updateMode}
              />
              <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-white border border-gray-700 focus:outline-none"
                value={formData.email}
                disabled
              />
              <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {updateMode && (
            <>
              <div>
                <label className="block text-gray-500 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Current Password"
                    className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-white border border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="New Password"
                    className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-white border border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={toggleShowNewPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            {updateMode ? (
              <>
                <button
                  type="button"
                  onClick={toggleUpdateMode}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-yellow text-brand-black rounded-full flex items-center hover:bg-brand-yellow/90"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleUpdateMode}
                  className="px-6 py-3 bg-[#8257e6] text-white rounded-full flex items-center hover:bg-[#8257e6]/90"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center hover:bg-red-600"
                >
                  <FaTrash className="mr-2" /> Delete Account
                </button>
              </>
            )}
          </div>
        </form>

        {(!currentUser?.background || !currentUser?.hasFilledBackground) && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/quiz")}
              className="px-6 py-3 bg-brand-yellow text-brand-black rounded-full flex items-center mx-auto hover:bg-brand-yellow/90 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              Complete Quiz <FaArrowRight className="ml-2" />
            </button>
            <p className="mt-2 text-sm text-brand-gray">
              Help us understand your preferences to provide better
              recommendations
            </p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-brand-black mb-4">
              Confirm Account Deletion
            </h2>
            <p className="text-brand-gray mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-brand-gray rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center hover:bg-red-600"
                disabled={loading}
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
