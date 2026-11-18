/**
 * ProtectedLayout — wraps every authenticated page.
 *
 * Renders:  Navbar + Sidebar + <Outlet /> (the active page).
 * Redirects to /login if the user is not authenticated.
 * Shows a full-screen spinner while the initial auth check is in progress.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Spinner from "../ui/Spinner";

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      {/* Main content area — offset by navbar height (4rem) + sidebar width (14rem) */}
      <main className="pt-16 pl-56">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
