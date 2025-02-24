import { useEffect, useRef } from "react";
import TechTutorials from "./TechTutorials";
import { FaRegCircleXmark } from "react-icons/fa6";

const TechPopUp = ({ tech, techTutorials, setExpandedTech }) => {
  const modalRef = useRef(null);

  const closeModal = () => {
    setExpandedTech(null);
  };

  //allows to exist modal with esc key and outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  if (!tech) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-neutral-950 rounded-lg max-w-3xl mx-auto relative"
      >
        <div className="p-6">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
          >
            <FaRegCircleXmark className="hover:scale-110" />
          </button>
          <h3 className="text-lg font-medium text-white mb-4">{tech.name}</h3>
          <div className="text-white">
            <p className="mb-2">
              <strong>Description:</strong> {tech.description}
            </p>
            <p className="mb-2">
              <strong>Documentation:</strong>{" "}
              <a
                href={tech.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Documentation
              </a>
            </p>
            <p className="mb-2">
              <strong>Prerequisites:</strong> {tech.prerequisites.join(", ")}
            </p>
            <TechTutorials
              tech={tech.name}
              techTutorials={techTutorials[tech.name] || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechPopUp;