import { useState, useRef, useEffect } from "react";
import { FaCheckCircle, FaRegCircle, FaBox, FaGripLines, 
  FaTimes, FaPlus, FaChevronDown, FaUser, FaChevronRight, 
  FaCode, FaBook, FaLink, FaRocket,  FaDatabase, 
  FaGraduationCap,  FaWrench, FaCalendarAlt, FaChevronUp } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import  Subtask  from "../components/Subtask";
import TaskActionPanel from "../components/TaskActionPanel";
import { RiCloudyLine } from "react-icons/ri";

const PROJECT_CATEGORIES = [
  { id: "all", name: "All", description: "All tasks" },
  { id: 'planning', name: 'Plan', description: 'Initial requirements, user flows, architecture ideas, wireframes' },
  { id: 'setup', name: 'Setup', description: 'Environment configuration, repository initialization, installing core tools' },
  { id: 'frontend', name: 'Frontend', description: 'User interface development, client-side logic' },
  { id: 'backend', name: 'Backend', description: 'Server-side logic, API development, database interactions' },
  { id: 'testing', name: 'Testing', description: 'Writing tests, quality assurance checks' },
  { id: 'deploy', name: 'Deploy', description: 'Infrastructure setup, deployment process, going live' },
  { id: 'maintain', name: 'Maintain', description: 'Monitoring, updates, bug fixes after launch' },
];

const Task = ({ task, index, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [checkAnimation, setCheckAnimation] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const deleteTimerRef = useRef(null);
  
  const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleTaskClick = (e) => {
    // if (
    //   e.target.closest('button') || 
    //   e.target.closest('[role="button"]') || 
    //   e.target.closest('[aria-label]')
    // ) {
    //   return;
    // }
    
    //simply expand/collapse on click
    setExpanded(!expanded);
  };

  //handle action button for tasks - task breakdown, smart prompt, resources
  const handleActionButton = (action) => {
    setSelectedSubtask(null); //reset any selected subtask
    setActiveAction(action);
    setShowActionPanel(true);
  };
  
  //handle subtask selection - implementation guide, technical prompt, development resources
  const handleSelectSubtask = (subtask, parentId, parentText, action = null) => {
    setSelectedSubtask(subtask);
    setActiveAction(action || 'implementation'); // Default to implementation if no action specified
    setShowActionPanel(true);
  };
  
  //close action panel
  const closeActionPanel = () => {
    setShowActionPanel(false);
    setActiveAction(null);
    setSelectedSubtask(null);
  };
  
  //handle delete click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    
    if (deleteConfirm) {
      //already in delete confirm state, so actually delete
      deleteTask(task.id);
      clearTimeout(deleteTimerRef.current);
    } else {
      //start delete confirmation UI
      setDeleteConfirm(true);
      
      //auto-reset after 5 seconds
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
    }
  };
  
  //cancel delete
  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirm(false);
    clearTimeout(deleteTimerRef.current);
  };
  
  //clean up timer on unmount
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  //handle task completion (simplified and foolproof)
  const handleTaskCompletion = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const taskId = task._id;
    
    setCheckAnimation(true);
    setTimeout(() => {
      setCheckAnimation(false);
    }, 600);
    
    toggleTaskCompletion(taskId);
  };

  return (
    <div className="relative group/task">
      <div 
        ref={ref}
        className={`bg-white ${deleteConfirm ? 'bg-brand-pink/5' : 'hover:bg-gray-50'} rounded-lg px-6 py-2 mb-1 flex items-center gap-6 ${
          deleteConfirm ? 'shadow-sm shadow-brand-pink/10' : ''
        } transition-all duration-200 group`}
        onClick={handleTaskClick}
      >
        {/* task checkbox */}
        <div 
          onDoubleClick={(e) => {
            e.stopPropagation(); 
            handleTaskCompletion(e);
          }}
          className={`flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative
            ${checkAnimation ? 'scale-110 bg-brand-yellow/20' : 'hover:bg-gray-100'}`}
          role="button"
          aria-label={task.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
          title={task.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
          data-task-id={task.id}
        >
          {task.completed ? (
            <div className="relative">
              <FaCheckCircle className="text-lg text-brand-yellow" />
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${checkAnimation ? 'opacity-100' : 'opacity-0'}`}>
                <span className="animate-ping absolute h-3 w-3 rounded-full bg-brand-yellow opacity-75"></span>
              </span>
            </div>
          ) : (
            <div className="relative">
              <FaRegCircle className="text-lg text-brand-gray hover:text-gray-400 transition-colors" />
              <span className={`absolute inset-0 flex items-center justify-center text-white transition-transform origin-center ${checkAnimation ? 'scale-100' : 'scale-0'} duration-300`}>
                <FiCheck className="text-xs" />
              </span>
            </div>
          )}
        </div>
        
        {/* task name */}
        <div className="flex-grow flex items-center cursor-pointer">
          <p className={`${task.completed ? 'line-through text-brand-gray' : 'text-brand-black'} text-sm mr-6 transition-all duration-300 ${checkAnimation ? 'transform translate-y-0.5' : ''}`}>
            {task.text}
          </p>
          
          {/* completion confetti effect */}
          {checkAnimation && !task.completed && (
            <div className="absolute left-6 -top-1 overflow-hidden h-6">
              <div className="animate-confetti-1 absolute w-1 h-1 rounded-full bg-brand-yellow"></div>
              <div className="animate-confetti-2 absolute w-1 h-1 rounded-full bg-brand-yellow delay-75"></div>
              <div className="animate-confetti-3 absolute w-1 h-1 rounded-full bg-brand-yellow delay-150"></div>
            </div>
          )}
        </div>
        
        {/* right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* task action button - Get Prompt */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleActionButton('prompt');
            }}
            className="px-2 py-1 rounded-md text-xs bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20 transition-colors group/tooltip relative flex items-center gap-1 opacity-0 group-hover/task:opacity-100"
          >
            <span>Get Prompt</span>
          </button>
        
          {/* subtask indicator and toggle */}
          {task.subtasks && task.subtasks.length > 0 && (
            <button 
              onClick={toggleExpand}
              className="flex items-center gap-1.5 min-w-[40px] justify-end text-xs text-brand-gray hover:text-brand-black transition-colors group/tooltip relative"
              title={expanded ? "Hide subtasks" : "Show subtasks"}
            >
              <span className="flex items-center gap-1">
                <span className="text-brand-gray/60">{completedSubtasks}/{totalSubtasks}</span>
                {expanded ? 
                  <FaChevronDown className="text-xs" /> : 
                  <FaChevronRight className="text-xs" />
                }
              </span>
            </button>
          )}
          
          {/* task controls */}
          {!deleteConfirm ? (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
              <button 
                onClick={handleDeleteClick}
                className="text-brand-gray hover:text-brand-pink transition-colors"
                aria-label="Delete task"
                title="Delete task"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 animate-pulse pl-1">
              <button
                onClick={cancelDelete}
                className="px-2 py-1 text-xs font-medium text-brand-black bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClick}
                className="px-2 py-1 text-xs font-medium text-white bg-brand-pink rounded hover:bg-brand-pink/90 shadow-sm shadow-brand-pink/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* subtasks accordion panel */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-96 mt-1' : 'max-h-0'
          }`}
        >
          <div className="pl-8 space-y-0.5">
            {task.subtasks.map((subtask, i) => (
              <Subtask
                key={subtask.id}
                subtask={subtask}
                parentId={task.id}
                parentText={task.text}
                toggleSubtaskCompletion={toggleSubtaskCompletion}
                onSelectSubtask={handleSelectSubtask}
              />
            ))}
          </div>
        </div>
      )}

      {/* action panel for task or subtask - with different options for each */}
      <TaskActionPanel 
        isOpen={showActionPanel}
        onClose={closeActionPanel}
        action={activeAction || (selectedSubtask ? 'implementation' : 'breakdown')}
        task={task}
        subtask={selectedSubtask}
        parentTask={selectedSubtask ? task.text : null}
      />
    </div>
  );
};

// Phase Navigation component with counts - rename to CategoryNavigation
const CategoryNavigation = ({ categories, currentCategory, onChange}) => {
  const getCategoryStyle = (categoryId) => {
    switch (categoryId) {
      case 'planning':
        return 'bg-blue-500/10 text-blue-500';
      case 'setup':
        return 'bg-purple-500/10 text-purple-500';
      case 'frontend':
        return 'bg-blue-400/10 text-blue-400';
      case 'backend':
        return 'bg-indigo-500/10 text-indigo-500';
      case 'testing':
        return 'bg-amber-500/10 text-amber-500';
      case 'deploy':
        return 'bg-red-500/10 text-red-500';
      case 'maintain':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-100/80 text-gray-900';
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto flex items-center gap-2 px-8 py-1">
        {/* All category button */}
        <button
          onClick={() => onChange("all")}
          className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            currentCategory === "all"
              ? 'bg-gray-100/80 text-gray-900'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/80'
          }`}
        >
          All Tasks
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200/80 mx-2" />
        
        {/* Other categories */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.filter(category => category.id !== "all").map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={`relative py-2 px-3 text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                currentCategory === category.id 
                  ? getCategoryStyle(category.id)
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/80'
              }`}
              title={category.description}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryEmptyState = ({ category, setIsComposing }) => {
  const currentCategory = PROJECT_CATEGORIES.find(c => c.id === category);
  
  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-brand-black mb-2">No tasks in {currentCategory.name}</h3>
      <p className="text-brand-gray mb-4">{currentCategory.description}</p>
      <button 
        onClick={() => setIsComposing(true)}
        className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black rounded-full px-4 py-2 transition-colors shadow-lg shadow-brand-yellow/20"
      >
        <FaPlus size={12} />
        <span>Add a task to this category</span>
      </button>
    </div>
  );
};

const TechnologyCard = ({ icon, name, description, docLink, category }) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'planning':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'setup':
        return <FaBox className="text-purple-500" />;
      case 'frontend':
        return <FaUser className="text-blue-400" />;
      case 'backend':
        return <FaDatabase className="text-indigo-500" />;
      case 'testing':
        return <FaCode className="text-amber-500" />;
      case 'deploy':
        return <FaRocket className="text-red-500" />;
      case 'maintain':
        return <FaWrench className="text-gray-500" />;
      
      default:
        return <FaGraduationCap className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
          {icon || getCategoryIcon()}
        </div>
        <div className="flex-grow">
          <h4 className="text-base font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          
          <div className="mt-3 space-y-2">
            {docLink && (
              <a 
                href={docLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                <FaBook className="text-xs" />
                <span>Helpful link</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcesModal = ({ isOpen, onClose, techStackData, isLoading, currentProject }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      console.log("TechStackModal opened with data:", techStackData);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, techStackData]);

  if (!isOpen) return null;

  // Debug output for tech stack data
  const debugOutput = () => {
    if (!techStackData) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">Tech stack data is undefined or null</p>
        </div>
      );
    }
    
    if (typeof techStackData !== 'object') {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">Tech stack data is not an object: {typeof techStackData}</p>
        </div>
      );
    }
    
    return null;
  };

  const renderTechSection = (title, techs, category) => {
    if (!techs || techs.length === 0) return null;

    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {techs.map((tech, index) => (
            <TechnologyCard
              key={`${category}-${index}`}
              name={tech.name}
              
              description={tech.description}
              docLink={tech.documentationUrl || tech.docLink}
              category={category}
            />
          ))}
        </div>
      </div>
    );
  };



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl animate-fadeIn overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Personalized Resources</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <p>
                Curated resources for an {currentProject?.type || 'Task Management App'} with focus on {currentProject?.priority || 'Developer Productivity'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Debug information */}
              {debugOutput()}
              
              {techStackData && typeof techStackData === 'object' ? (
                <div className="space-y-8">
                  {renderTechSection('Planning', techStackData.planning, 'planning')}
                  {renderTechSection('Setup', techStackData.setup, 'setup')}
                  {renderTechSection('Frontend', techStackData.frontend, 'frontend')}
                  {renderTechSection('Backend', techStackData.backend, 'backend')}
                  {renderTechSection('Testing', techStackData.testing, 'testing')}
                  {renderTechSection('Deployment', techStackData.deploy, 'deploy')}
                  {renderTechSection('Maintenance', techStackData.maintain, 'maintain')}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No resources available</p>
                  <p className="text-xs mt-2">Please create a new project to get resources</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};



function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [currentCategory, setCurrentCategory] = useState('planning');
  const [newTaskCategory, setNewTaskCategory] = useState('planning');
  const [categoryTaskCounts, setCategoryTaskCounts] = useState({});
  const [showTechStack, setShowTechStack] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { currentTasks, loading: reduxLoading, error: reduxError } = useSelector((state) => state.tasks);
  const { currentProject } = useSelector((state) => state.projects);
  const dispatch = useDispatch();
  
  // Add detailed logging for currentProject
  useEffect(() => {
    console.log("Full Current Project:", currentProject);
    console.log("Project Tech Stack:", currentProject?.techStack);
    console.log("Project Priority:", currentProject?.priority);
    console.log("Project Description:", currentProject?.description);
  }, [currentProject]);

  // Add logging for modal state
  useEffect(() => {
    if (showTechStack) {
      console.log("Modal State - Show Tech Stack:", showTechStack);
      console.log("Modal State - Current Project:", currentProject);
      console.log("Modal State - Tech Stack Data:", currentProject?.techStack);
    }
  }, [showTechStack, currentProject]);

  // Setup initial tasks
  useEffect(() => {
    if (currentTasks) {
      // Initialize category for new tasks if needed
      const tasksWithCategories = currentTasks.map(task => ({
        ...task,
        category: task.category || 'planning' // Default to planning category if not specified
      }));
      setTasks(tasksWithCategories);
      setLoading(false);
    } else {
      setLoading(reduxLoading);
    }
    
    if (reduxError) {
      setError(reduxError);
    }
  }, [currentTasks, reduxLoading, reduxError]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const counts = {};
      
      PROJECT_CATEGORIES.forEach(category => {
        const categoryTasks = tasks.filter(task => task.category === category.id);
        const completed = categoryTasks.filter(task => task.completed).length;
        
        counts[category.id] = {
          total: categoryTasks.length,
          completed
        };
      });
      
      setCategoryTaskCounts(counts);
    }
  }, [tasks]);

  const toggleTaskCompletion = (taskId) => {
    if (!taskId) {
      console.error("No task ID provided");
      return;
    }

    setTasks(prevTasks => {
      return prevTasks.map(task => {
        const taskIdentifier = task._id;
        
        if (taskIdentifier === taskId) {
          const updatedTask = {
            ...task,
            completed: !task.completed,
            subtasks: task.subtasks?.map(subtask => ({
              ...subtask,
              completed: !task.completed
            }))
          };
          return updatedTask;
        }
        return task;
      });
    });
  };
  
  const toggleSubtaskCompletion = (parentId, subtaskId) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === parentId) {
          //update the subtask
          const updatedSubtasks = task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          
          //check if all subtasks are now completed
          const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
          
          //check if the current subtask is being unchecked
          const currentSubtask = task.subtasks.find(st => st.id === subtaskId);
          const isUnchecking = currentSubtask && currentSubtask.completed;
          
          //return updated task - mark as incomplete if a subtask is being unchecked
          return { 
            ...task, 
            subtasks: updatedSubtasks,
            //if any subtask is unchecked, the task should be marked incomplete
            //if all subtasks are completed, the task should be marked complete
            completed: isUnchecking ? false : allSubtasksCompleted
          };
        }
        return task;
      });
    });
  };
  
  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  const addNewTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    setTasks(prevTasks => [
      ...prevTasks,
      { 
        id: Date.now().toString(), 
        text: newTask, 
        completed: false,
        category: newTaskCategory,
        subtasks: []
      }
    ]);
    
    setNewTask('');
    setIsComposing(false);
  };

  // Filter tasks by current category
  const currentCategoryTasks = currentCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === currentCategory);
  
  // Count completed tasks in current category
  const completedTasksCount = currentCategoryTasks.filter(task => task.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-brand-black">
        <div className="max-w-4xl mx-auto pt-12 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-brand-yellow/20 mb-4"></div>
              <div className="text-brand-yellow font-medium">Loading tasks...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-brand-black">
        <div className="max-w-4xl mx-auto pt-12 px-4">
          <div className="bg-brand-pink/20 border border-brand-pink rounded-lg p-4 mb-8">
            <h2 className="text-brand-pink font-medium mb-2">Error Loading Tasks</h2>
            <p className="text-brand-black">{error}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/projectinput'} 
            className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black px-4 py-2 rounded-lg"
          >
            Return to Project Input
          </button>
        </div>
      </div>
    );
  }

  // Check if there are tasks in the component state OR in Redux state
  const hasTasks = (tasks && tasks.length > 0) || (currentTasks && currentTasks.length > 0);
  
  // We'll render the UI even if there are no tasks, as we want to show category navigation

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Wrapper for both header and nav to handle sticky behavior together */}
      <div className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex flex-col max-w-3xl flex-grow cursor-pointer group/expand"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
                    {currentProject?.name}
                    <span className="text-gray-400 group-hover/expand:text-gray-600 transition-colors">
                      {showFullDescription ? (
                        <FaChevronDown className="mt-1 text-lg" />
                      ) : (
                        <FaChevronRight className="mt-1 text-lg" />
                      )}
                    </span>
                  </h1>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-32' : 'max-h-6'}`}>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {currentProject?.description}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTechStack(true);
                }}
                className="group relative inline-flex items-center gap-3 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow flex-shrink-0 overflow-hidden ml-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-indigo-400/0 group-hover:via-blue-400/10 transition-all duration-500"></div>
                <div className="relative flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg">
                    <RiCloudyLine className="text-blue-500 text-xl" />
                  </span>
                  <span className="text-gray-600 group-hover:text-gray-800">Resources</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation - now part of the sticky header wrapper */}
        {!loading && !error && (
          <div className="bg-white/50 backdrop-blur-lg border-b border-gray-100/50">
            <CategoryNavigation
              categories={PROJECT_CATEGORIES} 
              currentCategory={currentCategory} 
              onChange={setCurrentCategory}
            />
          </div>
        )}
      </div>
      
      <ResourcesModal 
        isOpen={showTechStack} 
        onClose={() => setShowTechStack(false)}
        techStackData={currentProject?.techStack || {
          frontend: [],
          backend: []
        }}
        isLoading={false}
        currentProject={currentProject}
      />
      
      <main className="flex-grow w-full max-w-5xl mx-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-brand-yellow animate-spin mr-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <span className="text-brand-gray">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="bg-brand-pink/10 border border-brand-pink/30 rounded-lg p-4 text-brand-pink">
            <p>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-brand-pink/20 hover:bg-brand-pink/30 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white/30 p-2 mb-6 min-h-[400px]">
              {currentCategoryTasks.length > 0 ? (
                <div className="space-y-6">
                  {currentCategory === 'all' ? (
                    // Group tasks by category when "All" is selected
                    PROJECT_CATEGORIES.filter(category => category.id !== 'all').map(category => {
                      const categoryTasks = tasks.filter(task => task.category === category.id);
                      if (categoryTasks.length === 0) return null;
                      
                      const completedCount = categoryTasks.filter(task => task.completed).length;
                      
                      return (
                        <div key={category.id} className="space-y-1">
                          <div className="flex items-center justify-between mb-2 group">
                            <div className="flex items-center gap-3">
                              <h2 className="text-lg font-medium text-gray-900">
                                {category.name}
                              </h2>
                            </div>
                            <div className="h-1 flex-grow mx-4 rounded-full bg-gray-100 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500/20 rounded-full transition-all duration-300"
                                style={{ width: `${(completedCount / categoryTasks.length) * 100}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-500">
                              {completedCount}/{categoryTasks.length} completed
                            </div>
                          </div>
                          <div className="space-y-1 pl-1">
                            {categoryTasks.map((task) => (
                              <Task
                                key={task.id}
                                task={task}
                                index={tasks.findIndex(t => t.id === task.id)}
                                toggleTaskCompletion={toggleTaskCompletion}
                                toggleSubtaskCompletion={toggleSubtaskCompletion}
                                deleteTask={deleteTask}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Single category view with header
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-2 group">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-medium text-gray-900">
                            {PROJECT_CATEGORIES.find(cat => cat.id === currentCategory)?.name}
                          </h2>
                        </div>
                        <div className="h-1 flex-grow mx-4 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500/20 rounded-full transition-all duration-300"
                            style={{ width: `${(completedTasksCount / currentCategoryTasks.length) * 100}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          {completedTasksCount}/{currentCategoryTasks.length} completed
                        </div>
                      </div>
                      <div className="space-y-1 pl-1">
                        {currentCategoryTasks.map((task) => (
                          <Task
                            key={task.id}
                            task={task}
                            index={tasks.findIndex(t => t.id === task.id)}
                            toggleTaskCompletion={toggleTaskCompletion}
                            toggleSubtaskCompletion={toggleSubtaskCompletion}
                            deleteTask={deleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CategoryEmptyState category={currentCategory} setIsComposing={setIsComposing} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Tasks;