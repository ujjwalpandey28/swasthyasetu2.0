import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DemoSwitcher } from "@/components/shared/DemoSwitcher";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/dto/constants/UserRole";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isPatient = user?.role === UserRole.PATIENT;

  return (
    <div className="flex min-h-screen bg-bg">
      {!isPatient && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} hasSidebar={!isPatient} />
        <main className={`flex-1 p-4 md:p-6 pb-16 ${isPatient ? "max-w-6xl mx-auto w-full" : ""}`}>
          <Outlet />
        </main>
      </div>
      <DemoSwitcher />
    </div>
  );
}