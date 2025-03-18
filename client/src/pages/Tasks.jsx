import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaCheckCircle, FaRegCircle, FaGripLines, FaTimes, FaPlus, FaChevronDown, FaChevronRight } from "react-icons/fa";

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
    <div className="flex items-start gap-3 py-2 pl-8 relative">
      {/* GitHub-like branch line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      {/* Horizontal connector line */}
      <div className="absolute left-4 top-1/2 w-4 h-0.5 bg-gray-200"></div>
      
      <div className="flex-shrink-0">
        <button 
          onClick={() => toggleSubtaskCompletion(parentId, subtask.id)} 
          className="text-sm focus:outline-none"
        >
          {subtask.completed ? (
            <FaCheckCircle className="text-blue-500" />
          ) : (
            <FaRegCircle className="text-gray-400" />
          )}
        </button>
      </div>
      
      <div className="flex-grow">
        <p className={`${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'} text-sm`}>
          {subtask.text}
        </p>
      </div>
    </div>
  );
};

// Task component with drag and drop functionality
const Task = ({ task, index, moveTask, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask }) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const contentRef = useRef(null);
  
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

  return (
    <div className={`mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      {/* Main task card */}
      <div 
        ref={ref}
        className={`bg-white border border-gray-200 rounded-t-xl ${!expanded ? 'rounded-b-xl' : ''} p-4 flex items-start gap-3 ${
          isDragging ? 'shadow-lg' : 'hover:shadow-sm'
        }`}
      >
        <div className="flex-shrink-0 pt-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(index);
            }} 
            className="text-xl focus:outline-none"
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.completed ? (
              <FaCheckCircle className="text-blue-500" />
            ) : (
              <FaRegCircle className="text-gray-400" />
            )}
          </button>
        </div>
        
        <div 
          className="flex-grow cursor-pointer" 
          onClick={toggleExpand}
        >
          <div className="flex items-center">
            <p className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800'} text-base mr-2`}>
              {task.text}
            </p>
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-gray-400">
                {expanded ? 
                  <FaChevronDown className="text-xs" /> : 
                  <FaChevronRight className="text-xs" />
                }
              </span>
            )}
          </div>
          
          {/* Subtask progress indicator */}
          {task.subtasks && task.subtasks.length > 0 && !expanded && (
            <div className="mt-2 flex items-center text-xs">
              <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-gray-500">{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(index);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <FaTimes />
          </button>
          <div 
            ref={drag}
            className="text-gray-300 cursor-move hover:text-gray-500 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <FaGripLines />
          </div>
        </div>
      </div>
      
      {/* Subtasks accordion panel */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div 
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-xl ${
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
        className="max-w-2xl mx-auto bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden"
      >
        <div className="p-3">
          <textarea
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full resize-none border-none focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400 text-lg"
            rows={2}
            autoFocus
          />
        </div>
        <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-100">
          <button 
            type="button"
            onClick={() => setIsComposing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className={`rounded-full px-4 py-2 font-medium ${
              newTask.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-white cursor-not-allowed'
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
      className="max-w-2xl mx-auto flex items-center gap-2 bg-white rounded-full border border-gray-300 p-3 w-full text-left text-gray-500 hover:bg-gray-50"
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
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Project Tasks</h1>
            <div className="text-sm text-gray-500">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-3 mb-16">
          <div className="space-y-0">
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
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-10">
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