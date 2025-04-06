import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaSearch, FaArrowRight, FaTimes, FaCheck } from "react-icons/fa";
import { backgroundQuestions } from "../constants/backgroundQuestions.jsx";
import { updateUserBackground } from "../utils/api.jsx";
import { updateSuccess } from "../redux/userSlice";

// Define styles outside the component to avoid re-creation on each render
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #bbbbbb;
  }
`;

// Add scrollbar styles once to document head
const styleEl = document.createElement("style");
styleEl.textContent = scrollbarStyles;
document.head.appendChild(styleEl);

export default function Quiz() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [answers, setAnswers] = useState({
    known_tech: [],
    disliked_tech: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDislikedSection, setShowDislikedSection] = useState(false);
  const [activeField, setActiveField] = useState("known_tech");
  const searchInputRef = useRef(null);

  // Filter to only show the known_tech question
  const techQuestion = backgroundQuestions.find((q) => q.id === "known_tech");

  // Get common and remaining skills to display
  const commonSkills = techQuestion ? techQuestion.options.slice(0, 18) : [];

  // Update quick suggestions whenever the search text changes or input is focused
  useEffect(() => {
    if (!techQuestion || !techQuestion.suggestions) {
      setQuickSuggestions([]);
      return;
    }

    // Get all selected skills
    const selectedTechs = answers.known_tech || [];
    const dislikedTechs = answers.disliked_tech || [];
    const unavailableTechs = [
      ...selectedTechs,
      ...dislikedTechs,
      ...commonSkills,
    ];

    // Filter out suggestions that are already in options or selected
    let availableSuggestions = techQuestion.suggestions.filter(
      (tech) => !unavailableTechs.includes(tech)
    );

    // If search text exists, filter by it
    if (searchText.trim() !== "") {
      availableSuggestions = availableSuggestions.filter((tech) =>
        tech.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Limit to 8 suggestions
    setQuickSuggestions(availableSuggestions.slice(0, 8));

    // Don't automatically show suggestions - only update the available ones
    // The showSuggestions state will be controlled by focus events instead
  }, [searchText, answers.known_tech, answers.disliked_tech, commonSkills]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (questionId, optionValue) => {
    const currentSelections = answers[questionId] || [];
    if (currentSelections.includes(optionValue)) {
      // removal
      setAnswers({
        ...answers,
        [questionId]: currentSelections.filter(
          (value) => value !== optionValue
        ),
      });
    } else {
      // addition
      setAnswers({
        ...answers,
        [questionId]: [...currentSelections, optionValue],
      });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleOptionSelect(activeField, suggestion);
    setSearchText("");
  };

  const handleCustomTechKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      e.preventDefault();
      // Add the entered text as a custom technology
      handleOptionSelect(activeField, searchText.trim());
      setSearchText("");
    }
  };

  const handleInputFocus = () => {
    // Only show suggestions when input is focused AND we have suggestions
    setShowSuggestions(quickSuggestions.length > 0);
  };

  const handleInputBlur = () => {
    // Add a slight delay before hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting background answers:", answers);

      // First, update the user's background information
      const updatedUser = await updateUserBackground(answers);
      console.log("Received updated user:", updatedUser);

      // await setBackground();

      // Update the user object in Redux with the hasFilledBackground flag set to true
      const userWithBackgroundFilled = {
        ...updatedUser,
        hasFilledBackground: true,
      };

      // Update Redux state with the updated user data
      dispatch(updateSuccess(userWithBackgroundFilled));

      // Navigate to project input page after successful submission
      navigate("/projectinput");
    } catch (error) {
      console.error("Error submitting background:", error);
      setError(
        error.message ||
          "Failed to save your preferences. We'll continue anyway."
      );
      setIsSubmitting(false);
    }
  };

  const isOptionSelected = (questionId, optionValue) => {
    const answer = answers[questionId];
    if (Array.isArray(answer)) {
      return answer.includes(optionValue);
    }
    return answer === optionValue;
  };

  const isReadyToSubmit = () => {
    // Always allow submission, regardless of whether skills are selected
    return true;
  };

  const toggleActiveField = () => {
    setActiveField(
      activeField === "known_tech" ? "disliked_tech" : "known_tech"
    );
    setSearchText("");
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div
        className="w-full max-w-2xl px-5 py-6 flex flex-col"
        style={{ height: "600px" }}
      >
        {/* Main content */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-brand-black mb-1">
            What skills do you have or enjoy working with?
          </h1>
          <p className="text-brand-gray text-sm">Select all that apply</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Skills Section - with fixed height and flex-grow */}
        <div className="bg-white rounded-lg mb-3 flex-grow flex flex-col overflow-hidden">
          {/* Mode toggle buttons */}
          <div className="mx-1 mb-2">
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
              <button
                className={`px-5 py-2 text-sm ${
                  activeField === "known_tech"
                    ? "bg-brand-yellow text-brand-black font-medium"
                    : "bg-white text-brand-gray"
                }`}
                onClick={() => {
                  if (activeField !== "known_tech") toggleActiveField();
                }}
              >
                Skills I enjoy
              </button>
              <button
                className={`px-5 py-2 text-sm border-l ${
                  activeField === "disliked_tech"
                    ? "bg-brand-pink text-white font-medium"
                    : "bg-white text-brand-gray"
                }`}
                onClick={() => {
                  if (activeField !== "disliked_tech") toggleActiveField();
                }}
              >
                Skills to avoid
              </button>
            </div>
          </div>

          {/* Search input */}
          <div className="mb-4 mx-1 relative" ref={searchInputRef}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSearch className="text-brand-gray" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (e.target.value.trim() !== "") {
                  setShowSuggestions(quickSuggestions.length > 0);
                }
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleCustomTechKeyDown}
              placeholder={
                activeField === "known_tech"
                  ? "Search all skills..."
                  : "Skills to filter out..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="py-1 max-h-40 overflow-auto">
                  {quickSuggestions.length > 0 ? (
                    quickSuggestions.map((suggestion) => (
                      <li
                        key={suggestion}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-brand-gray"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500 text-sm italic">
                      No matching skills found. Press Enter to add a custom
                      skill.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Skills section container - fixed height with scrolling */}
          <div className="flex-grow overflow-hidden">
            {/* Skills section - skills I enjoy */}
            {activeField === "known_tech" && (
              <div className="h-full overflow-y-auto p-2 custom-scrollbar">
                <div className="flex flex-wrap gap-1.5">
                  {/* Display common skills */}
                  {commonSkills.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect("known_tech", option)}
                      className={`px-2.5 py-1 text-xs rounded-full flex items-center transition-all hover:scale-110 ${
                        isOptionSelected("known_tech", option)
                          ? "bg-brand-yellow text-brand-black"
                          : "bg-gray-100 text-brand-gray"
                      }`}
                    >
                      {option}
                      {isOptionSelected("known_tech", option) && (
                        <FaCheck className="ml-1" size={8} />
                      )}
                    </button>
                  ))}

                  {/* Display custom selected skills that aren't in common skills */}
                  {answers.known_tech
                    .filter((tech) => !commonSkills.includes(tech))
                    .map((tech) => (
                      <button
                        key={tech}
                        onClick={() => handleOptionSelect("known_tech", tech)}
                        className="px-2.5 py-1 text-xs rounded-full bg-brand-yellow text-brand-black transition-all hover:scale-110 flex items-center"
                      >
                        {tech}
                        <FaCheck className="ml-1" size={8} />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Skills section - skills to avoid */}
            {activeField === "disliked_tech" && (
              <div className="h-full overflow-y-auto p-2 custom-scrollbar">
                {answers.disliked_tech.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {answers.disliked_tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-brand-pink text-white rounded-full text-xs flex items-center transition-all hover:scale-110 group"
                      >
                        {tech}
                        <button
                          className="ml-1 text-white transition-colors"
                          onClick={() =>
                            handleOptionSelect("disliked_tech", tech)
                          }
                          aria-label={`Remove ${tech}`}
                        >
                          <FaTimes size={8} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-gray italic">
                    Search and add skills you'd prefer to avoid
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end mt-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-brand-yellow text-brand-black hover:shadow-md transition-all duration-200 hover:scale-105"
            }`}
          >
            <span className="mr-1.5">
              {isSubmitting ? "Saving..." : "Save and Continue"}
            </span>
            {!isSubmitting && <FaArrowRight size={10} />}
          </button>
        </div>
      </div>
    </div>
  );
}
