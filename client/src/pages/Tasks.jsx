import { useState, useRef, useEffect } from "react";
import { FaCheckCircle, FaRegCircle, FaBox, FaGripLines, 
  FaTimes, FaPlus, FaChevronDown, FaUser, FaChevronRight, 
  FaCode, FaBook, FaLink, FaRocket,  FaDatabase, 
  FaGraduationCap,  FaWrench, FaCalendarAlt  } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import  Subtask  from "../components/Subtask";
import TaskActionPanel from "../components/TaskActionPanel";

const PROJECT_CATEGORIES = [
  { id: "all", name: "All", description: "All tasks" },
  { id: 'planning', name: 'Plan & Design', description: 'Initial requirements, user flows, architecture ideas, wireframes' },
  { id: 'setup', name: 'Setup', description: 'Environment configuration, repository initialization, installing core tools' },
  { id: 'frontend', name: 'Frontend', description: 'User interface development, client-side logic' },
  { id: 'backend', name: 'Backend', description: 'Server-side logic, API development, database interactions' },
  { id: 'testing', name: 'Testing', description: 'Writing tests, quality assurance checks' },
  { id: 'deploy', name: 'Deploy', description: 'Infrastructure setup, deployment process, going live' },
  { id: 'maintain', name: 'Maintain', description: 'Monitoring, updates, bug fixes after launch' },
];

const Task = ({ task, index, moveTask, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDropIndicator, setShowDropIndicator] = useState(false);
  const [checkAnimation, setCheckAnimation] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const deleteTimerRef = useRef(null);
  
  // //handle drag start
  const handleDragStart = (e) => {
    //set the drag data - store the task index
    e.dataTransfer.setData('text/plain', index.toString());
    
    //for Firefox - required for drag to work properly
    e.dataTransfer.effectAllowed = 'move';
    
    //add a small delay to allow the browser to render the ghost image
    setTimeout(() => {
      setIsDragging(true);
    }, 0);
  };
  
  //handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setShowDropIndicator(false);
  };
  
  //handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!showDropIndicator) {
      setShowDropIndicator(true);
    }
  };
  
  //handle drag leave
  const handleDragLeave = () => {
    setShowDropIndicator(false);
  };
  
  //handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setShowDropIndicator(false);
    
    //get the dragged item's index
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    //don't do anything if dropping on the same item
    if (draggedIndex === index) {
      return;
    }
    
    //perform the move
    moveTask(draggedIndex, index);
  };
  
  const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  //handle task click - now only expands/collapses
  const handleTaskClick = (e) => {
    //don't trigger task click when clicking on control buttons
    if (
      e.target.closest('button') || 
      e.target.closest('[role="button"]') || 
      e.target.closest('[aria-label]')
    ) {
      return;
    }
    
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
    <div 
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} relative group/task`}
    >
      {/* left-side drag handle and add indicator (visible on hover) */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center opacity-0 group-hover/task:opacity-100 transition-opacity -ml-10 px-2 gap-2">
        <div 
          className="w-4 h-2 bg-gray-800/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-700/80 cursor-grab transition-colors"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <FaGripLines className="size-3" />
        </div>
        <button
          className="w-4 h-4 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow hover:text-brand-yellow hover:bg-brand-yellow/30 transition-colors"
          title="Add subtask"
          aria-label="Add subtask"
          onClick={(e) => {
            e.stopPropagation();
            //future subtask implementation
          }}
        >
          <FaPlus className="size-3" />
        </button>
      </div>

      <div 
        ref={ref}
        draggable="true"
        className={`bg-white border ${deleteConfirm ? 'border-brand-pink/50' : 'border-gray-300'} rounded-lg p-3 mb-1 flex items-center gap-3 ${
          isDragging ? 'shadow-lg shadow-brand-yellow/10 cursor-grabbing' : (deleteConfirm ? 'shadow-md shadow-brand-pink/10' : 'hover:shadow-md hover:shadow-brand-yellow/5 cursor-grab')
        } transition-all duration-200 hover:border-gray-400 group`}
        onClick={handleTaskClick}
      >
        {/* task checkbox - very explicitly use the task ID */}
        <div 
          onDoubleClick={(e) => {
            e.stopPropagation(); 
            handleTaskCompletion(e);
          }}
          className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative
            ${checkAnimation ? 'scale-110 bg-brand-yellow/20' : 'hover:bg-gray-100'}`}
          role="button"
          aria-label={task.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
          title={task.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
          data-task-id={task.id}
        >
          {task.completed ? (
            <div className="relative">
              <FaCheckCircle className="text-xl text-brand-yellow" />
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${checkAnimation ? 'opacity-100' : 'opacity-0'}`}>
                <span className="animate-ping absolute h-4 w-4 rounded-full bg-brand-yellow opacity-75"></span>
              </span>
            </div>
          ) : (
            <div className="relative">
              <FaRegCircle className="text-xl text-brand-gray hover:text-gray-400 transition-colors" />
              <span className={`absolute inset-0 flex items-center justify-center text-white transition-transform origin-center ${checkAnimation ? 'scale-100' : 'scale-0'} duration-300`}>
                <FiCheck className="text-sm" />
              </span>
            </div>
          )}
        </div>
        
        {/* task name - no longer toggles task completion on click */}
        <div className="flex-grow flex items-center py-1.5 cursor-pointer">
          <p className={`${task.completed ? 'line-through text-brand-gray' : 'text-brand-black'} text-base mr-2 transition-all duration-300 ${checkAnimation ? 'transform translate-y-0.5' : ''}`}>
            {task.text}
          </p>
          
          {/* completion confetti effect - only shows during animation */}
          {checkAnimation && !task.completed && (
            <div className="absolute left-8 -top-1 overflow-hidden h-8">
              <div className="animate-confetti-1 absolute w-1.5 h-1.5 rounded-full bg-brand-yellow"></div>
              <div className="animate-confetti-2 absolute w-1.5 h-1.5 rounded-full bg-brand-yellow delay-75"></div>
              <div className="animate-confetti-3 absolute w-1.5 h-1.5 rounded-full bg-brand-yellow delay-150"></div>
            </div>
          )}
        </div>
        
        {/* right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* task action buttons - Task Breakdown, Smart Prompt, Resources */}
          <div className="flex gap-1.5 mr-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActionButton('breakdown');
              }}
              className="p-1.5 text-xs bg-brand-yellow/10 text-brand-yellow rounded-full hover:bg-brand-yellow/20 transition-colors group/tooltip relative"
              aria-label="Task Breakdown"
              title="Task Breakdown"
            >
              <FaCode />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">Task Breakdown</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActionButton('prompt');
              }}
              className="p-1.5 text-xs bg-brand-pink/10 text-brand-pink rounded-full hover:bg-brand-pink/20 transition-colors group/tooltip relative"
              aria-label="Smart Prompt"
              title="Smart Prompt"
            >
              <FaBook />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">Smart Prompt</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActionButton('resources');
              }}
              className="p-1.5 text-xs bg-brand-yellow/10 text-brand-yellow rounded-full hover:bg-brand-yellow/20 transition-colors group/tooltip relative"
              aria-label="Resources"
              title="Resources"
            >
              <FaLink />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">Resources</span>
            </button>
          </div>
        
          {/* subtask indicator and toggle */}
          {task.subtasks && task.subtasks.length > 0 && (
            <button 
              onClick={toggleExpand}
              className="flex items-center gap-1 text-xs text-brand-gray hover:text-brand-black transition-colors group/tooltip relative"
              title={expanded ? "Hide subtasks" : "Show subtasks"}
            >
              <span>{completedSubtasks}/{totalSubtasks}</span>
              <span>
                {expanded ? 
                  <FaChevronDown className="text-xs" /> : 
                  <FaChevronRight className="text-xs" />
                }
              </span>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">{expanded ? "Hide subtasks" : "Show subtasks"}</span>
            </button>
          )}
          
          {/* task controls */}
          {!deleteConfirm ? (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleDeleteClick}
                className="text-brand-gray hover:text-brand-pink transition-colors group/tooltip relative"
                aria-label="Delete task"
                title="Delete task"
              >
                <FaTimes />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">Delete task</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-pulse">
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

      {/* bottom drop indicator line */}
      {showDropIndicator && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-yellow translate-y-0.5 rounded-full shadow-[0_0_8px_rgba(255,200,0,0.5)] z-10" />
      )}
      
      {/* subtasks accordion panel */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 mb-3 ml-6 pl-4 border-l border-gray-300 ${
            expanded ? 'max-h-96 py-2' : 'max-h-0 py-0 border-l-transparent'
          }`}
        >
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
  return (
    <div className="w-full bg-white">
      <div className="max-w-3xl mx-auto flex items-center gap-6 overflow-x-auto px-4 relative">
        {/* Top border that spans full width */}
        <div className="absolute top-0 inset-x-0 h-px bg-gray-200" />
        {/* Bottom border that spans full width */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gray-200" />
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              currentCategory === category.id 
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title={category.description}
          >
            <span>{category.name}</span>
            {/* Active indicator line */}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transition-opacity ${
              currentCategory === category.id ? 'opacity-100' : 'opacity-0'
            }`} />
          </button>
        ))}
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
      <div ref={modalRef} className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-4xl animate-fadeIn overflow-hidden">
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
  
  const moveTask = (fromIndex, toIndex) => {
    setTasks(prevTasks => {
      // Create a copy of the tasks array
      const updatedTasks = [...prevTasks];
      
      // Remove the task from the original position
      const [movedTask] = updatedTasks.splice(fromIndex, 1);
      
      // Insert the task at the new position
      updatedTasks.splice(toIndex, 0, movedTask);
      
      return updatedTasks;
    });
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
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-brand-black">
              {currentProject?.name}
            </h1>
            <button
              onClick={() => setShowTechStack(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow"
            >
              <FaRocket className="text-brand-yellow text-sm" />
              <span>See Resources</span>
            </button>
          </div>
        </div>
      </header>
      
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
      
      {!loading && !error && (
        <CategoryNavigation
          categories={PROJECT_CATEGORIES} 
          currentCategory={currentCategory} 
          onChange={setCurrentCategory}
        />
      )}
        
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 pb-16">
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
            <div className="bg-white/30 border border-gray-100 rounded-md p-2 mb-6 min-h-[400px]">
              {currentCategoryTasks.length > 0 ? (
                <div className="space-y-1">
                  {currentCategoryTasks.map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      index={tasks.findIndex(t => t.id === task.id)}
                      moveTask={moveTask}
                      toggleTaskCompletion={toggleTaskCompletion}
                      toggleSubtaskCompletion={toggleSubtaskCompletion}
                      deleteTask={deleteTask}
                    />
                  ))}
                </div>
              ) : (
                <CategoryEmptyState category={currentCategory} setIsComposing={setIsComposing} />
              )}
            </div>
          </>
        )}
      </main>
        
      {/* Compose area - Add task dialog */}
      {/* {isComposing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-xl shadow-xl w-full max-w-lg animate-fadeIn">
            <form onSubmit={addNewTask}>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-brand-black">Create New Task</h2>
                
                <div>
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-brand-gray mb-1">
                    Task Title
                  </label>
                  <input
                    id="taskTitle"
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-brand-black placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="taskCategory" className="block text-sm font-medium text-brand-gray mb-1">
                    Task Category
                  </label>
                  <select
                    id="taskCategory"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                  >
                    {PROJECT_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-brand-gray">
                    {PROJECT_CATEGORIES.find(c => c.id === newTaskCategory)?.description}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-300 px-6 py-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-brand-gray hover:text-brand-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTask.trim()}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    newTask.trim() 
                      ? 'bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 shadow-lg shadow-brand-yellow/20' 
                      : 'bg-gray-200 text-brand-gray cursor-not-allowed'
                  }`}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
        
      {/* {!isComposing && (
        <button
          onClick={() => {
            setNewTaskCategory(currentCategory); // Set the default category to current category
            setIsComposing(true);
          }}
          className="fixed right-6 bottom-6 bg-brand-yellow text-brand-black p-4 rounded-full shadow-lg shadow-brand-yellow/30 hover:bg-brand-yellow/90 transition-colors z-10"
          aria-label="Add new task"
        >
          <FaPlus />
        </button>
      )} */}
    </div>
  );
}

export default Tasks;