import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setTasksSuccess, setTasksFailure } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import {
  getTasks,
  enhanceProjectIdea,
  getUserProjects,
} from "../utils/api.jsx";
import { FaCheck, FaSearch, FaTimes, FaInfoCircle } from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import { RiRobot2Fill, RiScalesFill } from "react-icons/ri";
import { PiBookFill } from "react-icons/pi";

const ProjectInput = () => {
  const [form, setForm] = useState(() => {
    const savedForm = localStorage.getItem("projectForm");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          name: "",
          description: "",
          priority: "",
        };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enhancingIdea, setEnhancingIdea] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [promptMessage, setPromptMessage] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [enhancedIdea, setEnhancedIdea] = useState("");
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [editableEnhancedIdea, setEditableEnhancedIdea] = useState("");
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects } = useSelector(
    (state) => state.projects || { projects: [] }
  );

  useEffect(() => {
    localStorage.setItem("projectForm", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const description = form.description;

    if (description.length === 0) {
      setPromptMessage("");
    } else if (description.length < 20) {
      setPromptMessage("Please provide more details about your project");
    } else if (description.length < 50) {
      setPromptMessage(
        "Adding specific features will help create better task breakdowns"
      );
    } else if (
      description.length < 100 &&
      !description.toLowerCase().includes("feature")
    ) {
      setPromptMessage(
        "Consider mentioning 2-3 key features you'd like to include"
      );
    } else {
      setPromptMessage("");
    }
  }, [form.description]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      priority: "",
    });
    setEnhancedIdea("");
    setEditableEnhancedIdea("");
    setSuggestedFeatures([]);
    localStorage.removeItem("projectForm");
  };

  const handleInputChange = (id, value) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
    if (!showExamples) setShowEnhancer(false);
  };

  const toggleEnhancer = () => {
    if (showEnhancer) {
      setShowEnhancer(false);
      return;
    }

    if (showExamples) {
      setShowExamples(false);
    }

    setEnhancedIdea("");
    setEditableEnhancedIdea("");
    setShowEnhancer(true);
    enhanceIdea();
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Project name is required";
    if (!form.description.trim())
      errors.description = "Project description is required";
    if (!form.priority) errors.priority = "Project priority is required";
    return errors;
  };

  const enhanceIdea = async () => {
    setEnhancingIdea(true);

    try {
      const response = await enhanceProjectIdea(form.description);
      if (response?.enhancedDescription) {
        setEnhancedIdea(response.enhancedDescription);
        setEditableEnhancedIdea(response.enhancedDescription);

        if (response.suggestedFeatures?.length) {
          setSuggestedFeatures(
            response.suggestedFeatures.map((feature) => ({
              text: feature,
              included: true,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error enhancing idea:", error);
      alert(
        "Could not connect to the enhancement service. Please try again later."
      );
    } finally {
      setEnhancingIdea(false);
    }
  };

  const acceptEnhancedIdea = () => {
    handleInputChange("description", editableEnhancedIdea || "");
    setShowEnhancer(false);
    setSuggestedFeatures([]);
    setEnhancedIdea("");
    setEditableEnhancedIdea("");
  };

  const handlePriorityChange = (value) => {
    handleInputChange("priority", value);
    setShowPriorityDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorId = Object.keys(errors)[0];
      document
        .getElementById(firstErrorId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await getTasks(form);
      const tasks = response.data || [];

      const formattedTasks = tasks.map((task) => ({
        id: task.id || String(Date.now() + Math.random()),
        text: task.text || "",
        completed: false,
        category: task.category || "plan",
        subtasks:
          task.subtasks?.map((subtask) => ({
            id: subtask.id || String(Math.random()),
            text: subtask.text || "",
            completed: false,
          })) || [],
      }));

      dispatch(setTasksSuccess(formattedTasks));

      if (response.projectId && response.projectName) {
        const projectData = {
          _id: response.projectId,
          name: form.name || response.projectName,
          description: form.description,
          priority: form.priority,
          createdAt: new Date().toISOString(),
        };

        dispatch(setCurrentProject(projectData));
        dispatch(setProjectsSuccess([...projects, projectData]));

        const projectsResponse = await getUserProjects();
        if (projectsResponse?.projects) {
          dispatch(setProjectsSuccess(projectsResponse.projects));
        }
      }

      resetForm();
      navigate("/tasks");
    } catch (error) {
      console.error("Error getting tasks:", error);
      dispatch(setTasksFailure(error.message || "Failed to get tasks"));
      alert("Failed to generate tasks. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
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

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center p-10">
      <div className="w-full max-w-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-neutral-100 mb-6">
            Create a personal project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-300 mb-1"
                >
                  What are you working on?
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full max-h-[15vh] px-4 py-3 border ${
                    formErrors.name ? "border-red-500" : "border-neutral-600"
                  } rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 shadow-inner transition-colors`}
                  placeholder="Name your project"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-neutral-300"
                    >
                      What are you trying to achieve?
                    </label>
                    <button
                      type="button"
                      onClick={toggleExamples}
                      className="ml-2 text-neutral-400 hover:text-neutral-200 focus:outline-none"
                      aria-label="Show examples"
                    >
                      <FaInfoCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggleEnhancer}
                    disabled={enhancingIdea || form.description.length < 50}
                    className={`px-3 py-1 ${
                      enhancingIdea
                        ? "bg-blue-500"
                        : form.description.length < 50
                        ? "bg-blue-400 cursor-not-allowed opacity-70"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white text-xs font-medium rounded flex items-center group relative`}
                  >
                    {enhancingIdea ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4">
                          <div className="h-full w-full rounded-full border-2 border-b-transparent border-white"></div>
                        </div>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <RiRobot2Fill className="h-3.5 w-3.5 mr-1" />
                        Enhance My Idea
                      </>
                    )}
                    {form.description.length < 50 && !enhancingIdea && (
                      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-neutral-800 text-xs text-neutral-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Min. 50 characters needed ({form.description.length}/50)
                      </span>
                    )}
                  </button>
                </div>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full px-4 py-3 border ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-neutral-600"
                  } rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 min-h-[15vh] max-h-[30vh] resize-none shadow-inner transition-colors`}
                  placeholder="Describe your project idea in detail (e.g., what it does, type of project, key features)"
                />
                {formErrors.description ? (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.description}
                  </p>
                ) : promptMessage ? (
                  <p className="mt-1 text-xs text-amber-400 italic">
                    {promptMessage}
                  </p>
                ) : null}

                {showExamples && (
                  <div className="mt-2 mb-4 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                        Examples
                      </h4>
                      <button
                        onClick={toggleExamples}
                        className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                        aria-label="Close examples"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-neutral-400 text-xs font-medium mb-1">
                          Basic (Not recommended):
                        </p>
                        <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                          "A workout tracker app"
                        </div>
                      </div>

                      <div>
                        <p className="text-neutral-400 text-xs font-medium mb-1">
                          Good (Recommended):
                        </p>
                        <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                          "A mobile workout tracker app where users can log
                          exercises, track progress over time, and get
                          recommendations for new routines based on their goals.
                          Should include a calendar view and achievement
                          badges."
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Idea Section - Expandable */}
                {showEnhancer && (
                  <div className="mt-2 mb-4 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                        Enhanced Project Idea
                      </h4>
                      <button
                        onClick={() => setShowEnhancer(false)}
                        className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                        aria-label="Close enhancer"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {enhancedIdea ? (
                        <>
                          <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                            <textarea
                              value={editableEnhancedIdea || ""}
                              onChange={(e) =>
                                setEditableEnhancedIdea(e.target.value)
                              }
                              className="w-full bg-neutral-700 text-neutral-300 text-xs border-none focus:outline-none focus:ring-0 min-h-[30vh] max-h-[30vh] resize-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={acceptEnhancedIdea}
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded"
                          >
                            Use This Enhanced Description
                          </button>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-neutral-400 text-xs">
                            Generating enhanced description...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-neutral-300 mb-1"
                >
                  What's your priority for this project?
                </label>
                <div className="relative" ref={searchInputRef}>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {form.priority?.startsWith("Speed") && (
                      <BsLightningChargeFill className="h-4 w-4 text-amber-500" />
                    )}
                    {form.priority?.startsWith("Scalability") && (
                      <RiScalesFill className="h-4 w-4 text-amber-500" />
                    )}
                    {form.priority?.startsWith("Learning") && (
                      <PiBookFill className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <input
                    id="priority"
                    type="text"
                    readOnly
                    value={form.priority ? form.priority.split(" (")[0] : ""}
                    onFocus={() => setShowPriorityDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowPriorityDropdown(false), 150)
                    }
                    placeholder="Select your priority..."
                    className={`w-full ${
                      form.priority ? "pl-10" : "pl-4"
                    } pr-4 py-2.5 cursor-pointer ${
                      formErrors.priority
                        ? "border-red-500"
                        : "border-neutral-600"
                    } border rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 shadow-inner transition-colors`}
                  />

                  {showPriorityDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                      <ul>
                        <li
                          className="px-4 py-2.5 hover:bg-neutral-700 cursor-pointer text-sm text-neutral-300 flex items-center justify-between"
                          onClick={() =>
                            handlePriorityChange(
                              "Speed (Ship fast, even if basic)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <BsLightningChargeFill className="h-3.5 w-3.5 mr-3 text-amber-500" />
                            <div>
                              <div className="font-medium">Speed</div>
                              <div className="text-xs text-neutral-400">
                                Ship fast, even if basic
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Speed (Ship fast, even if basic)" && (
                            <FaCheck className="text-amber-500" size={12} />
                          )}
                        </li>
                        <li
                          className="px-4 py-2.5 hover:bg-neutral-700 cursor-pointer text-sm text-neutral-300 flex items-center justify-between border-t border-neutral-700"
                          onClick={() =>
                            handlePriorityChange(
                              "Scalability (Build for future growth)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <RiScalesFill className="h-3.5 w-3.5 mr-3 text-amber-500" />
                            <div>
                              <div className="font-medium">Scalability</div>
                              <div className="text-xs text-neutral-400">
                                Build for future growth
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Scalability (Build for future growth)" && (
                            <FaCheck className="text-amber-500" size={12} />
                          )}
                        </li>
                        <li
                          className="px-4 py-2.5 hover:bg-neutral-700 cursor-pointer text-sm text-neutral-300 flex items-center justify-between border-t border-neutral-700"
                          onClick={() =>
                            handlePriorityChange(
                              "Learning (Optimize for skill development)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <PiBookFill className="h-3.5 w-3.5 mr-3 text-amber-500" />
                            <div>
                              <div className="font-medium">Learning</div>
                              <div className="text-xs text-neutral-400">
                                Optimize for skill development
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Learning (Optimize for skill development)" && (
                            <FaCheck className="text-amber-500" size={12} />
                          )}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                {formErrors.priority && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.priority}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="mr-2 px-4 py-2 text-neutral-300 hover:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-lg transition-colors"
              >
                {isSubmitting ? "Saving..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectInput;
