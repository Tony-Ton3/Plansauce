import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { quizQuestions } from "../constants/quizQuestions.jsx";
import { updateUserQuizAnswers } from "../utils/api.jsx";
import { updateSuccess } from "../redux/userSlice";

export default function Quiz() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const questions = quizQuestions;

    const handleOptionSelect = (questionId, optionValue) => {
        const question = questions[currentQuestion];

        if (question.multiSelect) {
            const currentSelections = answers[questionId] || [];
            if (currentSelections.includes(optionValue)) {
                setAnswers({
                    ...answers,
                    [questionId]: currentSelections.filter(value => value !== optionValue)
                });
            } else {
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

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            console.log("Submitting quiz answers:", answers);

            // Send the quiz answers to the server
            const updatedUser = await updateUserQuizAnswers(answers);
            console.log("Received updated user:", updatedUser);

            // Update Redux state with the updated user data
            dispatch(updateSuccess(updatedUser));

            // Navigate to project input page after successful submission
            navigate("/projectinput");
        } catch (error) {
            console.error("Error submitting quiz:", error);
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

    const currentQuestionData = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const isOptionSelected = (questionId, optionValue) => {
        const answer = answers[questionId];
        if (Array.isArray(answer)) {
            return answer.includes(optionValue);
        }
        return answer === optionValue;
    };

    const isCurrentQuestionAnswered = () => {
        const questionId = currentQuestionData.id;
        const answer = answers[questionId];

        if (currentQuestionData.multiSelect) {
            return Array.isArray(answer) && answer.length > 0;
        }

        return answer !== undefined;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
            <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl relative z-10"
            >
                <div className="p-8">
                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Question {currentQuestion + 1} of {questions.length}</span>
                            <button
                                onClick={handleSkip}
                                className="text-blue-600 hover:underline"
                            >
                                Skip Quiz
                            </button>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <p>{error}</p>
                            <p className="text-sm mt-1">Don't worry, we'll continue with your answers.</p>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                            {currentQuestionData.question}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestionData.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionSelect(currentQuestionData.id, option.value)}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition duration-200 flex items-center justify-between ${isOptionSelected(currentQuestionData.id, option.value)
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-300 hover:border-blue-400"
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    {isOptionSelected(currentQuestionData.id, option.value) && (
                                        <FaCheck className="text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className={`px-6 py-2 rounded-md flex items-center ${currentQuestion === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            <FaArrowLeft className="mr-2" /> Previous
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!isCurrentQuestionAnswered() || isSubmitting}
                            className={`px-6 py-2 rounded-md flex items-center ${!isCurrentQuestionAnswered() || isSubmitting
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {isLastQuestion ? (
                                isSubmitting ? "Submitting..." : "Submit"
                            ) : (
                                <>Next <FaArrowRight className="ml-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 