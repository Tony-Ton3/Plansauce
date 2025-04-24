import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto ml-[70px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
