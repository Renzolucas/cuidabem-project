import { useState } from "react";
import { User, Mail, LogOut, Trash2, Shield, Bell, Pill, Clock, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { getMedicines, getSchedules } from "../utils/storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const medicines = getMedicines();
  const schedules = getSchedules();

  const displayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const displayEmail = user?.email || "";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";
  const isGoogleUser = user?.app_metadata?.provider === "google";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
    toast.success("Você saiu da sua conta.");
    setLoggingOut(false);
    setShowLogoutDialog(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-green-100 dark:ring-green-900"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-4 ring-green-100 dark:ring-green-900">
                <span className="text-3xl font-bold text-white">{avatarLetter}</span>
              </div>
            )}
            {isGoogleUser && (
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-100 dark:border-gray-600">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-gray-900 dark:text-gray-100 truncate">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <p className="text-xs text-green-600 dark:text-green-400">
                {isGoogleUser ? "Conta Google" : "Conta com e-mail"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Membro desde {memberSince}
          </p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{medicines.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {medicines.length === 1 ? "Remédio cadastrado" : "Remédios cadastrados"}
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700 text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{schedules.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {schedules.length === 1 ? "Horário configurado" : "Horários configurados"}
          </p>
        </Card>
      </div>

      {/* About */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
        <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
          Sobre o CuidaBEM
        </h3>
        <div className="space-y-3">
          {[
            { label: "Alarmes inteligentes", desc: "Notificações no horário certo" },
            { label: "Leitura com IA", desc: "Scan de embalagens com Gemini AI" },
            { label: "Tema claro/escuro", desc: "Preferência salva automaticamente" },
            { label: "Dados separados", desc: "Cada conta tem suas próprias informações" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            </div>
          ))}
        </div>
      </Card>

      {/* Account actions */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
        <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-green-600 dark:text-green-400" />
          Conta
        </h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setShowLogoutDialog(true)}
            className="w-full justify-start gap-3 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </Card>

      {/* Logout confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Você será desconectado do CuidaBEM. Seus dados ficam salvos e você pode entrar novamente a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {loggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saindo...
                </div>
              ) : (
                "Sair"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
