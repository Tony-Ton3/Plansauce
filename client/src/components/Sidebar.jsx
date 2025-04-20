import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbStack3Filled } from "react-icons/tb";
import { FaPlus, FaFolder, FaCog, FaSignOutAlt } from "react-icons/fa";
import { signoutSuccess } from "../redux/userSlice";
import { setTasksSuccess } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUserProjects, getProjectWithTasks } from "../utils/api";
import { setProjectsStart, setProjectsFailure } from "../redux/projectSlice";
import { TbBottleFilled } from "react-icons/tb";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPopup, setShowPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const { projects: userProjects, currentProject } = useSelector(
    (state) => state.projects
  );

  const sidebarRef = useRef(null);

  // Single useEffect for fetching projects
  useEffect(() => {
    console.log("Sidebar state:", {
      currentUser: !!currentUser,
      projectsCount: userProjects.length,
      currentProject: currentProject?._id,
    });

    const fetchProjects = async () => {
      if (currentUser) {
        try {
          setIsLoadingProjects(true);
          const data = await getUserProjects();
          console.log("Fetched projects:", data);

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
      console.log("Selecting project:", projectId);
      const data = await getProjectWithTasks(projectId);
      console.log("Project data received:", data);

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
        console.log(data.message);
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

  return (
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
            ) : userProjects.length > 0 ? (
              userProjects.map((project) => (
                <div
                  key={project._id}
                  className={`flex items-center py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-1 ${
                    currentProject?._id === project._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleProjectSelect(project._id)}
                >
                  <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-sm text-brand-black truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-brand-gray">
                      {formatDate(project.createdAt)}
                    </div>
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
  );
}

export default Sidebar;
