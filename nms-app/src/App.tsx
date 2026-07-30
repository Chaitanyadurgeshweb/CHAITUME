import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import NmsUpload from "./components/NmsUpload";
import AdminPanel from "./components/AdminPanel";
import { getToken, clearToken, getMe } from "./lib/api";

type View = "login" | "nms" | "admin";

interface AuthState {
  username: string;
  role: string;
}

export default function App() {
  const [view, setView] = useState<View>("login");
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    getMe()
      .then((user) => {
        if (user) {
          setAuth({ username: user.username, role: user.role });
          setView("nms");
        } else {
          clearToken();
        }
      })
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  function handleLogin(username: string, role: string) {
    setAuth({ username, role });
    setView("nms");
  }

  function handleLogout() {
    setAuth(null);
    setView("login");
  }

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0d1117" }}
      >
        <div className="text-xs font-mono" style={{ color: "#30363d" }}>
          Checking session...
        </div>
      </div>
    );
  }

  if (view === "login" || !auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (view === "admin" && auth.role === "admin") {
    return <AdminPanel onBack={() => setView("nms")} />;
  }

  return (
    <NmsUpload
      username={auth.username}
      role={auth.role}
      onLogout={handleLogout}
      onAdmin={() => setView("admin")}
    />
  );
}
