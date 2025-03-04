import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signoutSuccess } from "../redux/userSlice";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  const handleSignout = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/user/signout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        //clear current user and thier saved stacks
        dispatch(signoutSuccess());
        // dispatch(clearSavedStacks());
        navigate("/sign-in");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Get current page title based on path
  // const getPageTitle = () => {
  //   const path = location.pathname;
  //   if (path === "/home") return "Discover";
  //   if (path === "/projectinput") return "Create Project";
  //   if (path === "/createdstacks") return "Your Stacks";
  //   if (path === "/stats") return "Statistics";
  //   if (path === "/activity") return "Activity";
  //   if (path === "/rewards") return "Rewards";
  //   if (path === "/profile") return "Profile";
  //   return "LearnStack";
  // };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0f1218] text-white px-8 py-4 ml-[70px] border-b border-gray-800">
      <div className="flex justify-end items-center">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Welcome, <span className="text-white font-medium">{currentUser.name}</span>
            </div>
            <button
              onClick={() => handleSignout()}
              className="px-3 py-1 rounded-xl font-bold bg-[#1a1f29]"
            >
              <p>Sign Out</p>
            </button>
          </div>
        ) : (
          <button
            className="px-6 py-2 rounded-lg font-medium bg-[#8e5fe7]"
            onClick={() => navigate("/sign-in")}
          >
            <p>Sign In</p>
          </button>
        )}
      </div>
    </header>
  );
}
