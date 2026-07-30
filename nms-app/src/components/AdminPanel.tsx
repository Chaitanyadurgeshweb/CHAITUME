import { useEffect, useState } from "react";
import { Activity, ArrowLeft, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "../lib/api";

interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface Props {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data as User[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Failed to create user");
      }
      setNewUsername("");
      setNewPassword("");
      await fetchUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Delete failed");
      }
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1117", color: "#e6edf3" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "#21262d" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded" style={{ background: "rgba(249,115,22,0.15)" }}>
            <Activity size={18} style={{ color: "#f97316" }} />
          </div>
          <div>
            <div className="text-sm font-bold font-mono" style={{ color: "#f97316" }}>
              RAD TX NMS
            </div>
            <div className="text-xs" style={{ color: "#8b949e" }}>
              Admin Panel — User Management
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono hover:text-orange-400 transition-colors"
          style={{ color: "#8b949e" }}
        >
          <ArrowLeft size={13} />
          Back to Analyzer
        </button>
      </div>

      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Create User */}
        <div
          className="mb-8 p-5 rounded-xl border"
          style={{ background: "#0d1117", borderColor: "#21262d" }}
        >
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider mb-4" style={{ color: "#8b949e" }}>
            Create New User
          </h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                placeholder="Username"
                className="flex-1 px-3 py-2.5 rounded-lg font-mono text-sm outline-none"
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  color: "#e6edf3",
                }}
              />
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2.5 pr-9 rounded-lg font-mono text-sm outline-none"
                  style={{
                    background: "#161b22",
                    border: "1px solid #30363d",
                    color: "#e6edf3",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "#8b949e" }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {createError && (
              <div className="text-xs font-mono" style={{ color: "#f87171" }}>
                {createError}
              </div>
            )}
            <button
              type="submit"
              disabled={creating}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono font-bold text-sm"
              style={{ background: "#f97316", color: "#0d1117" }}
            >
              <Plus size={15} />
              {creating ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>

        {/* User List */}
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider mb-4" style={{ color: "#8b949e" }}>
            Managed Users
          </h2>

          {loading ? (
            <div className="text-xs font-mono" style={{ color: "#8b949e" }}>
              Loading...
            </div>
          ) : error ? (
            <div className="text-xs font-mono" style={{ color: "#f87171" }}>
              {error}
            </div>
          ) : users.length === 0 ? (
            <div
              className="text-center py-10 text-sm font-mono"
              style={{ color: "#30363d" }}
            >
              No managed users yet
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border"
                  style={{ background: "#0d1117", borderColor: "#21262d" }}
                >
                  <div>
                    <div className="text-sm font-mono font-semibold" style={{ color: "#e6edf3" }}>
                      {u.username}
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: "#8b949e" }}>
                      Created {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-900/20"
                    style={{ color: "#8b949e" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
