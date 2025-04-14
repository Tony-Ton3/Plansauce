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
import { RotateSpinner } from "react-spinners-kit";

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
    console.log("Form submission started");
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
      // console.log("Setting isSubmitting to true");
      setIsSubmitting(true);
      // console.log("Calling getTasks API");
      const response = await getTasks(form);
      console.log("API RESPONSE RECEIVED:", response);

      const tasks = response.data || [];
      console.log("Tasks from response:", tasks);
      
      let formattedTechStack = {
        planning: [],
        setup: [],
        frontend: [],
        backend: [],
        testing: [],
        deploy: [],
        maintain: []
      };
      
      if (response.tech_stack_recommendation) {
        if (typeof response.tech_stack_recommendation === 'object') {
          formattedTechStack = response.tech_stack_recommendation;
        } else if (typeof response.tech_stack_recommendation === 'string') {
          try {
            const parsed = JSON.parse(response.tech_stack_recommendation);
            if (parsed && typeof parsed === 'object') {
              formattedTechStack = parsed;
            }
          } catch (e) {
            console.error("Error parsing tech stack string:", e);
          }
        }
      } else if (response.frontend || response.backend) {
        formattedTechStack = {
          planning: response.planning || [],
          setup: response.setup || [],
          frontend: response.frontend || [],
          backend: response.backend || [],
          testing: response.testing || [],
          deploy: response.deploy || [],
          maintain: response.maintain || []
        };
      }
      
      console.log("Formatted tooling from tech stack curator:", formattedTechStack);

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

      console.log("Dispatching setTasksSuccess");
      dispatch(setTasksSuccess(formattedTasks));

      if (response.projectId && response.projectName) {
        console.log("Creating project data");
        
        const projectData = {
          _id: response.projectId,
          name: form.name || response.projectName,
          description: form.description,
          priority: form.priority,
          type: response.project_type || "Web Application",
          createdAt: new Date().toISOString(),
          techStack: formattedTechStack
        };

        console.log("Project data created:", projectData);

        console.log("Dispatching setCurrentProject");
        dispatch(setCurrentProject(projectData));
        console.log("Dispatching setProjectsSuccess");
        dispatch(setProjectsSuccess([...projects, projectData]));

        console.log("Getting user projects");
        const projectsResponse = await getUserProjects();
        if (projectsResponse?.projects) {
          console.log("Updating projects in Redux");
          dispatch(setProjectsSuccess(projectsResponse.projects));
        }
      }

      console.log("Resetting form");
      resetForm();
      console.log("Navigating to tasks page");
      navigate("/tasks");
    } catch (error) {
      console.error("Error getting tasks:", error);
      dispatch(setTasksFailure(error.message || "Failed to get tasks"));
      alert("Failed to generate tasks. Please try again later.");
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col justify-center items-center bg-brand-wite rounded-lg p-8 text-center max-w-md">
          <RotateSpinner size={50} color="#fcc700" loading={isSubmitting} />
          <h2 className="px-3 py-2 text-xl font-bold text-brand-black mt-4">
            Creating your project...
          </h2>
          <p className="text-brand-gray text-sm mt-2">
            We're breaking down your project into actionable tasks. This might take up to a minute.
          </p>
          {/* <div className="mt-4 text-xs text-brand-gray">
            <p>Analyzing requirements...</p>
            <p>Generating project structure...</p>
            <p>Creating task breakdown...</p>
          </div> */}
        </div> 
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex justify-center p-10">
      <div className="w-full max-w-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-black mb-6">
            Create a personal project
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-brand-gray mb-1"
                >
                Name your project
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full max-h-[15vh] px-4 py-3 border ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-yellow text-brand-black shadow-inner transition-colors`}
                  placeholder="Project name"
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
                      className="block text-sm font-medium text-brand-gray"
                    >
                      What are you trying to achieve?
                    </label>
                    <button
                      type="button"
                      onClick={toggleExamples}
                      className="ml-2 text-brand-gray hover:text-brand-black focus:outline-none"
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
                        ? "bg-gray-500"
                        : form.description.length < 50
                        ? "bg-gray-400 cursor-not-allowed opacity-70"
                        : "bg-brand-yellow hover:bg-brand-yellow/80"
                    } text-brand-black text-xs font-medium rounded flex items-center group relative`}
                  >
                    {enhancingIdea ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4">
                          <div className="h-full w-full rounded-full border-2 border-b-transparent border-brand-black"></div>
                        </div>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <RiRobot2Fill className="h-3.5 w-3.5 mr-1" />
                        Enhance My Idea
                      </>
                    )}
                    {form.description.length < 40 && !enhancingIdea && (
                      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-white text-xs text-brand-gray px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Min. 40 characters needed ({form.description.length}/40)
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
                      : "border-gray-300"
                  } rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-yellow text-brand-black min-h-[15vh] max-h-[30vh] resize-none shadow-inner transition-colors`}
                  placeholder="Describe your project idea in detail (e.g., what it does, type of project, key features)"
                />
                {formErrors.description ? (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.description}
                  </p>
                ) : promptMessage ? (
                  <p className="mt-1 text-xs text-brand-gray italic">
                    {promptMessage}
                  </p>
                ) : null}

                {showExamples && (
                  <div className="mt-2 mb-4 bg-white border border-gray-200 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-brand-black uppercase tracking-wider">
                        Examples
                      </h4>
                      <button
                        onClick={toggleExamples}
                        className="text-brand-gray hover:text-brand-black focus:outline-none"
                        aria-label="Close examples"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-brand-gray text-xs font-medium mb-1">
                          Basic (Not recommended):
                        </p>
                        <div className="p-2 bg-gray-100 rounded border border-gray-200 text-brand-gray text-xs">
                          "A workout tracker app"
                        </div>
                      </div>

                      <div>
                        <p className="text-brand-gray text-xs font-medium mb-1">
                          Good (Recommended):
                        </p>
                        <div className="p-2 bg-gray-100 rounded border border-gray-200 text-brand-gray text-xs">
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
                  <div className="mt-2 mb-4 bg-white border border-gray-200 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-brand-black uppercase tracking-wider">
                        Enhanced Project Idea
                      </h4>
                      <button
                        onClick={() => setShowEnhancer(false)}
                        className="text-brand-gray hover:text-brand-black focus:outline-none"
                        aria-label="Close enhancer"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {enhancedIdea ? (
                        <>
                          <div className="p-2 bg-gray-100 rounded border border-gray-200 text-brand-gray text-xs">
                            <textarea
                              value={editableEnhancedIdea || ""}
                              onChange={(e) =>
                                setEditableEnhancedIdea(e.target.value)
                              }
                              className="w-full bg-gray-100 text-brand-gray text-xs border-none focus:outline-none focus:ring-0 min-h-[30vh] max-h-[30vh] resize-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={acceptEnhancedIdea}
                            className="w-full py-1.5 bg-brand-yellow hover:bg-brand-yellow/80 text-brand-black text-xs font-medium rounded"
                          >
                            Use This Enhanced Description
                          </button>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-brand-gray text-xs">
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
                  className="block text-sm font-medium text-brand-gray mb-1"
                >
                  What's your priority for this project?
                </label>
                <div className="relative" ref={searchInputRef}>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {form.priority?.startsWith("Speed") && (
                      <BsLightningChargeFill className="h-4 w-4 text-brand-yellow" />
                    )}
                    {form.priority?.startsWith("Scalability") && (
                      <RiScalesFill className="h-4 w-4 text-brand-yellow" />
                    )}
                    {form.priority?.startsWith("Learning") && (
                      <PiBookFill className="h-4 w-4 text-brand-yellow" />
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
                        : "border-gray-300"
                    } border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-yellow text-brand-black shadow-inner transition-colors`}
                  />

                  {showPriorityDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <ul>
                        <li
                          className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm text-brand-gray flex items-center justify-between"
                          onClick={() =>
                            handlePriorityChange(
                              "Speed (Ship fast, even if basic)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <BsLightningChargeFill className="h-3.5 w-3.5 mr-3 text-brand-yellow" />
                            <div>
                              <div className="font-medium text-brand-black">Speed</div>
                              <div className="text-xs text-brand-gray">
                                Ship fast, even if basic
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Speed (Ship fast, even if basic)" && (
                            <FaCheck className="text-brand-yellow" size={12} />
                          )}
                        </li>
                        <li
                          className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm text-brand-gray flex items-center justify-between border-t border-gray-200"
                          onClick={() =>
                            handlePriorityChange(
                              "Scalability (Build for future growth)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <RiScalesFill className="h-3.5 w-3.5 mr-3 text-brand-yellow" />
                            <div>
                              <div className="font-medium text-brand-black">Scalability</div>
                              <div className="text-xs text-brand-gray">
                                Build for future growth
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Scalability (Build for future growth)" && (
                            <FaCheck className="text-brand-yellow" size={12} />
                          )}
                        </li>
                        <li
                          className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm text-brand-gray flex items-center justify-between border-t border-gray-200"
                          onClick={() =>
                            handlePriorityChange(
                              "Learning (Optimize for skill development)"
                            )
                          }
                        >
                          <div className="flex items-center">
                            <PiBookFill className="h-3.5 w-3.5 mr-3 text-brand-yellow" />
                            <div>
                              <div className="font-medium text-brand-black">Learning</div>
                              <div className="text-xs text-brand-gray">
                                Optimize for skill development
                              </div>
                            </div>
                          </div>
                          {form.priority ===
                            "Learning (Optimize for skill development)" && (
                            <FaCheck className="text-brand-yellow" size={12} />
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
                className="mr-2 px-4 py-2 text-brand-gray hover:text-brand-black font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/80 text-brand-black font-medium rounded-lg shadow-lg transition-colors"
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
