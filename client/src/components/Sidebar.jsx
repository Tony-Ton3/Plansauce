import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TbStack3Filled } from "react-icons/tb";
import { FaHome, FaPlus, FaLayerGroup, FaChartBar, FaUser } from "react-icons/fa";
import { MdOutlineExplore } from "react-icons/md";
import { IoMdTrophy } from "react-icons/io";
import { BsLightningChargeFill } from "react-icons/bs";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarItems = [
        {
            name: "Discover",
            icon: <MdOutlineExplore className="text-xl" />,
            path: "/home"
        },
        {
            name: "Stats",
            icon: <FaChartBar className="text-xl" />,
            path: "/stats"
        },
        {
            name: "Activity",
            icon: <BsLightningChargeFill className="text-xl" />,
            path: "/activity"
        },
        {
            name: "Rewards",
            icon: <IoMdTrophy className="text-xl" />,
            path: "/rewards"
        },
        {
            name: "Create",
            icon: <FaPlus className="text-xl" />,
            path: "/projectinput"
        },
        {
            name: "Stacks",
            icon: <FaLayerGroup className="text-xl" />,
            path: "/createdstacks"
        },
        {
            name: "Profile",
            icon: <FaUser className="text-xl" />,
            path: "/profile"
        },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div
            className="fixed left-0 top-0 h-screen w-[70px] bg-[#0f1218] text-white z-40 flex flex-col transition-all duration-300 ease-out hover:w-[220px] group"
            style={{
                boxShadow: "none",
                borderRight: "none"
            }}
        >
            {/* Logo */}
            <div className="flex items-center p-4 mb-6">
                <div className="min-w-[30px] flex justify-center">
                    <TbStack3Filled className="text-2xl text-white" />
                </div>
                <div className="ml-3 font-nerko text-xl whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    LearnStack
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto px-2">
                {sidebarItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <div
                            key={index}
                            className={`flex items-center my-2 p-3 rounded-xl cursor-pointer transition-colors relative ${active ? "bg-[#1a1f29]" : "hover:bg-[#1a1f29]"
                                }`}
                            onClick={() => navigate(item.path)}
                        >
                            <div className={`min-w-[30px] flex justify-center ${active ? "text-white" : "text-gray-400"}`}>
                                {item.icon}
                            </div>
                            <div
                                className={`ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? "font-medium text-white" : "text-gray-400"
                                    }`}
                            >
                                {item.name}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Button (Bottom) */}
            <div
                className="mx-2 my-2 p-3 bg-[#8e5fe7] hover:bg-opacity-90 cursor-pointer rounded-xl"
                onClick={() => navigate('/projectinput')}
            >
                <div className="flex items-center">
                    <div className="min-w-[30px] flex justify-center">
                        <FaPlus className="text-white text-xl" />
                    </div>
                    <div className="ml-3 text-white font-medium whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        New Project
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;