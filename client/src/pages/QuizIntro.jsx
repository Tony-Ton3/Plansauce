import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function QuizIntro() {
    const navigate = useNavigate();

    const handleTakeQuiz = () => {
        navigate("/quiz");
    };

    const handleSkipQuiz = () => {
        navigate("/projectinput");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}>
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/30"></div>

            <div className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl relative z-10">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                            Welcome to LearnStack!
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Help us personalize your learning experience
                        </p>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Take our quick 2-minute quiz
                        </h3>
                        <p className="text-gray-600">
                            Answer a few questions about your experience and goals to get the most out of LearnStack.
                            This will help us provide personalized tech stack recommendations tailored to your skills.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <button
                            onClick={handleTakeQuiz}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center"
                        >
                            Take the Quiz <FaArrowRight className="ml-2" />
                        </button>
                        <button
                            onClick={handleSkipQuiz}
                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition duration-200"
                        >
                            Skip for Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 