import { FaCheckCircle, FaRegCircle, FaBook, FaChevronRight } from "react-icons/fa";

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
      className="flex items-center gap-2 py-1 px-8 relative group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      onClick={handleSubtaskClick}
    >
      <div
        onDoubleClick={handleSubtaskCompletion}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 h-4 w-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
        role="button"
        aria-label={subtask.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
        title={subtask.completed ? "Double-click to mark as incomplete" : "Double-click to mark as complete"}
      >
        {subtask.completed ? (
          <FaCheckCircle className="text-brand-yellow text-sm" />
        ) : (
          <FaRegCircle className="text-gray-300 hover:text-gray-400 text-sm" />
        )}
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <p className={`${subtask.completed ? "line-through text-gray-400" : "text-gray-600"} text-xs flex-1 break-normal`}>
          {subtask.text}
        </p>

        <div className="flex items-center flex-shrink-0">
          <button 
            onClick={(e) => handleActionClick(e, 'prompt')}
            className="px-2 py-1 rounded-md text-xs bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          >
            <span>Get Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subtask;