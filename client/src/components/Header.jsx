import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TbStack3Filled } from "react-icons/tb";
import { signoutSuccess } from "../redux/userSlice";
import { motion } from "framer-motion";

export default function Header() {
  const tabs = ["Home", "Create", "Stacks"];
  const [selected, setSelected] = useState(tabs[0]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/home") setSelected("Home");
    else if (path === "/projectinput") setSelected("Create");
    else if (path === "/createdstacks") setSelected("Stacks");
  }, [location]);

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

  const Chip = ({ text, selected, setSelected }) => {
    return (
      <button
        onClick={() => {
          setSelected(text);
          if (text === "Home") navigate("/home");
          else if (text === "Create") navigate("/projectinput");
          else if (text === "Stacks") navigate("/createdstacks");
        }}
        className={`${
          selected
            ? "text-background"
            : " hover:text-background hover:bg-accent"
        } text-sm font-bold transition-colors px-2.5 py-0.5 rounded-md relative`}
      >
        <span className="relative z-10">{text}</span>
        {selected && (
          <motion.span
            layoutId="pill-tab"
            transition={{ type: "spring", duration: 0.5 }}
            className="absolute inset-0 z-0 bg-gradient-to-r from-secondary to-accent rounded-md"
          ></motion.span>
        )}
      </button>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md text-white px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center space-x-2">
          <TbStack3Filled className="size-10 bg-secondary text-background rounded-lg p-1 border-2 border-dashed" />
          <h1 className="font-nerko text-4xl text-white font-bold">LearnStack</h1>
        </div>

        <div className="font-bold flex items-center gap-2">
          {tabs.map((tab) => (
            <Chip
              text={tab}
              selected={selected === tab}
              setSelected={setSelected}
              key={tab}
            />
          ))}
        </div>
        {currentUser ? (
          <div className="rounded-lg flex items-center justify-center">
            <button
              onClick={() => handleSignout()}
              className="px-3 py-1 rounded-xl font-bold bg-secondary"
            >
              <p>Sign Out</p>
            </button>
          </div>
        ) : (
          <button
            className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-secondary to-accent text-background w-fit transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => navigate("/sign-in")}
          >
            <p>Sign In</p>
          </button>
        )}
      </div>
    </header>
  );
}
