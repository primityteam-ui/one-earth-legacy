import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Wall from "./pages/Wall.jsx";
import Donate from "./pages/Donate.jsx";
import DonationSuccess from "./pages/DonationSuccess.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Legends from "./pages/Legends.jsx";
import Globe from "./pages/Globe.jsx";
import Profile from "./pages/Profile.jsx";
import Emperor from "./pages/Emperor.jsx";
import Audit from "./pages/Audit.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-royalBlack text-textPrimary font-body">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wall" element={<Wall />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/donate/success" element={<DonationSuccess />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/legends" element={<Legends />} />
        <Route path="/globe" element={<Globe />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/emperor" element={<Emperor />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/legal/:page" element={<LegalPage />} />
        <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
        <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
        <Route path="/security" element={<Navigate to="/legal/security" replace />} />
        <Route path="/faq" element={<Navigate to="/legal/faq" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}