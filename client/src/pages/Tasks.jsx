import { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaCheckCircle, FaRegCircle, FaGripLines, FaTimes, FaPlus, FaChevronDown, FaChevronRight, FaCode, FaBook, FaLink, FaTimes as FaClose } from "react-icons/fa";

// Mock data for tasks with subtasks
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

// Drag and drop item types
const ItemTypes = {
  TASK: 'task'
};

// Subtask component
const Subtask = ({ subtask, parentId, toggleSubtaskCompletion }) => {
  return (
    <div className="flex items-center gap-3 py-2 pl-8 relative group">
      {/* GitHub-like branch line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      
      {/* Horizontal connector line */}
      <div className="absolute left-4 top-1/2 w-4 h-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      
      <div className="flex-shrink-0 flex items-center">
        <button 
          onClick={() => toggleSubtaskCompletion(parentId, subtask.id)} 
          className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full"
        >
          {subtask.completed ? (
            <FaCheckCircle className="text-blue-500" />
          ) : (
            <FaRegCircle className="text-gray-600 hover:text-gray-500" />
          )}
        </button>
      </div>
      
      <div className="flex-grow flex items-center">
        <p className={`${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'} text-sm`}>
          {subtask.text}
        </p>
      </div>
    </div>
  );
};

// TaskActionPanel component
const TaskActionPanel = ({ isOpen, onClose, action, task }) => {
  if (!isOpen) return null;

  const renderActionContent = () => {
    switch (action) {
      case 'implementation':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-xl font-semibold text-gray-100">Implementation Guide</h3>
              <p className="text-gray-400 mt-2">Step-by-step guide for implementing {task.text}</p>
            </div>

            {/* Steps Section */}
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
                {/* More steps... */}
              </div>
            </div>

            {/* Code Examples */}
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
          </div>
        );

      case 'prompt':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-xl font-semibold text-gray-100">Smart Prompt</h3>
              <p className="text-gray-400 mt-2">Customized prompt for your preferred AI assistant</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {`I'm working on implementing ${task.text} for a web application.

                Technical Context:
                - Task: ${task.text}
                - Progress: ${task.subtasks?.filter(st => st.completed).length || 0}/${task.subtasks?.length || 0} subtasks completed
                - Subtasks: ${task.subtasks?.map(st => st.text).join(', ')}

                Please provide:
                1. Step-by-step implementation guide
                2. Code examples with best practices
                3. Common pitfalls to avoid
                4. Testing strategy
                5. Security considerations`}
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
              <p className="text-gray-400 mt-2">Relevant documentation, tutorials, and examples</p>
            </div>

            {/* Official Docs */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Official Documentation</h4>
              <div className="space-y-2">
                <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaBook className="text-blue-400" />
                    <div>
                      <h5 className="text-gray-200">API Documentation</h5>
                      <p className="text-sm text-gray-400 mt-1">Complete API reference and guides</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Community Resources */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Community Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaCode className="text-purple-400" />
                    <div>
                      <h5 className="text-gray-200">Example Repository</h5>
                      <p className="text-sm text-gray-400 mt-1">Community-maintained examples</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Related Articles */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Related Articles</h4>
              <div className="space-y-2">
                <a href="#" className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaLink className="text-green-400" />
                    <div>
                      <h5 className="text-gray-200">Best Practices Guide</h5>
                      <p className="text-sm text-gray-400 mt-1">Comprehensive guide to implementation</p>
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-gray-900 shadow-2xl shadow-blue-500/5">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-100">
              {action === 'implementation' && 'Implementation Guide'}
              {action === 'prompt' && 'Smart Prompt'}
              {action === 'resources' && 'Resources'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 p-2"
            >
              <FaClose />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderActionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// TaskInsights component
const TaskInsights = ({ task, expanded }) => {
  const [activeAction, setActiveAction] = useState(null);

  if (!expanded) return null;
  
  return (
    <>
      <div className="mt-4 border-t border-gray-800 pt-4">
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveAction('implementation')}
              className="px-3 py-1.5 text-sm bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-colors"
            >
              Generate Implementation Guide
            </button>
            <button 
              onClick={() => setActiveAction('prompt')}
              className="px-3 py-1.5 text-sm bg-purple-500/10 text-purple-400 rounded-full hover:bg-purple-500/20 transition-colors"
            >
              Copy Smart Prompt
            </button>
            <button 
              onClick={() => setActiveAction('resources')}
              className="px-3 py-1.5 text-sm bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-colors"
            >
              Find Resources
            </button>
          </div>
          
          {/* AI Insights */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-gray-100">AI Insights</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="font-medium text-gray-300">Estimated Time:</span>
                <span>4-6 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="font-medium text-gray-300">Complexity:</span>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="font-medium text-gray-300">Prerequisites:</span>
                <span>API Setup, Database Schema</span>
              </div>
            </div>
          </div>
          
          {/* Implementation Approaches */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-100">Recommended Approaches</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
                <h4 className="font-medium text-sm text-gray-200">JWT Authentication</h4>
                <p className="text-xs text-gray-400 mt-1">Best for stateless, scalable systems</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors backdrop-blur-sm">
                <h4 className="font-medium text-sm text-gray-200">OAuth Integration</h4>
                <p className="text-xs text-gray-400 mt-1">Best for social login support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskActionPanel 
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        action={activeAction}
        task={task}
      />
    </>
  );
};

// Task component with drag and drop functionality
const Task = ({ task, index, moveTask, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const deleteTimerRef = useRef(null);
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.TASK,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Move the task
      moveTask(dragIndex, hoverIndex);
      
      // Update the dragged item's index
      item.index = hoverIndex;
    },
  });
  
  // Connect preview to the card and drop to handle drops
  preview(drop(ref));
  
  // Calculate subtask completion percentage
  const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completionPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggling expand state to:", !expanded);
    setExpanded(!expanded);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    
    if (deleteConfirm) {
      // Already in delete confirm state, so actually delete
      deleteTask(index);
      clearTimeout(deleteTimerRef.current);
    } else {
      // Start delete confirmation UI
      setDeleteConfirm(true);
      
      // Auto-reset after 5 seconds
      deleteTimerRef.current = setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
    }
  };
  
  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirm(false);
    clearTimeout(deleteTimerRef.current);
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`mb-6 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      {/* Main task card */}
      <div 
        ref={ref}
        className={`bg-gray-900 border ${deleteConfirm ? 'border-red-500/50' : 'border-gray-800'} rounded-t-xl ${!expanded ? 'rounded-b-xl' : ''} p-4 flex flex-col gap-3 ${
          isDragging ? 'shadow-lg shadow-blue-500/10' : (deleteConfirm ? 'shadow-md shadow-red-500/10' : 'hover:shadow-md hover:shadow-blue-500/5')
        } transition-all duration-200 hover:border-gray-700`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskCompletion(index);
              }} 
              className="text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full"
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <FaCheckCircle className="text-blue-500" />
              ) : (
                <FaRegCircle className="text-gray-600 hover:text-gray-500" />
              )}
            </button>
          </div>
          
          <div 
            className={`flex-grow cursor-pointer ${deleteConfirm ? 'pr-20' : ''}`} 
            onClick={toggleExpand}
          >
            <div className="flex items-center">
              <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-100'} text-base mr-2`}>
                {task.text}
              </p>
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-gray-500">
                  {expanded ? 
                    <FaChevronDown className="text-xs" /> : 
                    <FaChevronRight className="text-xs" />
                  }
                </span>
              )}
            </div>
            
            {/* Subtask progress indicator */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2 flex items-center text-xs">
                <div className="w-24 bg-gray-800 rounded-full h-1.5 mr-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full shadow-sm shadow-blue-500/20"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <span className="text-gray-500">{completedSubtasks}/{totalSubtasks}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {!deleteConfirm ? (
              <>
                <button 
                  onClick={handleDeleteClick}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  aria-label="Delete task"
                >
                  <FaTimes />
                </button>
                <div 
                  ref={drag}
                  className="text-gray-600 cursor-move hover:text-gray-400 transition-colors p-1 rounded hover:bg-gray-800"
                >
                  <FaGripLines />
                </div>
              </>
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
        
        <TaskInsights task={task} expanded={expanded} />
      </div>
      
      {/* Subtasks accordion panel */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 bg-gray-900/50 border-l border-r border-b ${deleteConfirm ? 'border-red-500/50' : 'border-gray-800'} rounded-b-xl backdrop-blur-sm ${
            expanded ? 'max-h-96 py-2' : 'max-h-0 py-0 border-t-0'
          }`}
        >
          {task.subtasks.map((subtask, i) => (
            <Subtask
              key={subtask.id}
              subtask={subtask}
              parentId={task.id}
              toggleSubtaskCompletion={toggleSubtaskCompletion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Compose area component without animations
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
      
      // Update the task
      updatedTasks[index] = {
        ...updatedTasks[index],
        completed: newCompletedState
      };
      
      // If marking as completed, also mark all subtasks as completed
      // If marking as incompleted, also mark all subtasks as incompleted
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
          // Update the subtask
          const updatedSubtasks = task.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          
          // Check if all subtasks are now completed
          const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
          
          // Check if the current subtask is being unchecked
          const currentSubtask = task.subtasks.find(st => st.id === subtaskId);
          const isUnchecking = currentSubtask && currentSubtask.completed;
          
          // Return updated task - mark as incomplete if a subtask is being unchecked
          return { 
            ...task, 
            subtasks: updatedSubtasks,
            // If any subtask is unchecked, the task should be marked incomplete
            // If all subtasks are completed, the task should be marked complete
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
  
  const moveTask = (dragIndex, hoverIndex) => {
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      const draggedTask = updatedTasks[dragIndex];
      
      // Remove the dragged task
      updatedTasks.splice(dragIndex, 1);
      // Insert it at the new position
      updatedTasks.splice(hoverIndex, 0, draggedTask);
      
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
        subtasks: [] // New tasks start with empty subtasks
      }
    ]);
    
    setNewTask("");
    setIsComposing(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen bg-gray-950">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gray-900/50 border-b border-gray-800 p-4 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-50">Project Tasks</h1>
            <div className="text-sm text-gray-400">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-3 mb-16">
          <div className="space-y-6">
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
        
        {/* Footer - Compose area */}
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
    </DndProvider>
  );
}

export default Tasks;