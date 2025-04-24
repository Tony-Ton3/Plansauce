import { useState, useRef, useEffect } from "react";
import { FaTimes, FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";
import { RiCloudyLine } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import  Subtask  from "../components/Subtask";
import PromptPanel from "../components/PromptPanel";
import ResourcesModal from "../components/ResourceModal";
import { updateTaskStatus as updateTaskStatusRedux } from "../redux/taskSlice";
import { updateTaskStatus } from '../utils/api';

const PROJECT_CATEGORIES = [
  { id: "all", name: "All", description: "All tasks" },
  // { id: 'planning', name: 'Planning', description: 'Initial requirements, user flows, architecture ideas, wireframes' },
  { id: 'setup', name: 'Setup', description: 'Environment configuration, repository initialization, installing core tools' },
  { id: 'frontend', name: 'Frontend', description: 'User interface development, client-side logic' },
  { id: 'backend', name: 'Backend', description: 'Server-side logic, API development, database interactions' },
  { id: 'testing', name: 'Testing', description: 'Writing tests, quality assurance checks' },
  { id: 'deploy', name: 'Deploy', description: 'Infrastructure setup, deployment process, going live' },
  { id: 'maintain', name: 'Maintain', description: 'Monitoring, updates, bug fixes after launch' },
];

const Task = ({ task, index, toggleTaskCompletion, deleteTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const deleteTimerRef = useRef(null);
  
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleTaskClick = (e) => {
    if (
      e.target.closest('button') || 
      e.target.closest('[role="button"]') || 
      e.target.closest('[aria-label]')
    ) {
      return;
    }
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
    // console.log('Task data:', task); // Debug log
    if (task.id) {
      toggleTaskCompletion(task.id);
    } else if (task._id) {
      toggleTaskCompletion(task._id);
    } else {
      console.error('No valid task ID found:', task);
    }
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
          className="flex-shrink-0 h-6 w-6 flex items-center justify-center relative"
        >
          <input 
            type="checkbox"
            checked={task.completed}
            onChange={handleTaskCompletion}
            onClick={(e) => e.stopPropagation()}
            className="checkbox checkbox-success checkbox-md border-2 border-gray-200"
          />
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
            <button 
              onClick={toggleExpand}
              className="flex items-center gap-1.5 min-w-[40px] justify-end text-xs text-brand-gray hover:text-brand-black transition-colors group/tooltip relative"
              title={expanded ? "Hide subtasks" : "Show subtasks"}
            >
              <span className="flex items-center gap-1">
                <span className="text-brand-gray/60">{totalSubtasks} steps</span>
                {expanded ? 
                  <FaChevronDown className="text-xs" /> : 
                  <FaChevronRight className="text-xs" />
                }
              </span>
            </button>
          )}
        
        {/* task name */}
        <div className="flex-grow flex items-center cursor-pointer">
          <p className={`${task.completed ? 'line-through text-brand-gray' : 'text-brand-black'} text-sm mr-6 transition-all duration-300`}>
            {task.text}
          </p>
        </div>
        
        {/* right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleActionButton('prompt');
            }}
            className="btn btn-dash btn-sm bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink border-0 group/tooltip relative flex items-center gap-1 opacity-0 group-hover/task:opacity-100"
          >
            <span>Start Task</span>
          </button>
        
          {/* subtask indicator and toggle */}
          
          
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
                onSelectSubtask={handleSelectSubtask}
              />
            ))}
          </div>
        </div>
      )}

      {/* action panel for task or subtask - with different options for each */}
      <PromptPanel 
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
      //case 'planning':
      //   return 'bg-blue-500/10 text-blue-500';
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

const CategoryEmptyState = ({ category }) => {
  const currentCategory = PROJECT_CATEGORIES.find(c => c.id === category);
  
  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-brand-black mb-2">No tasks in {currentCategory?.name}</h3>
      <p className="text-brand-gray mb-4">{currentCategory?.description}</p>
      <button 
        // onClick={() =>()}
        className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black rounded-full px-4 py-2 transition-colors shadow-lg shadow-brand-yellow/20"
      >
        <FaPlus size={12} />
        <span>Add a task to this category</span>
      </button>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [newTask, setNewTask] = useState('');
  // const [newTaskCategory, setNewTaskCategory] = useState('planning');
  const [currentCategory, setCurrentCategory] = useState('setup');
  
  const [categoryTaskCounts, setCategoryTaskCounts] = useState({});
  const [showTechStack, setShowTechStack] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const { currentTasks, loading: reduxLoading, error: reduxError } = useSelector((state) => state.tasks);
  const { currentProject } = useSelector((state) => state.projects);

  //console.log("Current Tasks:", currentTasks);
  //console.log("Current Project:", currentProject);

  // const dispatch = useDispatch();
  
  // useEffect(() => {
  //   console.log("Full Current Project:", currentProject);
  //   console.log("Project Tech Stack:", currentProject?.techStack);
  //   console.log("Project Priority:", currentProject?.priority);
  //   console.log("Project Description:", currentProject?.description);
  // }, [currentProject]);

  // useEffect(() => {
  //   if (showTechStack) {
  //     console.log("Modal State - Show Tech Stack:", showTechStack);
  //     console.log("Modal State - Current Project:", currentProject);
  //     console.log("Modal State - Tech Stack Data:", currentProject?.techStack);
  //   }
  // }, [showTechStack, currentProject]);

  useEffect(() => {
    if (currentTasks) {
      const tasksWithCategories = currentTasks.map(task => ({
        ...task,
        category: task.category || 'setup'
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

  const dispatch = useDispatch();

  const toggleTaskCompletion = async (taskId) => {
    if (!taskId) {
      console.error("No task ID provided");
      return;
    }

    try {
      const currentTask = tasks.find(task => 
        task.taskId === taskId || 
        task.id === taskId || 
        task._id === taskId
      );
      
      if (!currentTask) {
        console.error("Task not found:", taskId);
        return;
      }

      if (!currentProject?._id) {
        console.error("No project ID available");
        return;
      }

      // Use taskId consistently
      const effectiveTaskId = currentTask.taskId || currentTask.id || currentTask._id;
      const newStatus = !currentTask.completed;
      
      console.log('Updating task status:', {
        projectId: currentProject._id,
        taskId: effectiveTaskId,
        currentCompleted: currentTask.completed,
        newStatus
      });

      // Optimistically update UI
      dispatch(updateTaskStatusRedux({ taskId: effectiveTaskId, completed: newStatus }));

      // Make API call
      const response = await updateTaskStatus(
        currentProject._id, 
        effectiveTaskId, 
        newStatus
      );

      if (!response.success) {
        // Revert the optimistic update if the API call failed
        dispatch(updateTaskStatusRedux({ taskId: effectiveTaskId, completed: currentTask.completed }));
        console.error('Task update failed:', response);
        // Optionally show error to user
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Optionally show error to user
    }
  };
  
  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  // const addNewTask = (e) => {
  //   e.preventDefault();
  //   if (!newTask.trim()) return;
    
  //   setTasks(prevTasks => [
  //     ...prevTasks,
  //     { 
  //       id: Date.now().toString(), 
  //       text: newTask, 
  //       completed: false,
  //       category: newTaskCategory,
  //       subtasks: []
  //     }
  //   ]);
    
  //   setNewTask('');
  //   setIsComposing(false);
  // };

  const currentCategoryTasks = currentCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === currentCategory);
  
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
                              {completedCount}/{categoryTasks.length}
                            </div>
                          </div>
                          <div className="space-y-1 pl-1">
                            {categoryTasks.map((task, idx) => (
                              <Task
                                key={`${task.id}-${idx}`}
                                task={task}
                                index={tasks.findIndex(t => t.id === task.id)}
                                toggleTaskCompletion={toggleTaskCompletion}
                                deleteTask={deleteTask}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
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
                          {completedTasksCount}/{currentCategoryTasks.length}
                        </div>
                      </div>
                      <div className="space-y-1 pl-1">
                        {currentCategoryTasks.map((task, idx) => (
                          <Task
                            key={`${task.id}-${idx}`}
                            task={task}
                            index={tasks.findIndex(t => t.id === task.id)}
                            toggleTaskCompletion={toggleTaskCompletion}
                            deleteTask={deleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CategoryEmptyState category={currentCategory} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Tasks;