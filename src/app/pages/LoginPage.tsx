import { useState } from "react";
import { Pill, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

type Mode = "login" | "register";

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!form.email || !form.password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    if (mode === "register" && !form.name.trim()) {
      toast.error("Informe seu nome.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await signUp(form.email, form.password, form.name.trim());
        if (error) {
          // Translate common error messages
          if (error.includes("already registered") || error.includes("already been registered")) {
            toast.error("Este e-mail já está cadastrado. Tente fazer login.");
          } else {
            toast.error(error);
          }
        } else {
          toast.success("Conta criada! Bem-vindo ao CuidaBEM 🎉");
        }
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          if (error.includes("Invalid login") || error.includes("invalid credentials")) {
            toast.error("E-mail ou senha incorretos.");
          } else {
            toast.error(error);
          }
        } else {
          toast.success("Bem-vindo de volta!");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Erro ao conectar com Google: " + error);
      setGoogleLoading(false);
    }
    // On success, the page will redirect via OAuth flow
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 flex flex-col transition-colors duration-300">
      <Toaster />

      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="border-green-200 dark:border-gray-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Pill className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 dark:text-green-400 tracking-tight">
            CuidaBEM
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Seu gerenciador de medicamentos inteligente
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Com leitura de embalagem por IA
          </div>
        </div>

        {/* Card */}
        <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700 shadow-xl">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-green-50 dark:bg-gray-700 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (register only) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="dark:text-gray-200 text-sm">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="dark:text-gray-200 text-sm">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-9 bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500"
                  autoComplete={mode === "login" ? "email" : "new-email"}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="dark:text-gray-200 text-sm">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-9 pr-9 bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white h-11 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === "register" ? "Criando conta..." : "Entrando..."}
                </div>
              ) : mode === "register" ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-400 dark:text-gray-500">ou continue com</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 h-11 gap-3"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuar com Google
          </Button>

          {/* Footer switch */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  Criar gratuitamente
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </Card>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-6 text-center max-w-sm">
          Seus dados ficam protegidos e separados por conta. 
          Nenhuma informação é compartilhada entre usuários.
        </p>
      </div>
    </div>
  );
}
