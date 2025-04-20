import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import Home from "./pages/Home";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import QuizIntro from "./pages/QuizIntro";
import Quiz from "./pages/Quiz";
import CreatedStacks from "./pages/CreatedStacks";

import ProjectInput from "./components/ProjectInput";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Favicon from "./components/Favicon";

export default function App() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <>
      <Favicon />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Protected routes - PrivateRoute component handles redirect if not logged in */}
        <Route element={<PrivateRoute />}>
          <Route path="/quiz-intro" element={<QuizIntro />} />
          <Route path="/quiz" element={<Quiz />} />

          <Route element={<Layout />}>
            {/* <Route path="home" element={<Home />} /> */}
            <Route path="settings" element={<Settings />} />
            <Route path="projectinput" element={<ProjectInput />} />
            <Route path="createdstacks" element={<CreatedStacks />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
        </Route>

        {/* Catch-all route - redirect to home or sign-in based on auth status */}
        <Route
          path="*"
          element={
            currentUser ? <Navigate to="/" /> : <Navigate to="/sign-in" />
          }
        />
      </Routes>
    </>
  );
}
