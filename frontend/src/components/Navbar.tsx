import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-bold text-indigo-400">
              CodePulse
            </Link>
            {user && (
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/snippets/new"
                  className="text-slate-300 hover:text-white text-sm transition-colors"
                >
                  New Snippet
                </Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
