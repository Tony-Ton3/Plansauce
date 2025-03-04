import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaCheck, FaPlus } from "react-icons/fa";
import { backgroundQuestions } from "../constants/backgroundQuestions.jsx";
import { updateUserBackground } from "../utils/api.jsx";
import { updateSuccess } from "../redux/userSlice";

export default function Quiz() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [answers, setAnswers] = useState({
        experience: "",
        known_tech: [],
        time_commitment: 0,
        risk_tolerance: "",
        collaboration: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [customTech, setCustomTech] = useState("");

    const questions = backgroundQuestions;

    const handleOptionSelect = (questionId, optionValue) => {
        const question = questions.find(q => q.id === questionId);

        if (question.type === "multiselect") {
            const currentSelections = answers[questionId] || [];
            if (currentSelections.includes(optionValue)) { //removal
                setAnswers({
                    ...answers,
                    [questionId]: currentSelections.filter(value => value !== optionValue)
                });
            } else { //addition
                setAnswers({
                    ...answers,
                    [questionId]: [...currentSelections, optionValue]
                });
            }
        } else {
            setAnswers({
                ...answers,
                [questionId]: optionValue
            });
        }
    };

    const handleAddCustomTech = (questionId) => {
        if (customTech.trim() === "") return;

        const currentSelections = answers[questionId] || [];
        if (!currentSelections.includes(customTech)) {
            setAnswers({
                ...answers,
                [questionId]: [...currentSelections, customTech]
            });
        }
        setCustomTech("");
    };

    const handleSliderChange = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            console.log("Submitting background answers:", answers);

            // Send the background answers to the server
            const updatedUser = await updateUserBackground(answers);
            console.log("Received updated user:", updatedUser);

            // Update Redux state with the updated user data
            dispatch(updateSuccess(updatedUser));

            // Navigate to project input page after successful submission
            navigate("/projectinput");
        } catch (error) {
            console.error("Error submitting background:", error);
            setError(error.message || "Failed to save your preferences. We'll continue anyway.");
            setIsSubmitting(false);

            // Navigate anyway after a short delay, even if there was an error
            setTimeout(() => {
                navigate("/projectinput");
            }, 2000);
        }
    };

    const handleSkip = () => {
        navigate("/projectinput");
    };

    const isOptionSelected = (questionId, optionValue) => {
        const answer = answers[questionId];
        if (Array.isArray(answer)) {
            return answer.includes(optionValue);
        }
        return answer === optionValue;
    };

    const isAllQuestionsAnswered = () => {
        return questions.every(question => {
            const answer = answers[question.id];

            if (question.type === "multiselect") {
                return Array.isArray(answer) && answer.length > 0;
            }

            return answer !== undefined;
        });
    };

    // Function to render a single question
    const renderQuestion = (questionData) => {
        switch (questionData.type) {
            case "slider":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium text-white mb-4">
                            {questionData.question}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-200 mb-1">
                            {Object.entries(questionData.labels).map(([value, label]) => (
                                <span key={value}>{label}</span>
                            ))}
                        </div>
                        <input
                            type="range"
                            min={questionData.min}
                            max={questionData.max}
                            step={questionData.step}
                            value={answers[questionData.id] || questionData.min}
                            onChange={(e) => handleSliderChange(questionData.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
                        />
                        <div className="text-center text-lg font-medium text-blue-300">
                            {answers[questionData.id] || questionData.min} hours per week
                        </div>
                    </div>
                );
            case "multiselect":
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium text-white mb-4">
                            {questionData.question}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {questionData.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(questionData.id, option)}
                                    className={`px-4 py-2 rounded-md border transition-colors ${isOptionSelected(questionData.id, option)
                                        ? "bg-blue-900 border-blue-400 text-blue-200"
                                        : "border-gray-600 text-gray-300 hover:border-blue-400"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {questionData.allowCustomInput && (
                            <div className="mt-4">
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={customTech}
                                        onChange={(e) => setCustomTech(e.target.value)}
                                        placeholder="Add custom technology..."
                                        className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => handleAddCustomTech(questionData.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                {Array.isArray(answers[questionData.id]) && answers[questionData.id].length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-300 mb-2">Selected technologies:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {answers[questionData.id].map(tech => (
                                                <span
                                                    key={tech}
                                                    className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm flex items-center"
                                                >
                                                    {tech}
                                                    <button
                                                        className="ml-2 text-blue-300 hover:text-blue-100"
                                                        onClick={() => handleOptionSelect(questionData.id, tech)}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium text-white mb-4">
                            {questionData.question}
                        </h3>
                        <div className="space-y-2">
                            {questionData.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(questionData.id, option)}
                                    className={`w-full p-4 text-left rounded-md border transition-colors ${isOptionSelected(questionData.id, option)
                                        ? "bg-blue-900 border-blue-400 text-blue-200"
                                        : "border-gray-600 text-gray-300 hover:border-blue-400"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center relative py-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
            <div className="absolute inset-0 backdrop-blur-md bg-black/70"></div>

            <div className="container mx-auto max-w-3xl relative z-10 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Learning Preferences</h1>
                    <button
                        onClick={handleSkip}
                        className="text-blue-300 hover:underline"
                    >
                        Skip Quiz
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
                        <p>{error}</p>
                        <p className="text-sm mt-1">Don't worry, we'll continue with your answers.</p>
                    </div>
                )}

                <div className="space-y-10">
                    {questions.map((question) => (
                        <div key={question.id} className="py-6 border-b border-gray-600 last:border-0">
                            {renderQuestion(question)}
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!isAllQuestionsAnswered() || isSubmitting}
                        className={`px-8 py-3 rounded-md text-lg font-medium ${!isAllQuestionsAnswered() || isSubmitting
                            ? "bg-blue-500/50 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Preferences"}
                    </button>
                </div>
            </div>
        </div>
    );
}
