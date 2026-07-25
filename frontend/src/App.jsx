import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./routes/ProtectedRoutes";
import RoleRoute from "./routes/RoleRoutes";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import OrganizerDashboard from "./pages/dashboards/OrganizerDashboard";
import ParticipantDashboard from "./pages/dashboards/ParticipantDashboard";
import JudgeDashboard from "./pages/dashboards/JudgeDashboard";
import HackathonDetails from "./pages/HackathonDetails";
import HackathonListing from "./pages/HackathonListing";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/organizer/dashboard"
          element={
            <RoleRoute allowedRoles={["organizer"]}>
              <OrganizerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/participant/dashboard"
          element={
            <RoleRoute allowedRoles={["participant"]}>
              <ParticipantDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/judge/dashboard"
          element={
            <RoleRoute allowedRoles={["judge"]}>
              <JudgeDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/hackathons/:id"
          element={
            <ProtectedRoute>
              <HackathonDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/hackathons" element={<HackathonListing />} />
      </Routes>
    </div>
  );
}

export default App;