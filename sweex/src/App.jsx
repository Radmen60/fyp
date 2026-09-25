import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Materials from './pages/Materials.jsx';
import AddMaterial from './pages/AddMaterial.jsx';
import MaterialDetail from './pages/MaterialDetail.jsx';
import Matches from './pages/Matches.jsx';
import Users from './pages/Users.jsx';
import Stats from './pages/Stats.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
        <Route path="/materials/add" element={<ProtectedRoute><AddMaterial /></ProtectedRoute>} />
        <Route path="/materials/:id" element={<ProtectedRoute><MaterialDetail /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/stats" element={<AdminRoute><Stats /></AdminRoute>} />

        <Route path="*" element={<div className="page"><p>Page not found.</p></div>} />
      </Routes>
    </AuthProvider>
  );
}
