import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSavedStackSuccess,
  setSavedStackFailure,
  clearSavedStacks,
} from "../redux/savedstackSlice";
import TechStackExplorer from "../components/TechStackExplorer";
import { FaRegCircleXmark, FaTrashCan } from "react-icons/fa6";
import { IoMdCreate } from "react-icons/io";

export default function Saved() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const { currentSavedStack } = useSelector((state) => state.savedStack);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState(null);
  const [stackToDeleteId, setStackToDeleteId] = useState(null);

  //returns all created stack based on the userId
  useEffect(() => {
    const fetchAllSavedStack = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/user/getallsavedstacks",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to get stacks");
        }
        const data = await response.json();
        //sets saved stack for the user to global state
        dispatch(setSavedStackSuccess(data));
      } catch (error) {
        dispatch(setSavedStackFailure(error.message));
        //if try fails, display no saved stacks
        dispatch(clearSavedStacks());
      }
    };

    fetchAllSavedStack();
  }, [dispatch]);

  //exit modal with outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpenDeleteModal(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleDeleteSavedStack = async (stackId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/user/deletesavedstack/${stackId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete stack");
      }

      // Remove the deleted stack from the currentSavedStack state
      const updatedStacks = currentSavedStack.filter(
        (stack) => stack._id !== stackId
      );
      dispatch(setSavedStackSuccess(updatedStacks));
      setOpenDeleteModal(false);
    } catch (error) {
      console.error("Error deleting stack:", error);
    }
  };

  const handleSelectSavedStack = (stack) => {
    setSelectedStack(stack);
  };

  const handleBackToList = () => {
    setSelectedStack(null);
  };

  const openDeleteConfirmation = (stackId) => {
    setStackToDeleteId(stackId);
    setOpenDeleteModal(true);
  };

  if (selectedStack) {
    return (
      <div>
        <TechStackExplorer
          currentStack={selectedStack}
          isNewSubmission={false}
          handleBackToList={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black mx-auto px-4 py-24 ">
      <div className="flex justify-start items-center ml-4 mb-8">
        <button
          onClick={() => navigate("/projectinput")}
          className="flex items-center px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-secondary to-accent text-background w-fit transition-all shadow-[3px_3px_0px_white] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoMdCreate className="mr-2" /> Create Another
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 ">
        {currentSavedStack?.map((stack, index) => (
          <div
            key={stack.id || index}
            className="flex flex-col h-full bg-secondary shadow-md rounded-lg overflow-hidden border-4 border-dashed cursor-pointer hover:shadow-lg hover:shadow-accent transition-all duration-500 ease-in-out transform hover:scale-105"
          >
            <div className="flex-grow p-6">
              <h3 className="font-bold text-xl mb-2">
                {stack.recommendedStack.name}
              </h3>
              <p className="text-gray-600">
                {stack.recommendedStack.description}
              </p>
              <div className="mt-4">
                <strong>Technologies:</strong>
                <ul className="list-disc list-inside">
                  {stack.recommendedStack.technologies.map((tech) => (
                    <li key={tech._id || tech.name}>{tech.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-evenly p-2 gap-2 mt-auto bg-gray-900 border-t-4 border-dashed">
              <button
                className="bg-primary w-3/4 text-white rounded-lg px-4 py-2 hover:bg-opacity-80 transition-colors duration-300"
                onClick={() => handleSelectSavedStack(stack)}
              >
                Explore Stack
              </button>
              <button
                className="group flex justify-center bg-background hover:bg-red-500 w-1/4 rounded-lg px-4 py-2 hover:bg-opacity-80 transition-colors duration-300"
                onClick={() => openDeleteConfirmation(stack._id)}
              >
                <FaTrashCan className="group-hover:text-white size-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {openDeleteModal && stackToDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-neutral-950 rounded-lg w-full max-w-md mx-auto relative p-6 border border-gray-700 shadow-lg"
          >
            <button
              onClick={() => setOpenDeleteModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200"
            >
              <FaRegCircleXmark className="text-xl hover:scale-110 transition-transform duration-200" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">
              Confirm Deletion
            </h2>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this stack? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSavedStack(stackToDeleteId)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
              >
                <FaTrashCan className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}