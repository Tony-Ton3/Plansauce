import { FaCheckCircle, FaRegCircle, FaCode, FaBook, FaLink } from "react-icons/fa";

const Subtask = ({
  subtask,
  parentId,
  parentText,
  toggleSubtaskCompletion,
  onSelectSubtask,
}) => {
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    onSelectSubtask(subtask, parentId, parentText, action);
  };

  const handleSubtaskCompletion = (e) => {
    e.stopPropagation();
    toggleSubtaskCompletion(parentId, subtask.id);
  };

  const handleSubtaskClick = () => {
    onSelectSubtask(subtask, parentId, parentText, null);
  };

  return (
    <div
      className="flex items-center gap-3 py-2 pl-8 relative group hover:bg-gray-800/30 rounded-md transition-colors cursor-pointer"
      onClick={handleSubtaskClick}
    >
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      <div className="absolute left-4 top-1/2 w-4 h-0.5 bg-gray-800 group-hover:bg-gray-700"></div>
      <div
        onDoubleClick={handleSubtaskCompletion}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 h-7 w-7 flex items-center justify-center cursor-pointer hover:bg-gray-800/50 rounded-full transition-colors"
        role="button"
        aria-label={
          subtask.completed
            ? "Double-click to mark as incomplete"
            : "Double-click to mark as complete"
        }
        title={
          subtask.completed
            ? "Double-click to mark as incomplete"
            : "Double-click to mark as complete"
        }
      >
        {subtask.completed ? (
          <FaCheckCircle className="text-brand-yellow" />
        ) : (
          <FaRegCircle className="hover:text-gray-200" />
        )}
      </div>

      <div className="flex-grow flex items-center justify-between cursor-pointer">
        <p className={`${subtask.completed ? "line-through" : ""} text-sm`}>
          {subtask.text}
        </p>

        {/* subtask action buttons - Implementation Guide, Technical Prompt, Development Resources */}
        {/* <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2" onClick={e => e.stopPropagation()}>
          <button 
            onClick={(e) => handleActionClick(e, 'implementation')}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="Implementation Guide"
            title="Implementation Guide"
          >
            <FaCode />
          </button>
          <button 
            onClick={(e) => handleActionClick(e, 'technical')}
            className="text-xs text-gray-400 hover:text-purple-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="Technical Prompt"
            title="Technical Prompt"
          >
            <FaBook />
          </button>
          <button 
            onClick={(e) => handleActionClick(e, 'development')}
            className="text-xs text-gray-400 hover:text-green-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full" 
            aria-label="Development Resources"
            title="Development Resources"
          >
            <FaLink />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Subtask;