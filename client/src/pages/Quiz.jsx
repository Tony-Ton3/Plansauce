import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaSearch, FaArrowRight, FaTimes, FaCheck, FaStar } from "react-icons/fa";
import { backgroundQuestions } from "../constants/backgroundQuestions.jsx";
import { updateUserBackground } from "../utils/api.jsx";
import { updateSuccess } from "../redux/userSlice";

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

const styleEl = document.createElement("style");
styleEl.textContent = scrollbarStyles;
document.head.appendChild(styleEl);

export default function Quiz() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [answers, setAnswers] = useState({
    known_tech: [],
    disliked_tech: [],
    starred_tech: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState("known_tech");
  const searchInputRef = useRef(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const DOUBLE_CLICK_DELAY = 250; // milliseconds

  // Filter to only show the known_tech question, we'll improve this later
  const techQuestion = backgroundQuestions.find((q) => q.id === "known_tech");

  // Get all skills to display
  const allSkills = techQuestion ? techQuestion.options : [];

  // Update quick suggestions whenever the search text changes or input is focused
  useEffect(() => {
    if (!techQuestion) {
      setQuickSuggestions([]);
      return;
    }

    // Get all selected skills
    const selectedTechs = answers.known_tech || [];
    const dislikedTechs = answers.disliked_tech || [];
    const unavailableTechs = [
      ...selectedTechs,
      ...dislikedTechs,
    ];

    // Filter out suggestions that are already selected
    let availableSuggestions = allSkills.filter(
      (tech) => !unavailableTechs.includes(tech)
    );

    // If search text exists, filter by it
    if (searchText.trim() !== "") {
      availableSuggestions = availableSuggestions.filter((tech) =>
        tech.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setQuickSuggestions(availableSuggestions.slice(0, 8));

  }, [searchText, answers.known_tech, answers.disliked_tech, allSkills]);

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
    const lowerCaseOption = optionValue.toLowerCase();
    
    // If adding to known_tech, remove from disliked_tech
    if (questionId === "known_tech" && !currentSelections.includes(lowerCaseOption)) {
      setAnswers({
        ...answers,
        [questionId]: [...currentSelections, lowerCaseOption],
        disliked_tech: answers.disliked_tech.filter(tech => tech !== lowerCaseOption)
      });
      return;
    }

    // If adding to disliked_tech, remove from known_tech and starred_tech
    if (questionId === "disliked_tech" && !currentSelections.includes(lowerCaseOption)) {
      setAnswers({
        ...answers,
        [questionId]: [...currentSelections, lowerCaseOption],
        known_tech: answers.known_tech.filter(tech => tech !== lowerCaseOption),
        starred_tech: answers.starred_tech.filter(tech => tech !== lowerCaseOption)
      });
      return;
    }

    // If removing from either list, just remove it
    setAnswers({
      ...answers,
      [questionId]: currentSelections.filter((value) => value !== lowerCaseOption)
    });
  };

  const handleCustomTechKeyDown = (e) => {
    if (e.key === "Enter" && searchText.trim() !== "") {
      e.preventDefault();
      const enteredTech = searchText.trim().toLowerCase();
      
      // If there's exactly one suggestion, use that
      if (quickSuggestions.length === 1) {
        handleOptionSelect(activeField, quickSuggestions[0].toLowerCase());
        setSearchText("");
        return;
      }

      // Otherwise, check if the entered tech exists in allSkills (case insensitive)
      const existingTech = allSkills.find(
        tech => tech.toLowerCase() === enteredTech
      );

      // If it exists, use the lowercase version, otherwise use the entered text
      const techToAdd = existingTech ? existingTech.toLowerCase() : enteredTech;
      
      // Add the technology
      handleOptionSelect(activeField, techToAdd);
      setSearchText("");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting background answers:", answers);
      const updatedUser = await updateUserBackground(answers);
      console.log("Received updated user:", updatedUser);

      const userWithBackgroundFilled = {
        ...updatedUser,
        hasFilledBackground: true,
      };

      dispatch(updateSuccess(userWithBackgroundFilled));

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
    const lowerCaseOption = optionValue.toLowerCase();
    if (Array.isArray(answer)) {
      return answer.includes(lowerCaseOption);
    }
    return answer === lowerCaseOption;
  };

  const toggleActiveField = () => {
    setActiveField(
      activeField === "known_tech" ? "disliked_tech" : "known_tech"
    );
    setSearchText("");
    setShowSuggestions(false);
  };

  const handleStarTech = (tech) => {
    const lowerCaseTech = tech.toLowerCase();
    setAnswers(prev => ({
      ...prev,
      starred_tech: prev.starred_tech.includes(lowerCaseTech)
        ? prev.starred_tech.filter(t => t !== lowerCaseTech)
        : [...prev.starred_tech, lowerCaseTech]
    }));
  };

  const handleTechClick = (tech, field = "known_tech") => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    const lowerCaseTech = tech.toLowerCase();

    if (timeDiff < DOUBLE_CLICK_DELAY) {
      // Double click - toggle star (only for known_tech)
      if (field === "known_tech") {
        if (!answers.known_tech.includes(lowerCaseTech)) {
          // If not selected, select it first
          handleOptionSelect("known_tech", lowerCaseTech);
        }
        handleStarTech(lowerCaseTech);
      }
    } else {
      // Single click - toggle selection
      handleOptionSelect(field, lowerCaseTech);
    }
    setLastClickTime(currentTime);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-2xl px-5 py-6 flex flex-col h-[600px]">
        <div className="w-full mb-4 bg-white p-4 rounded-lg relative z-10">
          <h1 className="text-2xl font-bold text-brand-black mb-1">
            What skills do you have or enjoy working with?
          </h1>
          <p className="text-brand-gray text-sm flex items-center">
            Double-click to star a tool <FaStar className="mx-1 text-brand-yellow" size={10} /> to always include it in recommendations
          </p>
        </div>

        {error && (
          <div className="w-full mb-4 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg relative z-10">
            <p>{error}</p>
          </div>
        )}

        <div className="w-full bg-white rounded-lg mb-3 flex-grow flex flex-col overflow-hidden relative z-0">
          <div className="w-full px-1 mb-2">
            <div className="w-full flex rounded-md border border-gray-300 overflow-hidden">
              <button
                className={`flex-1 px-5 py-2 text-sm ${
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
                className={`flex-1 px-5 py-2 text-sm border-l ${
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

          <div className="w-full px-1 mb-4 relative" ref={searchInputRef}>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
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
              onFocus={() => setShowSuggestions(quickSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleCustomTechKeyDown}
              placeholder={activeField === "known_tech" ? "Search all skills..." : "Skills to filter out..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none"
            />

            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-[calc(100%-10px)] bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="w-full py-1 max-h-40 overflow-auto">
                  {quickSuggestions.length > 0 ? (
                    quickSuggestions.map((suggestion) => (
                      <li
                        key={suggestion}
                        onClick={() => {
                          handleOptionSelect(activeField, suggestion.toLowerCase());
                          setSearchText("");
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-brand-gray group"
                      >
                        <div className="w-full flex items-center justify-between">
                          <span>{suggestion}</span>
                          <span className="text-xs text-brand-gray opacity-0 group-hover:opacity-100">
                            double-click to star
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="w-full px-4 py-2 text-gray-500 text-sm italic">
                      No matching skills found. Press Enter to add a custom skill.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="w-full flex-grow overflow-hidden rounded-md">
            {activeField === "known_tech" && (
              <div className="w-full h-full overflow-y-auto shadow-inner shadow-gray-200 p-4 custom-scrollbar">
                <div className="w-full flex flex-wrap gap-2 justify-center">
                  {allSkills.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleTechClick(option, "known_tech")}
                      className={`px-2.5 py-1 text-xs rounded-full flex items-center transition-all hover:scale-110 ${
                        isOptionSelected("known_tech", option.toLowerCase())
                          ? "bg-brand-yellow text-brand-black"
                          : "bg-gray-100 text-brand-gray"
                      }`}
                    >
                      {option}
                      {isOptionSelected("known_tech", option.toLowerCase()) && (
                        answers.starred_tech.includes(option.toLowerCase()) 
                          ? <FaStar className="ml-1 text-brand-black" size={8} />
                          : <FaCheck className="ml-1" size={8} />
                      )}
                    </button>
                  ))}

                  {answers.known_tech
                    .filter((tech) => !allSkills.includes(tech))
                    .map((tech) => (
                      <button
                        key={tech}
                        onClick={() => handleTechClick(tech, "known_tech")}
                        className="px-2.5 py-1 text-xs rounded-full bg-brand-yellow text-brand-black transition-all hover:scale-110 flex items-center"
                      >
                        {tech}
                        {answers.starred_tech.includes(tech.toLowerCase()) 
                          ? <FaStar className="ml-1 text-brand-black" size={8} />
                          : <FaCheck className="ml-1" size={8} />
                        }
                      </button>
                    ))}
                </div>
              </div>
            )}

            {activeField === "disliked_tech" && (
              <div className="w-full h-full overflow-y-auto shadow-inner shadow-gray-200 p-4 custom-scrollbar">
                <div className="w-full flex flex-wrap gap-1.5 justify-center">
                  {answers.disliked_tech.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => handleTechClick(tech, "disliked_tech")}
                      className="px-2.5 py-1 text-xs rounded-full bg-brand-pink text-white transition-all hover:scale-110 flex items-center"
                    >
                      {tech}
                      <FaTimes className="ml-1" size={8} />
                    </button>
                  ))}
                  {answers.disliked_tech.length === 0 && (
                    <p className="text-sm text-brand-gray italic text-center">
                      Search and add skills you'd prefer to avoid
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-end mt-auto">
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
