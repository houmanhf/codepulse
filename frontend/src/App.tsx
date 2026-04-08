import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import SnippetDetail from "@/pages/SnippetDetail";
import NewSnippet from "@/pages/NewSnippet";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snippets/new"
            element={
              <ProtectedRoute>
                <NewSnippet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snippets/:id"
            element={
              <ProtectedRoute>
                <SnippetDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}