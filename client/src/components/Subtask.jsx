import { FaChevronRight } from "react-icons/fa";
import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { IoCopy } from "react-icons/io5";


const Subtask = ({
  subtask,
  parentId,
  parentText,
  onSelectSubtask,
}) => {
  const [copied, setCopied] = useState(false);

  const handleSubtaskClick = () => {
    onSelectSubtask(subtask, parentId, parentText, null);
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(subtask.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div
      className="flex items-center gap-2 py-1 px-8 relative group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
      onClick={handleSubtaskClick}
    >
      <div className="flex-shrink-0 h-4 w-4 flex items-center justify-center relative text-gray-400">
        •
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <p className="text-gray-600 text-xs flex-1 break-normal">
          {subtask.text}
        </p>

        <div className="flex items-center flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors relative group/copy opacity-0 group-hover:opacity-100"
            aria-label="Copy subtask text"
          >
            {copied ? (
              <FiCheck className="text-green-500 text-sm" />
            ) : (
              <>
                <IoCopy className="text-gray-400 group-hover/copy:text-gray-600 text-sm" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subtask;