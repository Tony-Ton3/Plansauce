import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from "../redux/userSlice";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaEdit, FaTrash, FaCheck, FaPlus, FaSearch } from "react-icons/fa";
import { backgroundQuestions } from "../constants/backgroundQuestions.jsx";
import { updateUserBackground } from "../utils/api.jsx";

export default function Profile() {
    const { currentUser, loading, error } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        newPassword: "",
    });

    const [background, setBackground] = useState({
        experience: "",
        known_tech: [],
        disliked_tech: [],
        time_commitment: 2,
        risk_tolerance: "",
        collaboration: ""
    });

    const [updateMode, setUpdateMode] = useState(false);
    const [quizEditMode, setQuizEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState("preferences"); // "profile" or "preferences"
    const [customTech, setCustomTech] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeField, setActiveField] = useState("known_tech"); // "known_tech" or "disliked_tech"
    const searchInputRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!quizEditMode || customTech.trim() === "") {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const techQuestion = backgroundQuestions.find(q => q.id === "known_tech");
        if (!techQuestion || !techQuestion.suggestions) return;

        const selectedTechs = background.known_tech || [];
        const dislikedTechs = background.disliked_tech || [];
        const unavailableTechs = [...selectedTechs, ...dislikedTechs];
        const availableSuggestions = techQuestion.suggestions.filter(
            tech => !techQuestion.options.includes(tech) && !unavailableTechs.includes(tech)
        );

        const filtered = availableSuggestions.filter(
            tech => tech.toLowerCase().includes(customTech.toLowerCase())
        ).slice(0, 5);

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [customTech, background.known_tech, background.disliked_tech, quizEditMode]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || "",
                email: currentUser.email || "",
                password: "",
                newPassword: "",
            });

            if (currentUser.background) {
                console.log("Background data from user:", currentUser.background);
                setBackground({
                    experience: currentUser.background.experience || "",
                    known_tech: currentUser.background.known_tech || [],
                    disliked_tech: currentUser.background.disliked_tech || [],
                    time_commitment: currentUser.background.time_commitment || 2,
                    risk_tolerance: currentUser.background.risk_tolerance || "",
                    collaboration: currentUser.background.collaboration || ""
                });
            } else {
                setBackground({
                    experience: "",
                    known_tech: [],
                    disliked_tech: [],
                    time_commitment: 2,
                    risk_tolerance: "",
                    collaboration: ""
                });
            }
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const toggleUpdateMode = () => {
        setUpdateMode(!updateMode);
        setSuccessMessage("");
    };

    const toggleQuizEditMode = () => {
        setQuizEditMode(!quizEditMode);
        setSuccessMessage("");
        setCustomTech("");
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

    const handleQuizSubmit = async (e) => {
        e.preventDefault();

        try {
            dispatch(updateStart());

            const updatedUser = await updateUserBackground(background);

            dispatch(updateSuccess(updatedUser));
            setSuccessMessage("Preferences updated successfully!");
            setQuizEditMode(false);
        } catch (error) {
            dispatch(updateFailure(error.message || "An unexpected error occurred"));
        }
    };

    const handleDeleteAccount = async () => {
        try {
            dispatch(deleteUserStart());

            const res = await fetch(`http://localhost:3000/api/user/delete/${currentUser._id}`, {
                method: "DELETE",
                credentials: "include",
            });

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

    const handleOptionSelect = (questionId, optionValue) => {
        const question = backgroundQuestions.find(q => q.id === questionId);

        if (question.type === "multiselect") {
            const currentSelections = background[questionId] || [];
            if (currentSelections.includes(optionValue)) {
                setBackground({
                    ...background,
                    [questionId]: currentSelections.filter(value => value !== optionValue)
                });
            } else {
                setBackground({
                    ...background,
                    [questionId]: [...currentSelections, optionValue]
                });
            }
        } else if (question.type === "slider") {
            setBackground({
                ...background,
                [questionId]: parseInt(optionValue)
            });
        } else {
            setBackground({
                ...background,
                [questionId]: optionValue
            });
        }
    };

    const handleAddCustomTech = (questionId, tech = null) => {
        const techToAdd = tech || customTech.trim();
        if (techToAdd === "") return;

        const currentSelections = background[questionId] || [];
        if (!currentSelections.includes(techToAdd)) {
            setBackground({
                ...background,
                [questionId]: [...currentSelections, techToAdd]
            });
        }
        setCustomTech("");
        setShowSuggestions(false);
    };

    const handleCustomTechKeyDown = (e, questionId) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomTech(questionId);
        }
    };

    const handleSliderChange = (questionId, value) => {
        setBackground({
            ...background,
            [questionId]: parseInt(value)
        });
    };

    const isOptionSelected = (questionId, optionValue) => {
        const answer = background[questionId];
        console.log(`Checking if ${optionValue} is selected for ${questionId}, answer:`, answer);

        if (Array.isArray(answer)) {
            return answer.includes(optionValue);
        }

        return answer === optionValue;
    };

    const handleSuggestionClick = (questionId, suggestion) => {
        handleAddCustomTech(questionId, suggestion);
    };

    const toggleActiveField = () => {
        setActiveField(activeField === "known_tech" ? "disliked_tech" : "known_tech");
        setCustomTech("");
        setShowSuggestions(false);
    };

    const renderProfileTab = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-500 mb-1">Name</label>
                <div className="relative">
                    <input
                        type="text"
                        id="name"
                        placeholder="Name"
                        className={`w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-white border ${updateMode ? 'border-brand-yellow' : 'border-gray-700'} focus:outline-none focus:ring-1 focus:ring-brand-yellow`}
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
                        <label className="block text-gray-500 mb-1">Current Password</label>
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
    );

    const renderPreferencesTab = () => {
        console.log("Current background data:", background);
        console.log("Background questions:", backgroundQuestions);

        return (
            <form onSubmit={handleQuizSubmit} className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="mb-4">
                        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => activeField !== "known_tech" && toggleActiveField()}
                                className={`px-5 py-2 text-sm ${
                                    activeField === "known_tech"
                                        ? "bg-brand-yellow text-brand-black font-medium"
                                        : "bg-white text-brand-gray"
                                }`}
                            >
                                Skills I enjoy
                            </button>
                            <button
                                type="button"
                                onClick={() => activeField !== "disliked_tech" && toggleActiveField()}
                                className={`px-5 py-2 text-sm border-l ${
                                    activeField === "disliked_tech"
                                        ? "bg-brand-pink text-white font-medium"
                                        : "bg-white text-brand-gray"
                                }`}
                            >
                                Skills to avoid
                            </button>
                        </div>
                    </div>

                    {quizEditMode && (
                        <div className="mb-4">
                            <div className="relative" ref={searchInputRef}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={customTech}
                                    onChange={(e) => setCustomTech(e.target.value)}
                                    onKeyDown={(e) => handleCustomTechKeyDown(e, activeField)}
                                    onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    placeholder="Search or add new skills..."
                                    className="w-full pl-10 pr-16 py-3 bg-white border border-gray-200 text-brand-black rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddCustomTech(activeField)}
                                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 text-white rounded-md flex items-center ${
                                        activeField === "known_tech" 
                                            ? "bg-brand-yellow hover:bg-brand-yellow/90" 
                                            : "bg-brand-pink hover:bg-brand-pink/90"
                                    }`}
                                >
                                    <FaPlus className="mr-2" /> Add
                                </button>
                                
                                {showSuggestions && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                                        <ul className="py-1 max-h-60 overflow-auto">
                                            {filteredSuggestions.map((suggestion) => (
                                                <li 
                                                    key={suggestion}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-brand-black"
                                                    onClick={() => handleSuggestionClick(activeField, suggestion)}
                                                >
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {/* Only show selected technologies */}
                        {background[activeField].map((tech) => (
                            <button
                                key={tech}
                                type="button"
                                onClick={() => quizEditMode && handleOptionSelect(activeField, tech)}
                                className={`px-4 py-2 rounded-full text-base transition-all hover:scale-105 ${
                                    activeField === "known_tech"
                                        ? "bg-brand-yellow text-brand-black"
                                        : "bg-white text-brand-gray border border-gray-200"
                                } ${!quizEditMode && "cursor-default hover:scale-100"}`}
                                disabled={!quizEditMode}
                            >
                                {tech}
                                {quizEditMode && <FaCheck className="ml-1 inline-block" size={10} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    {quizEditMode ? (
                        <>
                            <button
                                type="button"
                                onClick={toggleQuizEditMode}
                                className="px-4 py-2 bg-white border border-gray-200 text-brand-gray rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-brand-yellow text-brand-black rounded-lg flex items-center hover:bg-brand-yellow/90"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Save Preferences"}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleQuizEditMode}
                            className="px-4 py-2 bg-brand-yellow text-brand-black rounded-lg flex items-center hover:bg-brand-yellow/90"
                        >
                            <FaEdit className="mr-2" /> Edit Preferences
                        </button>
                    )}
                </div>
            </form>
        );
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-white">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-3xl text-brand-black mb-6 text-center">Your Profile</h1>

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
                    <h2 className="text-xl text-brand-black mb-2">{currentUser?.name || ""}</h2>
                    <p className="text-brand-gray">{currentUser?.email || ""}</p>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'text-brand-yellow border-b-2 border-brand-yellow' : 'text-brand-gray hover:text-brand-black'}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Preferences
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-brand-yellow border-b-2 border-brand-yellow' : 'text-brand-gray hover:text-brand-black'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Account
                    </button>
                </div>

                {activeTab === 'profile' ? renderProfileTab() : renderPreferencesTab()}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold text-brand-black mb-4">Confirm Account Deletion</h2>
                        <p className="text-brand-gray mb-6">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
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