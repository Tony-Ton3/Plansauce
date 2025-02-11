import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className={"flex-1 overflow-auto"}>
        <Outlet />
      </main>
    </div>
  );
}
