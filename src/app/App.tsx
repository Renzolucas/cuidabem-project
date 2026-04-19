import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { useEffect } from "react";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-500 dark:border-t-green-500 rounded-full animate-spin" />
          <p className="text-green-700 dark:text-green-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}