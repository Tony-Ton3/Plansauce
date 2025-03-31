import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TbStack3Filled } from "react-icons/tb";
import { FaPlus, FaLayerGroup, FaUser, FaSignOutAlt, FaFolder } from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import { signoutSuccess } from "../redux/userSlice";
import { setTasksSuccess } from "../redux/taskSlice";
import { setProjectsSuccess, setCurrentProject } from "../redux/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUserProjects, getProjectWithTasks } from "../utils/api";
import { persistor } from "../redux/store.js";
import { setProjectsStart, setProjectsFailure } from "../redux/projectSlice";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const [showPopup, setShowPopup] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [userProjects, setUserProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const { currentUser } = useSelector(state => state.user);
    
    const sidebarRef = useRef(null);

    const sidebarItems = [
        // {
        //     name: "Stacks",
        //     icon: <FaLayerGroup className="text-xl" />,
        //     path: "/createdstacks"
        // },
        {
            name: "Tasks",
            icon: <BsLightningChargeFill className="text-xl" />,
            path: "/tasks"
        },
    ];

    // Fetch user projects when sidebar is hovered or when navigating to tasks
    useEffect(() => {
        const fetchProjects = async () => {
            if ((isHovered || location.pathname === '/tasks') && currentUser) {
                try {
                    setIsLoadingProjects(true);
                    dispatch(setProjectsStart());
                    const data = await getUserProjects();
                    if (data && data.projects) {
                        setUserProjects(data.projects);
                        dispatch(setProjectsSuccess(data.projects));
                    } else {
                        setUserProjects([]);
                        dispatch(setProjectsSuccess([]));
                    }
                } catch (error) {
                    console.error("Error fetching projects:", error);
                    setUserProjects([]);
                } finally {
                    setIsLoadingProjects(false);
                }
            }
        };
        
        fetchProjects();
    }, [isHovered, location.pathname, currentUser, dispatch]);

    const handleProjectSelect = async (projectId) => {
        try {
            const data = await getProjectWithTasks(projectId);
            if (data && data.tasks) {
                dispatch(setTasksSuccess(data.tasks));
                dispatch(setCurrentProject(data.project));
                navigate("/tasks");
            }
        } catch (error) {
            console.error("Error loading project:", error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        if (!isHovered && showPopup) {
            setShowPopup(false);
        }
    }, [isHovered]);

    const handleSignOut = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/user/signout`, {
            method: "POST",
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) {
            console.log(data.message);
          } else {
            dispatch(signoutSuccess());
            persistor.purge();
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return (
        <div
            ref={sidebarRef}
            className="fixed left-0 top-0 h-screen w-[70px] bg-[#1a1a1a] text-white z-40 flex flex-col transition-all duration-300 ease-out hover:w-[250px] group"
            style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}
            onClick={handleClickOutside}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center ml-1 p-4 border-b border-gray-800">
                <div className="min-w-[30px] flex justify-center">
                    <TbStack3Filled className="text-2xl text-white" />
                </div>
                <div className="ml-3 font-nerko text-xl whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    LearnStack
                </div>
            </div>

            <div className="px-2 mt-4">
                <div 
                    className="flex items-center my-2 p-3 rounded-xl cursor-pointer transition-colors hover:bg-[#2a2a2a]"
                    onClick={() => navigate("/projectinput")}
                >
                    <div className="min-w-[30px] flex justify-center text-gray-400">
                        <FaPlus className="text-xl" />
                    </div>
                    <div className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400">
                        New Idea
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                {sidebarItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <div
                            key={index}
                            className={`flex items-center my-2 p-3 rounded-xl cursor-pointer transition-colors relative ${
                                active ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <div className={`min-w-[30px] flex justify-center ${active ? "text-white" : "text-gray-400"}`}>
                                {item.icon}
                            </div>
                            <div
                                className={`ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                    active ? "font-medium text-white" : "text-gray-400"
                                }`}
                            >
                                {item.name}
                            </div>
                        </div>
                    );
                })}
                
                <div className="mt-6 mb-2 hidden group-hover:block">
                    <div className="text-xs text-gray-400 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Your Projects
                    </div>
                    
                    <div className="mt-2">
                        {isLoadingProjects ? (
                            <div className="flex justify-center py-3">
                                <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                            </div>
                        ) : userProjects.length > 0 ? (
                            userProjects.map((project) => (
                                <div 
                                    key={project._id}
                                    className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                                    onClick={() => handleProjectSelect(project._id)}
                                >
                                    <div className="min-w-[30px] flex justify-center text-gray-400">
                                        <FaFolder className="text-lg" />
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-sm text-gray-300 truncate">{project.name}</div>
                                        <div className="text-xs text-gray-500">{formatDate(project.createdAt)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                No projects yet. Create one!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto p-3 border-t border-gray-800 flex items-center relative">
                <div 
                    className="flex items-center cursor-pointer w-full" 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isHovered) {
                            setShowPopup(!showPopup);
                        }
                    }}
                >
                    <div className="min-w-[30px] flex justify-center">
                        <div className="w-8 h-8 rounded-md bg-gray-600 flex items-center justify-center text-sm font-medium">
                            TF
                        </div>
                    </div>
                    <div className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-sm font-normal">Tony Ferriera</div>
                    </div>
                </div>
                
                {showPopup && isHovered && (
                    <div 
                        className="absolute bottom-16 left-1 bg-[#2a2a2a] rounded-md shadow-lg p-1 min-w-[150px] z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className="flex items-center px-3 py-1 text-gray-300 hover:bg-[#333] hover:text-white rounded cursor-pointer transition-colors"
                            onClick={handleSignOut}
                        >
                            <span>Sign out</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;