import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { getAdminUsers, setUserBlockedStatus, updateUserRole } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";
import Loader from "../../components/Loader";

const roles = ["all", "user", "host", "admin"];
const assignableRoles = ["user", "host", "admin"];

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(roleFilter === "all" ? undefined : roleFilter);
      setUsers(res.data);
    } catch (err) {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleToggleBlock = async (user) => {
    setActingId(user._id);
    try {
      await setUserBlockedStatus(user._id, !user.isBlocked);
      toast.success(`User ${user.isBlocked ? "unblocked" : "blocked"}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user");
    } finally {
      setActingId(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;
    setActingId(user._id);
    try {
      await updateUserRole(user._id, newRole);
      toast.success(`${user.name} is now ${newRole}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update role");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Users</h1>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-auto text-sm">
          {roles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
      </div>
      <p className="text-sm text-ink-500 mb-6">
        Everyone registers as a regular user. Use the Role column below to grant host or admin access — this is the only way roles change.
      </p>

      {loading ? (
        <Loader fullScreen />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentAdmin && u._id === currentAdmin._id;
                return (
                  <tr key={u._id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-ink-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || actingId === u._id}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="input-field w-auto text-xs py-1.5 capitalize disabled:opacity-60"
                        title={isSelf ? "You cannot change your own role" : "Change this user's role"}
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <button
                          disabled={actingId === u._id}
                          onClick={() => handleToggleBlock(u)}
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          {u.isBlocked ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
