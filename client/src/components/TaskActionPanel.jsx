import { useState, useEffect } from "react";
import { FaCode, FaBook, FaLink } from "react-icons/fa";

//taskactionpanel component
const TaskActionPanel = ({
  isOpen,
  onClose,
  action,
  task,
  subtask,
  parentTask,
}) => {
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

  const isSubtask = !!subtask;
  const currentItem = subtask || task;

  let actionIcon, actionColor, actionTitle, actionDescription;

  if (isSubtask) {
    switch (action) {
      case "implementation":
        actionIcon = <FaCode className="text-blue-400 text-sm" />;
        actionColor = "blue";
        actionTitle = "Implementation Guide";
        actionDescription = `Step-by-step guide for implementing ${currentItem.text}`;
        break;
      case "technical":
        actionIcon = <FaBook className="text-purple-400 text-sm" />;
        actionColor = "purple";
        actionTitle = "Technical Prompt";
        actionDescription = `Specific code-focused prompts for ${currentItem.text}`;
        break;
      case "development":
        actionIcon = <FaLink className="text-green-400 text-sm" />;
        actionColor = "green";
        actionTitle = "Development Resources";
        actionDescription = `API documentation and code references for ${currentItem.text}`;
        break;
      default:
        actionIcon = <FaCode className="text-blue-400 text-sm" />;
        actionColor = "blue";
        actionTitle = "Implementation Guide";
        actionDescription = `Step-by-step guide for implementing ${currentItem.text}`;
    }
  } else {
    switch (action) {
      case "breakdown":
        actionIcon = <FaCode className="text-blue-400 text-sm" />;
        actionColor = "blue";
        actionTitle = "Task Breakdown";
        actionDescription = `Why this task matters and what it accomplishes`;
        break;
      case "prompt":
        actionIcon = <FaBook className="text-purple-400 text-sm" />;
        actionColor = "purple";
        actionTitle = "Smart Prompt";
        actionDescription = `Strategic planning prompts for ${currentItem.text}`;
        break;
      case "resources":
        actionIcon = <FaLink className="text-green-400 text-sm" />;
        actionColor = "green";
        actionTitle = "Resources";
        actionDescription = `Reference materials for ${currentItem.text}`;
        break;
      default:
        actionIcon = <FaCode className="text-blue-400 text-sm" />;
        actionColor = "blue";
        actionTitle = "Task Breakdown";
        actionDescription = `Why this task matters and what it accomplishes`;
    }
  }

  //use a sliding panel from the right side
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* semi-transparent backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* notion-like panel with slide animation */}
      <div
        className={`absolute inset-y-0 right-0 max-w-4xl w-full bg-gray-900 shadow-2xl shadow-blue-500/5 flex flex-col overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex flex-col gap-1">
            {/* breadcrumb navigation */}
            {isSubtask && parentTask && (
              <div className="flex items-center text-sm text-gray-400">
                <span>{parentTask}</span>
                <span className="mx-2">›</span>
                <span className="text-gray-200">{subtask.text}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 bg-${actionColor}-500/20 rounded-full flex items-center justify-center`}
              >
                {actionIcon}
              </div>
              <h2 className="text-lg font-semibold text-gray-100">
                {actionTitle}: {currentItem.text}
              </h2>
            </div>
          </div>
          {/* <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-2 rounded-full hover:bg-gray-800/50"
          >
            <FaClose />
          </button> */}
        </div>

        {/* tabs for different actions */}
        <div className="border-b border-gray-800">
          <div className="flex px-6">
            {isSubtask ? (
              <>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "implementation"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Implementation Guide
                </button>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "technical"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Technical Prompt
                </button>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "development"
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Development Resources
                </button>
              </>
            ) : (
              <>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "breakdown"
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Task Breakdown
                </button>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "prompt"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Smart Prompt
                </button>
                <button
                  className={`py-3 px-4 border-b-2 ${
                    action === "resources"
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-500 hover:text-gray-400"
                  }`}
                >
                  Resources
                </button>
              </>
            )}
          </div>
        </div>

        {/* panel content */}
        <div className="flex-1 overflow-y-auto p-6">
          {(() => {
            if (isSubtask) {
              switch (action) {
                case "implementation":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Implementation Guide
                        </h3>
                        <p className="text-gray-400 mt-2">
                          Step-by-step guide for implementing {currentItem.text}
                        </p>
                      </div>

                      {/* steps section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Implementation Steps
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm">
                                1
                              </span>
                              <h5 className="text-gray-200 font-medium">
                                Setup Dependencies
                              </h5>
                            </div>
                            <p className="mt-2 text-gray-400 text-sm pl-9">
                              Install and configure required packages...
                            </p>
                            <div className="mt-3 pl-9">
                              <pre className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-300 font-mono">
                                npm install @api-package/core
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* code examples */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Code Examples
                        </h4>
                        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                          <div className="border-b border-gray-700 p-3 flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              example.ts
                            </span>
                            <button className="text-gray-500 hover:text-gray-300">
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 text-sm text-gray-300 font-mono">
                            <code>{`import { API } from '@api/core';\n\nasync function setup() {\n  // Implementation code...\n}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  );

                case "technical":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Technical Prompt
                        </h3>
                        <p className="text-gray-400 mt-2">
                          Code-focused prompts for {currentItem.text}
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {`I'm working on implementing ${
                            currentItem.text
                          } for a web application.
                            Technical Context:
                            - Subtask: ${currentItem.text}
                            - Parent Task: ${parentTask}
                            - Status: ${
                              currentItem.completed
                                ? "Completed"
                                : "In Progress"
                            }

                            Please provide:
                            1. Detailed code implementation
                            2. Handling edge cases specific to this functionality
                            3. Unit testing approach
                            4. Performance optimization tips`}
                        </pre>
                        <button className="mt-4 w-full bg-purple-600/20 text-purple-400 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                          Copy to Clipboard
                        </button>
                      </div>
                    </div>
                  );

                case "development":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Development Resources
                        </h3>
                        <p className="text-gray-400 mt-2">
                          API documentation and code references for{" "}
                          {currentItem.text}
                        </p>
                      </div>

                      {/* API docs */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          API Documentation
                        </h4>
                        <div className="space-y-2">
                          <a
                            href="#"
                            className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FaBook className="text-blue-400" />
                              <div>
                                <h5 className="text-gray-200">API Reference</h5>
                                <p className="text-sm text-gray-400 mt-1">
                                  Complete technical documentation
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>

                      {/* code examples */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Code Snippets
                        </h4>
                        <div className="space-y-2">
                          <a
                            href="#"
                            className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FaCode className="text-purple-400" />
                              <div>
                                <h5 className="text-gray-200">
                                  Sample Implementation
                                </h5>
                                <p className="text-sm text-gray-400 mt-1">
                                  Ready-to-use code examples
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
            } else {
              switch (action) {
                case "breakdown":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Task Breakdown
                        </h3>
                        <p className="text-gray-400 mt-2">
                          Why this task matters for the project
                        </p>
                      </div>

                      {/* importance section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Task Importance
                        </h4>
                        <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
                          <p className="text-gray-300">
                            This task is critical because it establishes the
                            foundation for {task.text.toLowerCase()}, which is
                            essential for the project's success.
                          </p>

                          <div className="mt-4 flex gap-3 flex-wrap">
                            <div className="bg-blue-500/10 px-3 py-1.5 rounded-full text-xs text-blue-400">
                              Core Functionality
                            </div>
                            <div className="bg-purple-500/10 px-3 py-1.5 rounded-full text-xs text-purple-400">
                              User Experience
                            </div>
                            <div className="bg-green-500/10 px-3 py-1.5 rounded-full text-xs text-green-400">
                              Project Structure
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* subtasks progress */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-300">
                            Implementation Progress
                          </h4>
                          <span className="text-xs text-gray-400">
                            {task.subtasks
                              ? `${
                                  task.subtasks.filter((st) => st.completed)
                                    .length
                                }/${task.subtasks.length} completed`
                              : "0/0 completed"}
                          </span>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                          {task.subtasks && task.subtasks.length > 0 ? (
                            <div className="space-y-2">
                              {task.subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  className="flex items-center gap-3"
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      st.completed
                                        ? "bg-blue-500"
                                        : "bg-gray-600"
                                    }`}
                                  ></div>
                                  <span
                                    className={`text-sm ${
                                      st.completed
                                        ? "text-gray-400 line-through"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {st.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              No subtasks defined yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                case "prompt":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Smart Prompt
                        </h3>
                        <p className="text-gray-400 mt-2">
                          Strategic planning prompts for {currentItem.text}
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {`I'm working on planning ${
                            currentItem.text
                          } for a web application.
                            Project Context:
                            - Task: ${currentItem.text}
                            - Progress: ${
                              currentItem.subtasks?.filter((st) => st.completed)
                                .length || 0
                            }/${
                            currentItem.subtasks?.length || 0
                          } subtasks completed
                            - Subtasks: ${
                              currentItem.subtasks
                                ?.map((st) => st.text)
                                .join(", ") || "None defined"
                            }

                            Please provide:
                            1. High-level architecture recommendations
                            2. Implementation strategy
                            3. Common pitfalls to avoid
                            4. Testing approach
                            5. Resource planning`}
                        </pre>
                        <button className="mt-4 w-full bg-purple-600/20 text-purple-400 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                          Copy to Clipboard
                        </button>
                      </div>
                    </div>
                  );

                case "resources":
                  return (
                    <div className="space-y-6">
                      <div className="border-b border-gray-800 pb-4">
                        <h3 className="text-xl font-semibold text-gray-100">
                          Resources
                        </h3>
                        <p className="text-gray-400 mt-2">
                          Reference materials for {currentItem.text}
                        </p>
                      </div>

                      {/* official docs */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Helpful link
                        </h4>
                        <div className="space-y-2">
                          <a
                            href="#"
                            className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FaBook className="text-blue-400" />
                              <div>
                                <h5 className="text-gray-200">
                                  API Documentation
                                </h5>
                                <p className="text-sm text-gray-400 mt-1">
                                  Complete API reference and guides
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>

                      {/* community resources */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Community Resources
                        </h4>
                        <div className="space-y-2">
                          <a
                            href="#"
                            className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FaCode className="text-purple-400" />
                              <div>
                                <h5 className="text-gray-200">
                                  Example Repository
                                </h5>
                                <p className="text-sm text-gray-400 mt-1">
                                  Community-maintained examples and patterns
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
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default TaskActionPanel;
