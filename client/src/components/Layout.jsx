import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
      {/* <Header /> */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto ml-[70px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
