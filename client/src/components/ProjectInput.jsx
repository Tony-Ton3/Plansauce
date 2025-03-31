import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setStackSuccess, setStackFailure } from "../redux/techstackSlice";
import { setTasksSuccess, setTasksFailure } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import CreatedStacks from "../pages/CreatedStacks";
import { getTasks } from "../utils/api.jsx";
import { projectQuestions } from "../constants/projectQuestions";
import { IoMdAdd, IoMdCheckmark } from "react-icons/io";
import { FaInfoCircle, FaArrowRight } from "react-icons/fa";

const ProjectInput = () => {
  const [form, setForm] = useState(() => {
    const savedForm = localStorage.getItem("projectForm");
    return savedForm
      ? JSON.parse(savedForm)
      : {
        description: "",
        projectType: "",
        scale: "",
        features: [],
        timeline: "",
        useAI: undefined,
      };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showTechStack, setShowTechStack] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [openBackgroundQuiz, setOpenBackgroundQuiz] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { projects } = useSelector((state) => state.projects || { projects: [] });
  // const { currentStack } = useSelector((state) => state.stack);

  useEffect(() => {
    localStorage.setItem("projectForm", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (currentUser && currentUser.hasFilledBackground === false) {
      setOpenBackgroundQuiz(true);
      document.body.style.overflow = 'hidden';
    } else {
      setOpenBackgroundQuiz(false);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentUser]);

  const resetForm = () => {
    setForm({
      description: "",
      projectType: "",
      scale: "",
      features: [],
      timeline: "",
      useAI: undefined,
    });
    localStorage.removeItem("projectForm");
  };

  const handleGoToQuiz = () => navigate("/quiz");

  const handleInputChange = (id, value) => {
    setForm((prev) => ({...prev, [id]: value}));
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleMultiSelectChange = (id, value, isChecked) => {
    setForm((prev) => ({
      ...prev,
      [id]: isChecked 
        ? [...prev[id], value] 
        : prev[id].filter((item) => item !== value),
    }));
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRadioChange = (id, value) => {
    setForm((prev) => ({...prev, [id]: value}));
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.description.trim()) errors.description = "Required";
    if (!form.projectType) errors.projectType = "Required";
    if (!form.scale) errors.scale = "Required";
    if (form.useAI === undefined) errors.useAI = "Please select an option";
    return errors;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();

    // if there are unfilled fields, scroll to the first error and return
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorId = Object.keys(errors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await getTasks(form);

      // Extract tasks from various possible response formats
      let tasks;
      if (response.data && Array.isArray(response.data)) {
        tasks = response.data;
      } else if (response.success && response.data) {
        tasks = response.data;
      } else if (Array.isArray(response)) {
        tasks = response;
      } else if (response.tasks && Array.isArray(response.tasks)) {
        tasks = response.tasks;
      } else {
        tasks = response;
      }
      
      const formattedTasks = Array.isArray(tasks) ? tasks.map(task => ({
        id: task.id || String(Date.now() + Math.random()),
        text: task.text || '',
        completed: Boolean(task.completed),
        subtasks: Array.isArray(task.subtasks) 
          ? task.subtasks.map(subtask => ({
              id: subtask.id || String(Math.random()),
              text: subtask.text || '',
              completed: Boolean(subtask.completed)
            }))
          : []
      })) : [];
      
      dispatch(setTasksSuccess(formattedTasks));
      
      if (response.projectId && response.projectName) {
        const projectData = {
          _id: response.projectId,
          name: response.projectName,
          description: form.description,
          projectType: form.projectType || 'web',
          createdAt: new Date().toISOString()
        };
        
        dispatch(setCurrentProject(projectData));
        
        dispatch(setProjectsSuccess([...projects, projectData]));
      }
      
      resetForm();
      navigate("/tasks");
    } catch (error) {
      console.error("Error getting tasks:", error);
      dispatch(setTasksFailure(error.message || "Failed to get tasks"));
      alert("Failed to generate tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col justify-center items-center bg-gray-600 rounded-lg p-6 text-center">
          <h2 className="px-3 py-1 text-xl font-bold text-background flex">
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

  const allQuestions = projectQuestions.flatMap(page => page.questions);
  const mandatoryQuestions = allQuestions.filter(q => ["description"].includes(q.id));
  const selectQuestions = allQuestions.filter(q => ["projectType", "scale"].includes(q.id));
  const radioQuestions = allQuestions.filter(q => ["techStack"].includes(q.id));
  const detailQuestions = allQuestions.filter(q => ["features", "timeline"].includes(q.id));

  return (
    <div className="bg-neutral-900 min-h-screen flex items-center justify-center p-3 py-8">
      {openBackgroundQuiz ? (
        <div className="max-w-md w-full bg-neutral-800 rounded-lg p-6 shadow-xl border border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-100 mb-3">Complete Your Profile</h2>
          <p className="text-neutral-300 mb-4 text-sm">
            To provide personalized tech stack recommendations, we need to know about your experience level.
          </p>
          <button
            onClick={handleGoToQuiz}
            className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center justify-center shadow-lg transition-all duration-200"
          >
            Take the Quiz <FaArrowRight className="ml-2" />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">Let's Build Your Project Plan</h1>
            <p className="text-neutral-300 text-sm mb-8">
              Tell us about your idea, and we'll create a personalized tech stack and task list to bring it to life.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-neutral-900 rounded-lg p-5 shadow-md border border-neutral-700">
                <div className="flex items-center mb-4 pb-2 border-b border-neutral-700">
                  <h2 className="text-lg font-medium text-neutral-100">Required Information</h2>
                  <div className="ml-2 text-xs text-neutral-400">
                    <span className="text-amber-500 mr-1">*</span> Required
                  </div>
                </div>

                {mandatoryQuestions.map(question => {
                  const hasError = formErrors[question.id];
                  return (
                    <div className={`mb-4 ${hasError ? 'animate-pulse' : ''}`} key={question.id}>
                      <div className="flex items-baseline mb-1.5">
                        <label htmlFor={question.id} className="text-neutral-200 text-sm font-medium">
                          Briefly describe your project idea
                          <span className="text-amber-500 ml-1">*</span>
                        </label>
                        {hasError && (
                          <span className="ml-2 text-xs text-amber-500">{hasError}</span>
                        )}
                      </div>
                      <textarea
                        id={question.id}
                        value={form[question.id] || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className={`w-full px-4 py-3 border ${hasError ? 'border-amber-500' : 'border-neutral-600'} rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 min-h-20 shadow-inner transition-colors`}
                        placeholder="E.g., A task tracker for freelancers to manage clients and deadlines."
                        aria-invalid={hasError ? "true" : "false"}
                      />
                    </div>
                  );
                })}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  {selectQuestions.map(question => {
                    const hasError = formErrors[question.id];
                    return (
                      <div className={`${hasError ? 'animate-pulse' : ''}`} key={question.id}>
                        <div className="flex items-baseline mb-1.5">
                          <label htmlFor={question.id} className="text-neutral-200 text-sm font-medium">
                            {question.id === "projectType" ? "What type of project are you building?" : 
                             question.id === "scale" ? "What's the expected scale of your project?" : 
                             question.question}
                            <span className="text-amber-500 ml-1">*</span>
                          </label>
                          {hasError && (
                            <span className="ml-2 text-xs text-amber-500">{hasError}</span>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            id={question.id}
                            value={form[question.id] || ""}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            className={`block w-full px-4 py-3 ${hasError ? 'border-amber-500' : 'border-neutral-600'} border rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none text-neutral-100 text-sm shadow-inner transition-colors`}
                            aria-invalid={hasError ? "true" : "false"}
                          >
                            <option value="" disabled>Select</option>
                            {question.options.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-neutral-900 rounded-lg p-5 shadow-md border border-neutral-700">
                <div className="flex items-center mb-5 pb-2 border-b border-neutral-700">
                  <h2 className="text-lg font-medium text-neutral-100">Tech Stack Preference</h2>
                  <div className="ml-2 text-xs text-neutral-400">
                    <span className="text-amber-500 mr-1">*</span> Required
                  </div>
                </div>
                
                <div className={`mb-5 ${formErrors.useAI ? 'animate-pulse' : ''}`}>
                  <div className="flex items-baseline mb-2">
                    <label className="text-neutral-200 text-sm font-medium">
                      How would you like to choose your tech stack?
                      <span className="text-amber-500 ml-1">*</span>
                    </label>
                    {formErrors.useAI && (
                      <span className="ml-2 text-xs text-amber-500">{formErrors.useAI}</span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {radioQuestions[0].options.map((option, index) => {
                      const isSelected = index === 0 
                        ? form.useAI === false 
                        : form.useAI === true;
                      return (
                        <div 
                          key={index} 
                          className={`flex-1 flex items-center p-3 rounded-lg transition-all ${
                            isSelected 
                              ? "bg-neutral-700 border-2 border-amber-500 shadow-md" 
                              : formErrors.useAI
                                ? "bg-neutral-800 border-2 border-amber-500/50 hover:border-amber-500"
                                : "bg-neutral-800 border border-neutral-600 hover:border-amber-500 hover:shadow-md"
                          }`}
                        >
                          <input
                            type="radio"
                            id={`useAI-${index}`}
                            name="useAI"
                            checked={isSelected}
                            onChange={() => handleRadioChange("useAI", index === 1)}
                            className="h-5 w-5 text-amber-500 focus:ring-amber-500 transition-colors"
                          />
                          <label
                            htmlFor={`useAI-${index}`}
                            className="ml-3 text-sm font-medium text-neutral-200 cursor-pointer flex-grow"
                          >
                            {option}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-900 rounded-lg p-5 shadow-md border border-neutral-700">
                <div className="flex items-center mb-5 pb-2 border-b border-neutral-700">
                  <h2 className="text-lg font-medium text-neutral-100">Help us fine-tune your plan</h2>
                  <div className="ml-2 text-xs text-neutral-400 flex items-center">
                    <FaInfoCircle className="mr-1 h-3 w-3" /> Optional
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {detailQuestions.map(question => (
                    <div key={question.id}>
                      <div className="flex items-baseline mb-2">
                        <label className="text-neutral-200 text-sm font-medium">
                          {question.id === "features" ? "What key features do you need?" : 
                           question.id === "timeline" ? "What's your development timeline?" : 
                           question.question}
                        </label>
                      </div>
                      {question.type === "multiselect" ? (
                        <div className="flex flex-wrap gap-2">
                          {[
                            ...question.options, 
                            ...(question.options.includes("None of these") ? [] : ["None of these"])
                          ].map((option, index) => {
                            const isChecked = form[question.id]?.includes(option) || false;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleMultiSelectChange(question.id, option, !isChecked)}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                                  isChecked
                                    ? "bg-amber-600 text-white shadow-md"
                                    : "bg-neutral-700 text-neutral-200 border border-neutral-600 hover:border-amber-500"
                                }`}
                              >
                                {option}
                                <span className="ml-1">
                                  {isChecked ? (
                                    <IoMdCheckmark className="h-3.5 w-3.5 inline" />
                                  ) : (
                                    <IoMdAdd className="h-3.5 w-3.5 inline" />
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            id={question.id}
                            value={form[question.id] || ""}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            className="block w-full px-4 py-3 border border-neutral-600 rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none text-neutral-100 text-sm shadow-inner transition-colors"
                          >
                            <option value="" disabled>Select</option>
                            {question.options.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform hover:scale-105"
                >
                  Create My Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInput;