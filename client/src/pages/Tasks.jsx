import { useState, useRef, useEffect } from "react";
import { FaCheckCircle, FaRegCircle, FaGripLines, FaTimes, FaPlus, FaChevronDown, FaChevronRight, FaCode, FaBook, FaLink, FaTimes as FaClose } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";

//mock data for tasks with subtasks
const initialTasks = [
  { 
    id: "1", 
    text: "Research user authentication methods", 
    completed: false,
    subtasks: [
      { id: "1-1", text: "Compare OAuth providers", completed: false },
      { id: "1-2", text: "Research JWT implementation", completed: false },
      { id: "1-3", text: "Evaluate session-based auth", completed: true }
    ]
  },
  { 
    id: "2", 
    text: "Explore competitor applications", 
    completed: false,
    subtasks: [
      { id: "2-1", text: "Analyze UI/UX patterns", completed: false },
      { id: "2-2", text: "Document feature sets", completed: false }
    ]
  },
  { 
    id: "3", 
    text: "Identify required third-party APIs", 
    completed: false,
    subtasks: [
      { id: "3-1", text: "Payment processing options", completed: false },
      { id: "3-2", text: "Email service providers", completed: false },
      { id: "3-3", text: "File storage solutions", completed: false }
    ]
  },
  { 
    id: "4", 
    text: "Create wireframes for dashboard", 
    completed: false,
    subtasks: [
      { id: "4-1", text: "Draft main layout", completed: false },
      { id: "4-2", text: "Design navigation components", completed: false }
    ]
  },
  { 
    id: "5", 
    text: "Design responsive layouts", 
    completed: false,
    subtasks: [
      { id: "5-1", text: "Mobile designs", completed: false },
      { id: "5-2", text: "Tablet designs", completed: false },
      { id: "5-3", text: "Desktop designs", completed: false }
    ]
  },
  { 
    id: "6", 
    text: "Create UI component library", 
    completed: false,
    subtasks: [
      { id: "6-1", text: "Design system fundamentals", completed: false },
      { id: "6-2", text: "Build core components", completed: false }
    ]
  },
  { 
    id: "7", 
    text: "Set up project repository", 
    completed: false,
    subtasks: [
      { id: "7-1", text: "Initialize repository", completed: false },
      { id: "7-2", text: "Set up CI/CD pipeline", completed: false }
    ]
  },
  { 
    id: "8", 
    text: "Configure development environment", 
    completed: false,
    subtasks: [
      { id: "8-1", text: "Set up local environment", completed: false },
      { id: "8-2", text: "Configure testing framework", completed: false }
    ]
  },
  { 
    id: "9", 
    text: "Implement user authentication flow", 
    completed: false,
    subtasks: [
      { id: "9-1", text: "Implement login", completed: false },
      { id: "9-2", text: "Implement registration", completed: false },
      { id: "9-3", text: "Implement password reset", completed: false }
    ]
  },
  { 
    id: "10", 
    text: "Write unit tests for API calls", 
    completed: false,
    subtasks: [
      { id: "10-1", text: "Test auth endpoints", completed: false },
      { id: "10-2", text: "Test data endpoints", completed: false }
    ]
  },
  { 
    id: "11", 
    text: "Perform cross-browser testing", 
    completed: false,
    subtasks: [
      { id: "11-1", text: "Test in Chrome", completed: false },
      { id: "11-2", text: "Test in Firefox", completed: false },
      { id: "11-3", text: "Test in Safari", completed: false }
    ]
  },
  { 
    id: "12", 
    text: "Test responsive design on mobile devices", 
    completed: false,
    subtasks: [
      { id: "12-1", text: "Test on iOS", completed: false },
      { id: "12-2", text: "Test on Android", completed: false }
    ]
  },
];

//subtask component
const Subtask = ({ subtask, parentId, parentText, toggleSubtaskCompletion, onSelectSubtask }) => {
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    onSelectSubtask(subtask, parentId, parentText, action);
  };

  return (
    <div 
      className="flex items-center gap-3 py-2 pl-8 relative group hover:bg-gray-800/30 rounded-md transition-colors cursor-pointer"
      onClick={() => onSelectSubtask(subtask, parentId, parentText)}
    >
      {/* github-like branch line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      
      {/* horizontal connector line */}
      <div className="absolute left-4 top-1/2 w-4 h-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      
      {/* improved checkbox with larger hit area */}
      <div 
        onClick={(e) => {
          e.stopPropagation(); //prevent selecting subtask when clicking checkbox
          toggleSubtaskCompletion(parentId, subtask.id);
        }}
        className="flex-shrink-0 h-7 w-7 flex items-center justify-center cursor-pointer hover:bg-gray-800/50 rounded-full transition-colors"
        role="button"
        aria-label={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {subtask.completed ? (
          <FaCheckCircle className="text-blue-500" />
        ) : (
          <FaRegCircle className="text-gray-600 hover:text-gray-400" />
        )}
      </div>
      
      <div 
        className="flex-grow flex items-center justify-between cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          toggleSubtaskCompletion(parentId, subtask.id);
        }}
      >
        <p className={`${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'} text-sm`}>
          {subtask.text}
        </p>
        
        //quick action buttons for subtasks
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2" onClick={e => e.stopPropagation()}>
          <button 
            onClick={(e) => handleActionClick(e, 'implementation')}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="View implementation details"
          >
            <FaCode />
          </button>
          <button 
            onClick={(e) => handleActionClick(e, 'prompt')}
            className="text-xs text-gray-400 hover:text-purple-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="View smart prompt"
          >
            <FaBook />
          </button>
          <button 
            onClick={(e) => handleActionClick(e, 'resources')}
            className="text-xs text-gray-400 hover:text-green-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="View resources"
          >
            <FaLink />
          </button>
        </div>
      </div>
    </div>
  );
};

//taskactionpanel component
const TaskActionPanel = ({ isOpen, onClose, action, task, subtask, parentTask }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  //handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      //trigger animation in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      //wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); //match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isRendered) return null;
  
  //use a sliding panel from the right side
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* semi-transparent backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* notion-like panel with slide animation */}
      <div className={`absolute inset-y-0 right-0 max-w-4xl w-full bg-gray-900 shadow-2xl shadow-blue-500/5 flex flex-col overflow-hidden transform transition-transform duration-300 ease-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex flex-col gap-1">
            {/* breadcrumb navigation */}
            {subtask && parentTask && (
              <div className="flex items-center text-sm text-gray-400">
                <span>{parentTask}</span>
                <span className="mx-2">›</span>
                <span className="text-gray-200">{subtask.text}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                {action === 'implementation' && <FaCode className="text-blue-400 text-sm" />}
                {action === 'prompt' && <FaBook className="text-purple-400 text-sm" />}
                {action === 'resources' && <FaLink className="text-green-400 text-sm" />}
              </div>
              <h2 className="text-lg font-semibold text-gray-100">
                {subtask ? subtask.text : task.text}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-2 rounded-full hover:bg-gray-800/50"
          >
            <FaClose />
          </button>
        </div>
        
        {/* tabs for different actions */}
        <div className="border-b border-gray-800">
          <div className="flex px-6">
            <button className={`py-3 px-4 border-b-2 ${action === 'implementation' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-400'}`}>
              Implementation Guide
            </button>
            <button className={`py-3 px-4 border-b-2 ${action === 'prompt' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-400'}`}>
              Smart Prompt
            </button>
            <button className={`py-3 px-4 border-b-2 ${action === 'resources' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-500 hover:text-gray-400'}`}>
              Resources
            </button>
          </div>
        </div>
        
        {/* panel content */}
        <div className="flex-1 overflow-y-auto p-6">
          {(() => {
            //determine if this is a task or subtask context
            const isSubtask = !!subtask;
            const currentItem = subtask || task;
            const contextType = isSubtask ? 'subtask' : 'task';
            
            switch (action) {
              case 'implementation':
                return (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-4">
                      <h3 className="text-xl font-semibold text-gray-100">Implementation Guide</h3>
                      <p className="text-gray-400 mt-2">
                        {isSubtask 
                          ? `Step-by-step guide for implementing ${currentItem.text}`
                          : `Overview and planning for ${currentItem.text}`
                        }
                      </p>
                    </div>

                    {isSubtask ? (
                      //subtask-specific content - more detailed implementation steps
                      <>
                        //steps section
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-300">Implementation Steps</h4>
                          <div className="space-y-3">
                            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm">1</span>
                                <h5 className="text-gray-200 font-medium">Setup Dependencies</h5>
                              </div>
                              <p className="mt-2 text-gray-400 text-sm pl-9">Install and configure required packages...</p>
                              <div className="mt-3 pl-9">
                                <pre className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-300 font-mono">npm install @api-package/core</pre>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* code examples */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-300">Code Examples</h4>
                          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                            <div className="border-b border-gray-700 p-3 flex justify-between items-center">
                              <span className="text-sm text-gray-400">example.ts</span>
                              <button className="text-gray-500 hover:text-gray-300">Copy</button>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 font-mono">
                              <code>{`import { API } from '@api/core';\n\nasync function setup() {\n  // Implementation code...\n}`}</code>
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      //task-level content - more about planning and architecture
                      <>
                        //overview section
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-300">Task Overview</h4>
                          <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                            <p className="text-gray-300">
                              This task involves {task.text.toLowerCase()}, which requires planning and implementation across multiple steps.
                            </p>
                            
                            <div className="mt-4 flex gap-3 flex-wrap">
                              <div className="bg-blue-500/10 px-3 py-1.5 rounded-full text-xs text-blue-400">
                                Architecture Design
                              </div>
                              <div className="bg-purple-500/10 px-3 py-1.5 rounded-full text-xs text-purple-400">
                                Implementation Plan
                              </div>
                              <div className="bg-green-500/10 px-3 py-1.5 rounded-full text-xs text-green-400">
                                Testing Strategy
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* subtasks progress */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Implementation Progress</h4>
                            <span className="text-xs text-gray-400">
                              {task.subtasks ? `${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} completed` : '0/0 completed'}
                            </span>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            {task.subtasks && task.subtasks.length > 0 ? (
                              <div className="space-y-2">
                                {task.subtasks.map(st => (
                                  <div key={st.id} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${st.completed ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                                    <span className={`text-sm ${st.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                                      {st.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No subtasks defined yet.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );

              case 'prompt':
                return (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-4">
                      <h3 className="text-xl font-semibold text-gray-100">Smart Prompt</h3>
                      <p className="text-gray-400 mt-2">
                        {isSubtask 
                          ? `Task-specific prompt for ${currentItem.text}`
                          : `General prompt template for ${currentItem.text}`
                        }
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        {`I'm working on ${isSubtask ? `implementing ${currentItem.text}` : `planning ${currentItem.text}`} for a web application.

                        ${isSubtask ? `Technical Context:
                        - Subtask: ${currentItem.text}
                        - Parent Task: ${parentTask}
                        - Status: ${currentItem.completed ? 'Completed' : 'In Progress'}

                        Please provide:
                        1. Detailed implementation approach
                        2. Code examples with best practices
                        3. Potential edge cases to handle
                        4. Unit testing strategy` 
                        : 
                        `Project Context:
                        - Task: ${currentItem.text}
                        - Progress: ${currentItem.subtasks?.filter(st => st.completed).length || 0}/${currentItem.subtasks?.length || 0} subtasks completed
                        - Subtasks: ${currentItem.subtasks?.map(st => st.text).join(', ')}

                        Please provide:
                        1. High-level architecture recommendations
                        2. Implementation strategy
                        3. Common pitfalls to avoid
                        4. Testing approach
                        5. Resource planning`}
                        `}
                      </pre>
                      <button className="mt-4 w-full bg-blue-600/20 text-blue-400 py-2 rounded-lg hover:bg-blue-600/30 transition-colors">
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                );

              case 'resources':
                return (
                  <div className="space-y-6">
                    <div className="border-b border-gray-800 pb-4">
                      <h3 className="text-xl font-semibold text-gray-100">Curated Resources</h3>
                      <p className="text-gray-400 mt-2">
                        {isSubtask 
                          ? `Specific resources for ${currentItem.text}`
                          : `General resources for ${currentItem.text}`
                        }
                      </p>
                    </div>

                    {/* official docs */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-300">
                        {isSubtask ? 'Technical Documentation' : 'Official Documentation'}
                      </h4>
                      <div className="space-y-2">
                        <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <FaBook className="text-blue-400" />
                            <div>
                              <h5 className="text-gray-200">
                                {isSubtask ? 'Implementation Guide' : 'API Documentation'}
                              </h5>
                              <p className="text-sm text-gray-400 mt-1">
                                {isSubtask 
                                  ? 'Step-by-step technical implementation guide'
                                  : 'Complete API reference and guides'
                                }
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* community resources */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-300">Community Resources</h4>
                      <div className="space-y-2">
                        <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <FaCode className="text-purple-400" />
                            <div>
                              <h5 className="text-gray-200">
                                {isSubtask ? 'Code Snippets' : 'Example Repository'}
                              </h5>
                              <p className="text-sm text-gray-400 mt-1">
                                {isSubtask
                                  ? 'Ready-to-use code examples for specific implementation'
                                  : 'Community-maintained examples and patterns'
                                }
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* related articles */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-300">Related Articles</h4>
                      <div className="space-y-2">
                        <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <FaLink className="text-green-400" />
                            <div>
                              <h5 className="text-gray-200">
                                {isSubtask ? 'Tutorial' : 'Best Practices Guide'}
                              </h5>
                              <p className="text-sm text-gray-400 mt-1">
                                {isSubtask 
                                  ? 'Detailed tutorial for this specific task'
                                  : 'Comprehensive guide to implementation patterns'
                                }
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

//task component with native drag and drop
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
  
  //handle drag start
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
  
  //calculate subtask completion percentage
  const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completionPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  //toggle expand
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  //handle task click
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

  //handle action button
  const handleActionButton = (action) => {
    setSelectedSubtask(null); //reset any selected subtask
    setActiveAction(action);
    setShowActionPanel(true);
  };
  
  //handle subtask selection
  const handleSelectSubtask = (subtask, parentId, parentText, action = 'implementation') => {
    setSelectedSubtask(subtask);
    setActiveAction(action || 'implementation'); //default to implementation view if not specified
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
      deleteTask(index);
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

  //handle task completion
  const handleTaskCompletion = (e) => {
    e.stopPropagation();
    //trigger animation
    setCheckAnimation(true);
    
    //reset animation after duration
    setTimeout(() => {
      setCheckAnimation(false);
    }, 600);
    
    //toggle task completion
    toggleTaskCompletion(index);
  };

  return (
    <div 
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} relative group/task`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* left-side drag handle and add indicator (visible on hover) */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center opacity-0 group-hover/task:opacity-100 transition-opacity -ml-10 px-2 gap-2">
        <div 
          className="w-4 h-4 bg-gray-800/70 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-700/80 cursor-grab transition-colors"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <FaGripLines className="size-3" />
        </div>
        <button
          className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-colors"
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

      {/* main task row - notion-style */}
      <div 
        ref={ref}
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-gray-900 border ${deleteConfirm ? 'border-red-500/50' : 'border-gray-800'} rounded-lg p-3 mb-1 flex items-center gap-3 ${
          isDragging ? 'shadow-lg shadow-blue-500/10 cursor-grabbing' : (deleteConfirm ? 'shadow-md shadow-red-500/10' : 'hover:shadow-md hover:shadow-blue-500/5 cursor-grab')
        } transition-all duration-200 hover:border-gray-700 group`}
        onClick={handleTaskClick}
      >
        {/* task checkbox */}
        <div 
          onClick={handleTaskCompletion}
          className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative
            ${checkAnimation ? 'scale-110 bg-blue-500/20' : 'hover:bg-gray-800/50'}`}
          role="button"
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <div className="relative">
              <FaCheckCircle className="text-xl text-blue-500" />
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${checkAnimation ? 'opacity-100' : 'opacity-0'}`}>
                <span className="animate-ping absolute h-4 w-4 rounded-full bg-blue-400 opacity-75"></span>
              </span>
            </div>
          ) : (
            <div className="relative">
              <FaRegCircle className="text-xl text-gray-600 hover:text-gray-400 transition-colors" />
              <span className={`absolute inset-0 flex items-center justify-center text-white transition-transform origin-center ${checkAnimation ? 'scale-100' : 'scale-0'} duration-300`}>
                <FiCheck className="text-sm" />
              </span>
            </div>
          )}
        </div>
        
        {/* task name with completion animation */}
        <div 
          className="flex-grow flex items-center py-1.5 cursor-pointer"
          onClick={handleTaskCompletion}
        >
          <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-100'} text-base mr-2 transition-all duration-300 ${checkAnimation ? 'transform translate-y-0.5' : ''}`}>
            {task.text}
          </p>
          
          {/* completion confetti effect - only shows during animation */}
          {checkAnimation && !task.completed && (
            <div className="absolute left-8 -top-1 overflow-hidden h-8">
              <div className="animate-confetti-1 absolute w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <div className="animate-confetti-2 absolute w-1.5 h-1.5 rounded-full bg-green-400 delay-75"></div>
              <div className="animate-confetti-3 absolute w-1.5 h-1.5 rounded-full bg-purple-400 delay-150"></div>
            </div>
          )}
        </div>
        
        {/* right side actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* action buttons - always visible */}
          <div className="flex gap-1.5 mr-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActionButton('implementation');
              }}
              className="p-1.5 text-xs bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-colors group/tooltip relative"
              aria-label="Implementation Guide"
              title="Implementation Guide"
            >
              <FaCode />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity duration-150">Implementation Guide</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleActionButton('prompt');
              }}
              className="p-1.5 text-xs bg-purple-500/10 text-purple-400 rounded-full hover:bg-purple-500/20 transition-colors group/tooltip relative"
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
              className="p-1.5 text-xs bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-colors group/tooltip relative"
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
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors group/tooltip relative"
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
                className="text-gray-500 hover:text-red-400 transition-colors group/tooltip relative"
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
                className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-800 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteClick}
                className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-500 shadow-sm shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* bottom drop indicator line */}
      {showDropIndicator && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 translate-y-0.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10" />
      )}
      
      {/* subtasks accordion panel */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 mb-3 ml-6 pl-4 border-l border-gray-800 ${
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

      {/* action panel for task - similar to notion page view */}
      <TaskActionPanel 
        isOpen={showActionPanel}
        onClose={closeActionPanel}
        action={activeAction || 'implementation'}
        task={task}
        subtask={selectedSubtask}
        parentTask={selectedSubtask ? task.text : null}
      />
    </div>
  );
};

//compose area component without animations
const ComposeArea = ({ isComposing, setIsComposing, newTask, setNewTask, addNewTask }) => {
  if (isComposing) {
    return (
      <form 
        onSubmit={addNewTask}
        className="max-w-2xl mx-auto bg-gray-900 rounded-xl border border-gray-800 shadow-lg shadow-blue-500/5 overflow-hidden"
      >
        <div className="p-3">
          <textarea
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full resize-none border-none bg-transparent focus:ring-0 focus:outline-none text-gray-100 placeholder-gray-500 text-lg"
            rows={2}
            autoFocus
          />
        </div>
        <div className="bg-gray-800/50 p-3 flex justify-between items-center border-t border-gray-800">
          <button 
            type="button"
            onClick={() => setIsComposing(false)}
            className="text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className={`rounded-full px-4 py-2 font-medium ${
              newTask.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add Task
          </button>
        </div>
      </form>
    );
  }
  
  return (
    <button
      onClick={() => setIsComposing(true)}
      className="max-w-2xl mx-auto flex items-center gap-2 bg-gray-900 rounded-full border border-gray-800 p-3 w-full text-left text-gray-400 hover:bg-gray-800/50 hover:border-gray-700 shadow-lg shadow-blue-500/5"
    >
      <FaPlus className="text-blue-500" />
      <span>Add a new task...</span>
    </button>
  );
};

function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  
  const toggleTaskCompletion = (index) => {
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      const newCompletedState = !updatedTasks[index].completed;
      
      //update the task
      updatedTasks[index] = {
        ...updatedTasks[index],
        completed: newCompletedState
      };
      
      //if marking as completed, also mark all subtasks as completed
      //if marking as incompleted, also mark all subtasks as incompleted
      if (updatedTasks[index].subtasks) {
        updatedTasks[index].subtasks = updatedTasks[index].subtasks.map(subtask => ({
          ...subtask,
          completed: newCompletedState
        }));
      }
      
      return updatedTasks;
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
  
  const deleteTask = (index) => {
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      updatedTasks.splice(index, 1);
      return updatedTasks;
    });
  };
  
  const moveTask = (fromIndex, toIndex) => {
    setTasks(prevTasks => {
      //create a copy of the tasks array
      const updatedTasks = [...prevTasks];
      
      //remove the task from the original position
      const [movedTask] = updatedTasks.splice(fromIndex, 1);
      
      //insert the task at the new position
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
        subtasks: [] //new tasks start with empty subtasks
      }
    ]);
    
    setNewTask("");
    setIsComposing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* header - more notion-like */}
      <header className="sticky top-0 z-10 bg-gray-900/50 border-b border-gray-800 p-4 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-50">Project Tasks</h1>
          <div className="text-sm text-gray-400">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </div>
          </div>
        </header>
        
        {/* main content */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6 mb-16">
        <div className="space-y-1">
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                moveTask={moveTask}
                toggleTaskCompletion={toggleTaskCompletion}
                toggleSubtaskCompletion={toggleSubtaskCompletion}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        </main>
        
        {/* footer - compose area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/50 border-t border-gray-800 p-3 z-10 backdrop-blur-xl">
          <ComposeArea 
            isComposing={isComposing}
            setIsComposing={setIsComposing}
            newTask={newTask}
            setNewTask={setNewTask}
            addNewTask={addNewTask}
          />
        </footer>
      </div>
  );
}

export default Tasks;