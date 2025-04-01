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
        const availableSuggestions = techQuestion.suggestions.filter(
            tech => !techQuestion.options.includes(tech) && !selectedTechs.includes(tech)
        );

        const filtered = availableSuggestions.filter(
            tech => tech.toLowerCase().includes(customTech.toLowerCase())
        ).slice(0, 5);

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    }, [customTech, background.known_tech, quizEditMode]);

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
                    time_commitment: currentUser.background.time_commitment || 2,
                    risk_tolerance: currentUser.background.risk_tolerance || "",
                    collaboration: currentUser.background.collaboration || ""
                });
            } else {
                setBackground({
                    experience: "",
                    known_tech: [],
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

    const renderProfileTab = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <div className="relative">
                    <input
                        type="text"
                        id="name"
                        placeholder="Name"
                        className={`w-full px-4 py-2 rounded-lg bg-[#252b38] text-white border ${updateMode ? 'border-[#8e5fe7]' : 'border-gray-700'}`}
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!updateMode}
                    />
                    <FaUser className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 rounded-lg bg-[#252b38] text-white border border-gray-700"
                        value={formData.email}
                        disabled
                    />
                    <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            {updateMode && (
                <>
                    <div>
                        <label className="block text-gray-300 mb-1">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Current Password"
                                className="w-full px-4 py-2 rounded-lg bg-[#252b38] text-white border border-[#8e5fe7]"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                placeholder="New Password"
                                className="w-full px-4 py-2 rounded-lg bg-[#252b38] text-white border border-[#8e5fe7]"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={toggleShowNewPassword}
                                className="absolute right-3 top-3 text-gray-400"
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
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#8e5fe7] text-white rounded-lg flex items-center"
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
                            className="px-4 py-2 bg-[#8e5fe7] text-white rounded-lg flex items-center"
                        >
                            <FaEdit className="mr-2" /> Edit Profile
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
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
                {backgroundQuestions.map((question) => {
                    console.log(`Checking question ${question.id}, answer:`, background[question.id]);
                    const isMultiSelect = question.type === "multiselect";
                    const isSlider = question.type === "slider";
                    const answer = background[question.id];
                    const hasAnswer = isMultiSelect
                        ? Array.isArray(answer) && answer.length > 0
                        : answer !== undefined && answer !== null && answer !== "";

                    if (quizEditMode && question.id === "known_tech") {
                        return (
                            <div key={question.id} className="bg-[#252b38] p-4 rounded-lg">
                                <h3 className="text-white font-medium mb-3">{question.question}</h3>
                                
                                <div className="relative mb-6" ref={searchInputRef}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={customTech}
                                        onChange={(e) => setCustomTech(e.target.value)}
                                        onKeyDown={(e) => handleCustomTechKeyDown(e, question.id)}
                                        placeholder="Search all skills..."
                                        className="w-full pl-10 pr-16 py-3 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#8e5fe7]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddCustomTech(question.id)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-[#8e5fe7] text-white rounded-md hover:bg-[#7d4fd6] focus:outline-none focus:ring-2 focus:ring-[#8e5fe7] flex items-center"
                                    >
                                        <FaPlus className="mr-2" /> Add
                                    </button>
                                    
                                    {showSuggestions && (
                                        <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                                            <ul className="py-1 max-h-60 overflow-auto">
                                                {filteredSuggestions.map((suggestion) => (
                                                    <li 
                                                        key={suggestion}
                                                        className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200"
                                                        onClick={() => handleSuggestionClick(question.id, suggestion)}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    {question.options.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleOptionSelect(question.id, option)}
                                            className={`px-4 py-2 rounded-full transition-colors ${
                                                isOptionSelected(question.id, option)
                                                    ? "bg-[#8e5fe7] text-white"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                {Array.isArray(answer) && answer.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-400 mb-2">Your selected technologies:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {answer.map(tech => (
                                                <span
                                                    key={tech}
                                                    className="px-3 py-1 bg-[#1a1f29] text-gray-200 rounded-full text-sm flex items-center"
                                                >
                                                    {tech}
                                                    <button
                                                        type="button"
                                                        className="ml-2 text-gray-400 hover:text-white"
                                                        onClick={() => handleOptionSelect(question.id, tech)}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={question.id} className="bg-[#252b38] p-4 rounded-lg">
                            <h3 className="text-white font-medium mb-3">{question.question}</h3>

                            {quizEditMode ? (
                                <div className="space-y-2">
                                    {isSlider ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                {Object.entries(question.labels).map(([value, label]) => (
                                                    <span key={value}>{label}</span>
                                                ))}
                                            </div>
                                            <input
                                                type="range"
                                                min={question.min}
                                                max={question.max}
                                                step={question.step}
                                                value={background[question.id] || question.min}
                                                onChange={(e) => handleSliderChange(question.id, e.target.value)}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8e5fe7]"
                                            />
                                            <div className="text-center text-lg font-medium text-[#8e5fe7]">
                                                {background[question.id] || question.min} hours per week
                                            </div>
                                        </div>
                                    ) : (
                                        question.options.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleOptionSelect(question.id, option)}
                                                className={`w-full p-3 text-left rounded-lg border transition duration-200 flex items-center justify-between ${isOptionSelected(question.id, option)
                                                    ? "border-[#8e5fe7] bg-[#1a1f29]"
                                                    : "border-gray-700 hover:border-[#8e5fe7]"
                                                    }`}
                                            >
                                                <span className="text-white">{option}</span>
                                                {isOptionSelected(question.id, option) ? (
                                                    <FaCheck className="text-[#8e5fe7]" />
                                                ) : (
                                                    isMultiSelect && <FaPlus className="text-gray-400" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-300">
                                    {hasAnswer ? (
                                        isMultiSelect ? (
                                            <div className="flex flex-wrap gap-2">
                                                {answer.map(value => (
                                                    <span key={value} className="bg-[#1a1f29] px-3 py-1 rounded-full text-sm">
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : isSlider ? (
                                            <span className="bg-[#1a1f29] px-3 py-1 rounded-full text-sm inline-block">
                                                {answer} hours per week
                                            </span>
                                        ) : (
                                            <span className="bg-[#1a1f29] px-3 py-1 rounded-full text-sm inline-block">
                                                {answer}
                                            </span>
                                        )
                                    ) : (
                                        <span className="bg-[#1a1f29] px-3 py-1 rounded-full text-sm inline-block">
                                            Not specified
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-between pt-4">
                    {quizEditMode ? (
                        <>
                            <button
                                type="button"
                                onClick={toggleQuizEditMode}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#8e5fe7] text-white rounded-lg flex items-center"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Save Preferences"}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={toggleQuizEditMode}
                            className="px-4 py-2 bg-[#8e5fe7] text-white rounded-lg flex items-center"
                        >
                            <FaEdit className="mr-2" /> Edit Preferences
                        </button>
                    )}
                </div>
            </form>
        );
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-[#0f1218]">
            <div className="max-w-2xl mx-auto bg-[#1a1f29] p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl text-white mb-6 text-center">Your Profile</h1>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
                        {successMessage}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-[#8e5fe7] flex items-center justify-center">
                        <FaUser className="text-white text-4xl" />
                    </div>
                </div>

                <div className="mb-6 text-center">
                    <h2 className="text-xl text-white mb-2">{currentUser?.name || ""}</h2>
                    <p className="text-gray-400">{currentUser?.email || ""}</p>
                </div>

                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'text-[#8e5fe7] border-b-2 border-[#8e5fe7]' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Learning Preferences
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-[#8e5fe7] border-b-2 border-[#8e5fe7]' : 'text-gray-400 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Account
                    </button>

                </div>

                {activeTab === 'profile' ? renderProfileTab() : renderPreferencesTab()}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1f29] p-6 rounded-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Confirm Account Deletion</h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
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