import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreatedStacks from "./pages/CreatedStacks";
import Home from "./pages/Home";
import ProjectInput from "./components/ProjectInput";

export default function App() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route path="home" element={<Home />} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      {currentUser && (
        // private route redirects user to sign in if not logged in
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="projectinput" element={<ProjectInput />} />
            <Route path="createdstacks" element={<CreatedStacks />} />
          </Route>
        </Route>
      )}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
