import { useState, useEffect } from "react";
import { FaCopy, FaTimes, FaCheck } from "react-icons/fa";
import { MdOutlineCreate } from "react-icons/md";

import { useSelector } from "react-redux";

const chatgptIcon = new URL("../utils/icons/chatgpt-icon.svg", import.meta.url).href;
const claudeIcon = new URL("../utils/icons/claude-icon.svg", import.meta.url).href;
const geminiIcon = new URL("../utils/icons/gemini-icon.svg", import.meta.url).href;
const grokIcon = new URL("../utils/icons/grok-icon.svg", import.meta.url).href;
const deepseekIcon = new URL("../utils/icons/deepseek-icon.svg", import.meta.url).href;
const perplexityIcon = new URL("../utils/icons/perplexity-icon.svg", import.meta.url).href;

const LLM_OPTIONS = [
  {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    color: 'bg-green-600 hover:bg-green-700',
    icon: chatgptIcon
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: 'bg-purple-600 hover:bg-purple-700',
    icon: claudeIcon
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: geminiIcon
  },
  {
    name: 'Grok',
    url: 'https://grok.com',
    color: 'bg-gray-800 hover:bg-gray-900',
    icon: grokIcon
  },
  {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    icon: deepseekIcon
  },
  {
    name: 'Perplexity',
    url: 'https://perplexity.ai',
    color: 'bg-teal-600 hover:bg-teal-700',
    icon: perplexityIcon
  }
];

const PromptPanel = ({
  isOpen,
  onClose,
  action,
  task,
  subtask,
  parentTask,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [showProjectContext, setShowProjectContext] = useState(false);
  const [showTaskExplanation, setShowTaskExplanation] = useState(false);
  const [showProgressContext, setShowProgressContext] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { currentProject } = useSelector((state) => state.projects);
  const tasks = useSelector((state) => state.tasks.currentTasks);

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

  const isSubtask = !!subtask;
  const currentItem = subtask || task;

  // Get completed tasks grouped by category
  const getCompletedTasks = () => {
    return tasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      
      const category = task.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {});
  };

  // Format tools by category
  const formatToolingContext = () => {
    if (!currentProject?.techStack) return '';

    // Get the task's category
    const taskCategory = task.category || 'frontend'; // default to frontend if no category

    // Only show tools from the task's category
    const tools = currentProject.techStack[taskCategory];
    if (!tools || tools.length === 0) return '';

    const toolingContext = tools
      .map(tool => `${tool.name}`)
      .join('\n  ');

    return `${taskCategory.charAt(0).toUpperCase() + taskCategory.slice(1)} Stack:\n  ${toolingContext}`;
  };

  const contextOptions = [
    { id: 'task', label: 'Task Details',
      content: `${isSubtask ? 'Subtask' : 'Task'}: ${currentItem.text}
Category: ${task.category}`
    },
    { id: 'tools', label: 'Tools',
      content: formatToolingContext()
    },
    { id: 'project', label: 'Project Context', 
      content: `Project name: ${currentProject?.name}
${currentProject?.description}`
    },
    { id: 'explanation', label: 'Task Explanation',
      content: `I'm new to this. Could you explain What is the significance of ${currentItem.text}?`
    },
    { id: 'progress', label: 'Current Project Progress',
      content: Object.entries(getCompletedTasks())
        .map(([category, tasks]) => 
          `${category}:\n${tasks.map(task => `  ✓ ${task.text}`).join('\n')}`
        )
        .join('\n\n')
    }
  ];

  const generatePrompt = () => {
    const requiredContexts = contextOptions
      .filter(ctx => ['task', 'tools'].includes(ctx.id))
      .map(ctx => {
        if (!ctx.content.trim()) return '';
        return `--- ${ctx.label} --- \n${ctx.content}`;
      })
      .filter(Boolean);

    if (showProjectContext) {
      const projectContext = contextOptions.find(ctx => ctx.id === 'project');
      if (projectContext?.content.trim()) {
        requiredContexts.push(`--- ${projectContext.label} --- \n${projectContext.content}`);
      }
    }

    if (showTaskExplanation) {
      const explanationContext = contextOptions.find(ctx => ctx.id === 'explanation');
      if (explanationContext?.content.trim()) {
        requiredContexts.push(`--- ${explanationContext.label} --- \n${explanationContext.content}`);
      }
    }

    if (showProgressContext) {
      const progressContext = contextOptions.find(ctx => ctx.id === 'progress');
      if (progressContext?.content.trim()) {
        requiredContexts.push(`--- ${progressContext.label} --- \n${progressContext.content}`);
      }
    }

    const selectedContexts = requiredContexts.join('\n\n');

    return `I'm working on a development task and need assistance.

${selectedContexts}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLLMClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* semi-transparent backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* notion-like panel with slide animation */}
      <div
        className={`absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md flex items-center justify-center">
              <MdOutlineCreate className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Prompt</h2>
              <p className="text-sm text-gray-500">Generate a detailed prompt and use it with your favorite LLM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* panel content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Context Toggles */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-700">Optional Context</h3>
              <label className="flex items-center gap-3 p-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showProjectContext}
                  onChange={(e) => setShowProjectContext(e.target.checked)}
                  className="toggle toggle-md bg-gray-200 border-2 checked:bg-brand-pink checked:border-brand-pink"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Add project details</span>
              </label>
              <label className="flex items-center gap-3 p-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showTaskExplanation}
                  onChange={(e) => setShowTaskExplanation(e.target.checked)}
                  className="toggle toggle-md bg-gray-200 border-2 checked:bg-brand-pink checked:border-brand-pink"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Help me understand this task</span>
              </label>
              <label className="flex items-center gap-3 p-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showProgressContext}
                  onChange={(e) => setShowProgressContext(e.target.checked)}
                  className="toggle toggle-md bg-gray-200 border-2 checked:bg-brand-pink checked:border-brand-pink"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Add project progress</span>
              </label>
            </div>

            {/* Generated Prompt */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Your Prompt</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-600 whitespace-pre-wrap">
                {generatePrompt()}
              </div>
            </div>

            {showProgressContext && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Completed Tasks</h3>
                {Object.entries(getCompletedTasks()).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(getCompletedTasks()).map(([category, tasks]) => (
                      <div key={category} className="border rounded-lg p-3">
                        <h4 className="font-medium mb-2">{category}</h4>
                        <ul className="space-y-2">
                          {tasks.map((task) => (
                            <li key={task._id} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <div>
                                <p className="font-medium">{task.text}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No completed tasks yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100">
          {/* LLM Options */}
          <div className="px-6 pt-4 bg-gray-50/50">
            <div className="flex flex-wrap justify-center items-center gap-2">
              {LLM_OPTIONS.map((llm) => (
                <button
                  key={llm.name}
                  onClick={() => handleLLMClick(llm.url)}
                  className={`${llm.color} bg-opacity-10 hover:bg-opacity-15 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-150 hover:scale-105 group`}
                >
                  <img 
                    src={llm.icon} 
                    alt={`${llm.name} icon`} 
                    className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                  <span>
                    {llm.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy button */}
          <div className="flex justify-center p-4 bg-gray-50/50">
            <button
              onClick={handleCopy}
              className="w-3/4 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 py-2 px-4 rounded-xl transition-all duration-150 hover:scale-[1.01] text-sm font-medium"
            >
              {copied ? (
                <>
                  <FaCheck className="text-sm opacity-80" />
                  <span>Prompt copied!</span>
                </>
              ) : (
                <>
                  <FaCopy className="text-sm opacity-80" />
                  <span>Copy and use prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
