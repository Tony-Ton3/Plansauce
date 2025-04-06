import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaTasks,
  FaRobot,
  FaCode,
  FaLightbulb,
} from "react-icons/fa";

export default function QuizIntro() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/quiz");
    }
  };

  const steps = [
    {
      title: "LearnStack can help you...",
      headline: "transform your ideas into actionable tasks.",
      icon: <FaLightbulb className="text-lg" />,
      description:
        "Share your project idea, and we'll break it down into manageable steps to bring your vision to life.",
    },
    {
      title: "LearnStack can help you...",
      headline: "get AI-powered task recommendations.",
      icon: <FaRobot className="text-lg" />,
      description:
        "Our AI agents will analyze your project and create a custom roadmap of tasks tailored to your experience level.",
    },
    {
      title: "LearnStack can help you...",
      headline: "learn exactly how to implement each task.",
      icon: <FaCode className="text-lg" />,
      description:
        "Detailed implementation guides, custom prompts for your local LLM, and curated resources for each task.",
    },
    {
      title: "First, let's get to know you",
      headline: "Tell us about your skills",
      icon: <FaTasks className="text-lg" />,
      description:
        "Fill out a quick profile so we can tailor task recommendations and resources to your skill level and learning goals.",
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-2xl px-5 py-6 opacity-100 transform translate-y-0 transition-all duration-500 ease-in-out">
        {/* Profile Image and Welcome - Compact */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center overflow-hidden mr-3 shadow-sm">
            <img
              src="https://ui-avatars.com/api/?name=User&background=fcc700&color=000"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-brand-gray text-xs font-medium">Welcome to</p>
            <h2 className="text-lg font-semibold text-brand-black">
              LearnStack!
            </h2>
          </div>
        </div>

        {/* Progress Indicator - Even Smaller */}
        <div className="flex justify-center mb-6">
          {steps.map((_, index) => (
            <div key={index} className="mx-0.5">
              <div
                className={`h-0.5 w-3 rounded-full transition-all duration-300 ease-in-out ${
                  index === currentStep
                    ? "bg-brand-orange w-4"
                    : index < currentStep
                    ? "bg-brand-yellow"
                    : "bg-gray-200"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Main Content - Tightened */}
        <div
          key={currentStep}
          className="mb-6 opacity-100 transform translate-x-0 transition-all duration-300 ease-in-out"
        >
          <h2 className="text-2xl font-semibold text-brand-black mb-2">
            {currentStepData.title}
          </h2>
          <h3 className="text-xl font-medium text-brand-orange mb-4 leading-tight">
            {currentStepData.headline}
          </h3>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-start">
              <div className="bg-brand-yellow bg-opacity-20 p-2 rounded-md text-brand-orange mr-3 shadow-sm flex-shrink-0">
                {currentStepData.icon}
              </div>
              <p className="text-brand-gray text-sm leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button - Compact */}
        <div className="flex justify-start pl-1">
          <button
            onClick={handleContinue}
            className="px-6 py-2.5 bg-brand-yellow text-brand-black hover:shadow-md transition-all duration-200 transform hover:scale-105 text-sm font-medium rounded-full flex items-center justify-center"
          >
            <span className="mr-2">
              {currentStep < steps.length - 1 ? "Continue" : "Get Started"}
            </span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
