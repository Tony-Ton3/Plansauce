import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setStackSuccess, setStackFailure } from "../redux/techstackSlice";
import CreatedStacks from "../pages/CreatedStacks";
import { getClaudeRecommendation } from "../utils/api.jsx";
import { projectQuestions } from "../constants/projectQuestions";
import { IoIosArrowDropdown, IoMdAdd, IoMdCheckmark } from "react-icons/io";
import { FaInfoCircle, FaLightbulb } from "react-icons/fa";

const ProjectInput = () => {
  const [form, setForm] = useState(() => {
    const savedForm = localStorage.getItem("projectForm");

    return savedForm
      ? JSON.parse(savedForm)
      : {
        description: "", //a description of what the user wants to build
        projectType: "", //web, mobile, etc
        scale: "", //personal, startup, enterprise
        features: [], //an array of must have features for the project
        timeline: "", //development timeline
        experience: "", //experience level of the user
        knownTechnologies: [], //getting more info about user experience for more catered recommendation
      };
  });

  const resetForm = () => {
    //clear local storage if user wants another recommendation
    const emptyForm = {
      description: "",
      projectType: "",
      scale: "",
      features: [],
      timeline: "",
      experience: "",
      knownTechnologies: [],
    };
    setForm(emptyForm);
    localStorage.removeItem("projectForm");
  };

  const [isLoading, setIsLoading] = useState(false);
  const [showTechStack, setShowTechStack] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { currentStack } = useSelector((state) => state.stack);

  useEffect(() => {
    localStorage.setItem("projectForm", JSON.stringify(form));
  }, [form]);

  //handles text box changes
  const handleInputChange = (id, value) => {
    setForm((prev) => {
      const newForm = { ...prev, [id]: value };
      localStorage.setItem("projectForm", JSON.stringify(newForm));
      return newForm;
    });
    // Clear error for this field when user types
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  //handles check box changes
  const handleMultiSelectChange = (id, value, isChecked) => {
    setForm((prev) => {
      const newForm = {
        ...prev,
        [id]: isChecked ? [...prev[id], value] : prev[id].filter((item) => item !== value),
      };
      localStorage.setItem("projectForm", JSON.stringify(newForm));
      return newForm;
    });
    // Clear error for this field when user selects
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Check required fields
    if (!form.description.trim()) {
      errors.description = "Project description is required";
    }

    if (!form.projectType) {
      errors.projectType = "Project type is required";
    }

    if (!form.scale) {
      errors.scale = "Project scale is required";
    }

    return errors;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to the first error
      const firstErrorId = Object.keys(errors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsLoading(true);
      const recommendationStack = await getClaudeRecommendation(
        currentUser._id,
        form
      );
      resetForm(); //clears local storage
      dispatch(setStackSuccess(recommendationStack));
      setShowTechStack(true); // Set this to true after getting the recommendation
    } catch (error) {
      console.error("Error getting recommendation:", error);
      dispatch(setStackFailure(error));
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col justify-center items-center bg-gray-600 rounded-lg p-8 text-center">
          <h2 className="px-4 py-2 text-2xl font-bold text-background flex">
            Thinking<span className="dots-loading">...</span>
          </h2>
        </div>
      </div>
    );
  }

  if (showTechStack && currentStack) {
    return (
      <CreatedStacks
        currentStack={currentStack}
        isNewSubmission={true}
        onBackToSaved={() => navigate("/createdstacks")}
      />
    );
  }

  const renderQuestion = (question) => {
    const isRequired = ["description", "projectType", "scale"].includes(question.id);
    const hasError = formErrors[question.id];

    return (
      <div className={`mb-6 ${hasError ? 'animate-pulse' : ''}`}>
        <div className="flex items-baseline mb-2">
          <label htmlFor={question.id} className="text-white font-medium">
            {question.question}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </label>
          {hasError && (
            <span className="ml-2 text-sm text-red-400">{hasError}</span>
          )}
        </div>

        {question.type === "text" ? (
          <textarea
            id={question.id}
            value={form[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={`w-full px-4 py-3 border ${hasError ? 'border-red-400' : 'border-gray-600'} rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent text-white min-h-24`}
            placeholder={question.placeholder || "Describe your project..."}
            aria-invalid={hasError ? "true" : "false"}
          />
        ) : question.type === "select" ? (
          <div className="relative">
            <select
              id={question.id}
              value={form[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              onFocus={() => setIsSelectOpen(true)}
              onBlur={() => setIsSelectOpen(false)}
              className={`block w-full px-4 py-3 ${hasError ? 'border-red-400' : 'border-gray-600'} border rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent appearance-none text-white`}
              aria-invalid={hasError ? "true" : "false"}
            >
              <option value="" disabled>
                Select an option
              </option>
              {question.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <IoIosArrowDropdown
                className={`size-5 transition-transform duration-300 ${isSelectOpen ? "" : "rotate-180"}`}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {question.options.map((option, index) => {
              const isChecked = form[question.id]?.includes(option) || false;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    handleMultiSelectChange(question.id, option, !isChecked)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isChecked
                    ? "bg-accent text-white"
                    : "bg-gray-800 text-white border border-gray-600 hover:border-accent"
                    }`}
                >
                  {option}
                  <span className="ml-1">
                    {isChecked ? (
                      <IoMdCheckmark className="h-4 w-4 inline" />
                    ) : (
                      <IoMdAdd className="h-4 w-4 inline" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Extract and organize questions
  const allQuestions = projectQuestions.flatMap(page => page.questions);

  const mandatoryQuestions = allQuestions.filter(q => ["description", "projectType", "scale"].includes(q.id));
  const detailQuestions = allQuestions.filter(q => ["features", "timeline"].includes(q.id));
  const experienceQuestions = allQuestions.filter(q => ["experience", "knownTechnologies"].includes(q.id));

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Create Your Tech Stack</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Tell us about your project to get a personalized technology recommendation that matches your needs.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Required information section */}
          <div className="mb-12">
            <div className="flex items-center mb-6 pb-2 border-b border-gray-700">
              <h2 className="text-xl font-medium text-white">Required Information</h2>
              <div className="ml-3 text-sm text-gray-400 flex items-center">
                <span className="text-red-400 mr-1">*</span> Required fields
              </div>
            </div>

            <div className="space-y-4">
              {mandatoryQuestions.map(question => renderQuestion(question))}
            </div>
          </div>

          {/* Project details section */}
          <div className="mb-12">
            <div className="flex items-center mb-6 pb-2 border-b border-gray-700">
              <h2 className="text-xl font-medium text-white">Project Details</h2>
              <div className="ml-3 text-sm text-gray-400 flex items-center">
                <FaInfoCircle className="mr-1" /> Optional but recommended
              </div>
            </div>

            <div className="space-y-4">
              {detailQuestions.map(question => renderQuestion(question))}
            </div>
          </div>

          {/* Experience section */}
          <div className="mb-12">
            <div className="flex items-center mb-6 pb-2 border-b border-gray-700">
              <h2 className="text-xl font-medium text-white">Your Experience</h2>
              <div className="ml-3 text-sm text-gray-400 flex items-center">
                <FaLightbulb className="mr-1" /> Helps tailor recommendations
              </div>
            </div>

            <div className="space-y-4">
              {experienceQuestions.map(question => renderQuestion(question))}
            </div>
          </div>

          {/* Tip box */}
          <div className="bg-gray-800 border-l-4 border-accent p-4 mb-8 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-accent" />
              </div>
              <div className="ml-3">
                <p className="text-gray-300">
                  The more details you provide, the more tailored your tech stack recommendation will be.
                </p>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-4 bg-accent hover:bg-opacity-90 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Generate My Tech Stack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectInput;