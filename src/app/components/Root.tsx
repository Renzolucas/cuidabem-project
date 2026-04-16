import { Outlet, Link, useLocation } from "react-router";
import { Pill, Clock, Sun, Moon, User } from "lucide-react";
import { Toaster } from "./ui/sonner";
import { Button } from "./ui/button";
import { useAlarms } from "../hooks/useAlarms";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export function Root() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  useAlarms();

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const avatarLetter = displayName[0]?.toUpperCase() || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const isMedicines =
    location.pathname === "/" ||
    location.pathname.startsWith("/remedio") ||
    location.pathname.startsWith("/adicionar");
  const isSchedules = location.pathname === "/horarios";
  const isProfile = location.pathname === "/perfil";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-green-100 dark:border-gray-700 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-green-800 dark:text-green-400 text-xl">CuidaBEM</h1>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-gray-800 p-2"
                title={isDark ? "Tema Claro" : "Tema Escuro"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* User avatar shortcut */}
              <Link to="/perfil" title={displayName}>
                <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-green-200 dark:ring-green-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-2 ring-green-200 dark:ring-green-800">
                      <span className="text-sm font-bold text-white">{avatarLetter}</span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 max-w-24 truncate">
                    {displayName}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-900 border-b border-green-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <Link
              to="/"
              className={`px-5 py-3 transition-colors relative text-sm font-medium ${
                isMedicines
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Pill className="w-4 h-4" />
                <span>Meus Remédios</span>
              </div>
              {isMedicines && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t" />
              )}
            </Link>

            <Link
              to="/horarios"
              className={`px-5 py-3 transition-colors relative text-sm font-medium ${
                isSchedules
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Horários</span>
              </div>
              {isSchedules && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t" />
              )}
            </Link>

            <Link
              to="/perfil"
              className={`px-5 py-3 transition-colors relative text-sm font-medium ${
                isProfile
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </div>
              {isProfile && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t" />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
