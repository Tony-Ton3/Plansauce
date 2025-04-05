import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setTasksSuccess, setTasksFailure } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import { getTasks, enhanceProjectIdea } from "../utils/api.jsx";

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

  const [isLoading, setIsLoading] = useState(false);
  const [enhancingIdea, setEnhancingIdea] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [promptMessage, setPromptMessage] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [enhancedIdea, setEnhancedIdea] = useState("");
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [editableEnhancedIdea, setEditableEnhancedIdea] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects } = useSelector((state) => state.projects || { projects: [] });

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
      setPromptMessage("Adding specific features will help create better task breakdowns");
    } else if (description.length < 100 && !description.toLowerCase().includes("feature")) {
      setPromptMessage("Consider mentioning 2-3 key features you'd like to include");
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
    localStorage.removeItem("projectForm");
  };

  const handleInputChange = (id, value) => {
    setForm((prev) => ({...prev, [id]: value}));
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
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
    setShowEnhancer(true);
    enhanceIdea();
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Project name is required";
    if (!form.description.trim()) errors.description = "Project description is required";
    if (!form.priority) errors.priority = "Project priority is required";
    return errors;
  };

  const enhanceIdea = async () => {
    setEnhancingIdea(true);
    
    try {
      // Send the current description to the backend API
      const response = await enhanceProjectIdea(form.description);
      
      if (response && response.enhancedDescription) {
        const enhancedDescription = response.enhancedDescription;
        
        console.log("Received enhanced description:", enhancedDescription);
        
        // Extract features if they exist in the response
        if (response.suggestedFeatures && Array.isArray(response.suggestedFeatures)) {
          setSuggestedFeatures(response.suggestedFeatures.map(feature => ({ 
            text: feature, 
            included: true 
          })));
          console.log("Extracted features from API response:", response.suggestedFeatures);
        } 
        // Otherwise try to extract them from the text
        else {
          const featuresStart = enhancedDescription.indexOf("Key Features:");
          const featuresEnd = enhancedDescription.indexOf("Target Audience:");
          
          if (featuresStart !== -1 && featuresEnd !== -1) {
            const featuresText = enhancedDescription.substring(featuresStart + 12, featuresEnd).trim();
            const featuresArray = featuresText.split("-")
              .map(feature => feature.trim())
              .filter(feature => feature.length > 0)
              .map(feature => ({ text: feature, included: true }));
            
            setSuggestedFeatures(featuresArray);
            console.log("Extracted features from text:", featuresArray);
          }
        }
        
        setEnhancedIdea(enhancedDescription);
        setEditableEnhancedIdea(enhancedDescription);
        console.log("Updated enhancedIdea");
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error enhancing idea:", error);
      
      // Fallback to sample data if API fails
      console.log("Using fallback sample data");
      const sampleDescription = `A task management application designed specifically for freelancers juggling multiple clients and projects. This app focuses on organizing projects by client, setting custom deadlines, and tracking billable hours.

Key Features:
- Client-based project organization
- Customizable deadline reminders
- Time tracking with billable hour calculation
- Invoice generation based on tracked time
- Calendar view with deadline visualization
- Task prioritization system

Target Audience: Freelancers, contractors, and solo entrepreneurs who need to manage time across multiple clients and projects.

Implementation would require a database to store client and project information, a time tracking system, notification functionality, and possibly calendar integration. The UI should emphasize quick task entry and clear visualization of upcoming deadlines.`;
      
      setEnhancedIdea(sampleDescription);
      setEditableEnhancedIdea(sampleDescription);
      
      const featuresStart = sampleDescription.indexOf("Key Features:");
      const featuresEnd = sampleDescription.indexOf("Target Audience:");
      
      if (featuresStart !== -1 && featuresEnd !== -1) {
        const featuresText = sampleDescription.substring(featuresStart + 12, featuresEnd).trim();
        const featuresArray = featuresText.split("-")
          .map(feature => feature.trim())
          .filter(feature => feature.length > 0)
          .map(feature => ({ text: feature, included: true }));
        
        setSuggestedFeatures(featuresArray);
      }
      
      alert("Could not connect to the enhancement service. Using a sample enhancement instead.");
    } finally {
      setEnhancingIdea(false);
    }
  };

  const acceptEnhancedIdea = () => {
    handleInputChange("description", editableEnhancedIdea);
    setShowEnhancer(false);
    setSuggestedFeatures([]);
    setEnhancedIdea("");
    setEditableEnhancedIdea("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorId = Object.keys(errors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setIsLoading(true);
      const apiForm = {
        name: form.name,
        description: form.description,
        priority: form.priority
      };
      
      const response = await getTasks(apiForm);

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
        category: task.category || 'plan',
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
          name: form.name || response.projectName,
          description: form.description,
          priority: form.priority,
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

  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
  //       <div className="flex flex-col justify-center items-center bg-gray-600 rounded-lg p-6 text-center">
  //         <h2 className="px-3 py-1 text-xl font-bold text-background flex">
  //           Thinking<span className="dots-loading">...</span>
  //         </h2>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-neutral-900 min-h-screen flex justify-center p-10">
      <div className="w-full max-w-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-neutral-100 mb-6">Create a personal project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">
                  What are you working on?
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full max-h-[15vh] px-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-neutral-600'} rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 shadow-inner transition-colors`}
                  placeholder="Name your project"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <label htmlFor="description" className="block text-sm font-medium text-neutral-300">
                      What are you trying to achieve?
                    </label>
                    <button 
                      type="button"
                      onClick={toggleExamples}
                      className="ml-2 text-neutral-400 hover:text-neutral-200 focus:outline-none"
                      aria-label="Show examples"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggleEnhancer}
                    disabled={enhancingIdea || form.description.length < 50}
                    className={`px-3 py-1 ${
                      enhancingIdea 
                        ? 'bg-blue-500' 
                        : form.description.length < 50
                          ? 'bg-blue-400 cursor-not-allowed opacity-70'
                          : 'bg-blue-600 hover:bg-blue-700'
                    } text-white text-xs font-medium rounded flex items-center group relative`}
                  >
                    {enhancingIdea ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
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
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`w-full px-4 py-3 border ${formErrors.description ? 'border-red-500' : 'border-neutral-600'} rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-100 min-h-[15vh] max-h-[30vh] resize-none shadow-inner transition-colors`}
                  placeholder="Describe your project idea in detail (e.g., what it does, type of project, key features)"
                />
                {formErrors.description ? (
                  <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
                ) : promptMessage ? (
                  <p className="mt-1 text-xs text-amber-400 italic">{promptMessage}</p>
                ) : null}

                {showExamples && (
                  <div className="mt-2 mb-4 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Examples</h4>
                      <button 
                        onClick={toggleExamples}
                        className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                        aria-label="Close examples"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-neutral-400 text-xs font-medium mb-1">Basic (Not recommended):</p>
                        <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                          "A workout tracker app"
                        </div>
                      </div>

                      <div>
                        <p className="text-neutral-400 text-xs font-medium mb-1">Good (Recommended):</p>
                        <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                          "A mobile workout tracker app where users can log exercises, track progress over time, and get recommendations for new routines based on their goals. Should include a calendar view and achievement badges."
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Idea Section - Expandable */}
                {showEnhancer && (
                  <div className="mt-2 mb-4 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Enhanced Project Idea</h4>
                      <button 
                        onClick={() => setShowEnhancer(false)}
                        className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                        aria-label="Close enhancer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {enhancedIdea ? (
                        <>
                          <div className="p-2 bg-neutral-700 rounded border border-neutral-600 text-neutral-300 text-xs">
                            <textarea
                              value={editableEnhancedIdea}
                              onChange={(e) => setEditableEnhancedIdea(e.target.value)}
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
                          <p className="text-neutral-400 text-xs">Generating enhanced description...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-neutral-300 mb-1">
                  What's your priority for this project?
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className={`block w-full px-4 py-3 ${formErrors.priority ? 'border-red-500' : 'border-neutral-600'} border rounded-lg bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none ${!form.priority ? 'text-neutral-400 text-opacity-60' : 'text-neutral-100'} text-sm shadow-inner transition-colors`}
                  >
                    <option value="" className="text-neutral-400 opacity-60">Select your priority</option>
                    <option value="Speed">Speed (Ship fast, even if basic)</option>
                    <option value="Scalability">Scalability (Build for future growth)</option>
                    <option value="Learning">Learning (Optimize for skill development)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {formErrors.priority && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.priority}</p>
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
                Create project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectInput;