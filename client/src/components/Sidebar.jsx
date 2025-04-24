import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCog, FaSignOutAlt, FaThumbtack, FaTrash } from "react-icons/fa";
import { TbBottleFilled } from "react-icons/tb";
import { signoutSuccess } from "../redux/userSlice";
import { setTasksSuccess } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUserProjects, getProjectWithTasks } from "../utils/api";
import { setProjectsStart, setProjectsFailure } from "../redux/projectSlice";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPopup, setShowPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const { projects: userProjects, currentProject } = useSelector(
    (state) => state.projects
  );

  // Sort projects: pinned first, then by date
  const sortedProjects = [...userProjects].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const sidebarRef = useRef(null);

  useEffect(() => {
  //   console.log("Sidebar state:", {
  //     currentUser: !!currentUser,
  //     projectsCount: userProjects.length,
  //     currentProject: currentProject?._id,
  //   });

    const fetchProjects = async () => {
      if (currentUser) {
        try {
          setIsLoadingProjects(true);
          const data = await getUserProjects();
          // console.log("Fetched projects:", data);

          if (data && data.projects) {
            dispatch(setProjectsSuccess(data.projects));
          } else {
            dispatch(setProjectsSuccess([]));
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          dispatch(setProjectsFailure(error.message));
        } finally {
          setIsLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [currentUser, dispatch]);

  const handleProjectSelect = async (projectId) => {
    try {
      // console.log("Selecting project:", projectId);
      const data = await getProjectWithTasks(projectId);
      // console.log("Project data received:", data);

      if (data && data.project) {
        dispatch(setCurrentProject(data.project));
        if (data.tasks) {
          dispatch(setTasksSuccess(data.tasks));
        }
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/user/signout`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        // console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate("/sign-in");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleClickOutside = (e) => {
    if (showPopup) {
      setShowPopup(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handlePinProject = async (e, projectId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/pin`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (response.ok) {
        const updatedProjects = userProjects.map(project => 
          project._id === projectId ? { ...project, pinned: !project.pinned } : project
        );
        dispatch(setProjectsSuccess(updatedProjects));
      }
    } catch (error) {
      console.error('Error pinning project:', error);
    }
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectToDelete._id}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const updatedProjects = userProjects.filter(p => p._id !== projectToDelete._id);
        dispatch(setProjectsSuccess(updatedProjects));
        
        if (currentProject?._id === projectToDelete._id) {
          dispatch(setCurrentProject(null));
          dispatch(setTasksSuccess([]));
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-screen w-[70px] bg-white text-brand-black z-40 flex flex-col transition-all duration-300 ease-out hover:w-[250px] group overflow-hidden"
        style={{ borderRight: "1px solid rgba(0,0,0,0.1)" }}
        onClick={handleClickOutside}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center ml-1 p-4">
          <div className="min-w-[30px] flex justify-center">
            <TbBottleFilled className="text-3xl text-brand-yellow" />
          </div>
          <div className="ml-3 font-bold text-xl whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Plansauce
          </div>
        </div>

        <div className="px-2 mt-4">
          <div
            className="flex items-center my-2 p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-100"
            onClick={() => navigate("/projectinput")}
          >
            <div className="min-w-[30px] flex justify-center text-brand-gray">
              <FaPlus className="text-xl" />
            </div>
            <div className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-brand-gray">
              New Idea
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2">
          <div className="mt-6 mb-2 hidden group-hover:block">
            <div className="text-xs text-brand-gray px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Created
            </div>

            <div className="mt-2">
              {isLoadingProjects ? (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-t-2 border-brand-yellow rounded-full animate-spin"></div>
                </div>
              ) : sortedProjects.length > 0 ? (
                sortedProjects.map((project) => (
                  <div
                    key={project._id}
                    className={`group/item flex items-center py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-1 ${
                      currentProject?._id === project._id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleProjectSelect(project._id)}
                  >
                    <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center">
                        <div className="text-sm text-brand-black truncate">
                          {project.name}
                        </div>
                        {project.pinned && (
                          <FaThumbtack className="text-brand-yellow ml-2 h-3 w-3 rotate-45" />
                        )}
                      </div>
                      <div className="text-xs text-brand-gray">
                        {formatDate(project.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handlePinProject(e, project._id)}
                        className={`p-1.5 rounded-full hover:bg-gray-200 transition-colors ${project.pinned ? 'text-brand-yellow' : 'text-gray-400'}`}
                        title={project.pinned ? "Unpin project" : "Pin project"}
                      >
                        <FaThumbtack className={`h-3 w-3 ${project.pinned ? 'rotate-45' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete project"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-brand-gray opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  No projects yet. Create one!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div
            className="p-4 flex items-center cursor-pointer w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (isHovered) {
                setShowPopup(!showPopup);
              }
            }}
          >
            <div className="min-w-[30px] w-[30px] flex-shrink-0 flex justify-center">
              <div className="size-8 rounded-md bg-brand-yellow flex items-center justify-center text-sm font-medium text-brand-black flex-shrink-0">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-5 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-lg font-bold truncate text-brand-black">
                {currentUser?.name}
              </div>
            </div>
          </div>

          {showPopup && isHovered && (
            <div
              className="absolute bottom-[60px] left-4 bg-white rounded-md shadow-lg p-1 min-w-[150px] z-50 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center px-3 py-2 text-brand-gray hover:bg-gray-100 hover:text-brand-black rounded cursor-pointer transition-colors"
                onClick={() => navigate("/settings")}
              >
                <FaCog className="text-lg" />
                <span className="ml-2">Settings</span>
              </div>
              <div
                className="flex items-center px-3 py-2 text-brand-gray hover:bg-gray-100 hover:text-brand-black rounded cursor-pointer transition-colors"
                onClick={handleSignOut}
              >
                <FaSignOutAlt className="text-lg" />
                <span className="ml-2">Sign out</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
