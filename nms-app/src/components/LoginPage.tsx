import { useState } from "react";
import { Activity } from "lucide-react";
import { login, setToken } from "../lib/api";

interface Props {
  onLogin: (username: string, role: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      setToken(data.token);
      onLogin(data.username, data.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#0d1117", color: "#e6edf3" }}
    >
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="p-3 rounded-xl mb-4"
            style={{ background: "rgba(249,115,22,0.15)" }}
          >
            <Activity size={28} style={{ color: "#f97316" }} />
          </div>
          <div
            className="text-xl font-bold font-mono tracking-widest"
            style={{ color: "#f97316" }}
          >
            RAD TX NMS
          </div>
          <div className="text-xs mt-1 font-mono" style={{ color: "#8b949e" }}>
            Network Management System Analyzer
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider mb-1.5"
              style={{ color: "#8b949e" }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2.5 rounded-lg font-mono text-sm outline-none focus:ring-1"
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                color: "#e6edf3",
              }}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label
              className="block text-xs font-mono uppercase tracking-wider mb-1.5"
              style={{ color: "#8b949e" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 rounded-lg font-mono text-sm outline-none"
              style={{
                background: "#161b22",
                border: "1px solid #30363d",
                color: "#e6edf3",
              }}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div
              className="text-xs font-mono px-3 py-2 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-mono font-bold text-sm tracking-widest transition-opacity"
            style={{
              background: loading ? "rgba(249,115,22,0.5)" : "#f97316",
              color: "#0d1117",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>

        <div
          className="mt-8 text-center text-xs font-mono"
          style={{ color: "#30363d" }}
        >
          Authorized access only
        </div>
      </div>
    </div>
  );
}
