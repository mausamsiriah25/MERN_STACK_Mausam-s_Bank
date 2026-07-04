import { useState } from "react";
import toast from "react-hot-toast";
import { MdEdit, MdLock } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user?.phone || "", address: user?.address || "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/customer/profile", form);
      updateUser(data.user);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setSavingPw(true);
    try {
      const { data } = await api.put("/customer/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success(data.message);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
      <p className="mt-1 text-sm text-navy-700/60">Manage your personal information and security settings</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <div className="card flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 text-2xl font-bold text-white">
            {initials}
          </div>
          <h2 className="mt-4 font-bold text-navy-900">{user?.name}</h2>
          <p className="text-sm text-navy-700/50">{user?.email}</p>
          <div className="mt-4 w-full space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-navy-700/50">Account No.</span>
              <span className="font-mono font-semibold text-navy-900">{user?.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-700/50">Account Type</span>
              <span className="font-semibold text-navy-900">{user?.accountType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-700/50">Status</span>
              <span className={`font-semibold ${user?.status === "active" ? "text-emerald-dark" : "text-rose-600"}`}>
                {user?.status === "active" ? "Active" : "Frozen"}
              </span>
            </div>
          </div>
        </div>

        {/* Editable details + password */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-navy-900">Personal Details</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm font-semibold text-emerald-dark hover:underline">
                  <MdEdit /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="label">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={savingProfile} className="btn-primary">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-navy-700/50">Phone</p>
                  <p className="mt-1 font-medium text-navy-900">{user?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-navy-700/50">Address</p>
                  <p className="mt-1 font-medium text-navy-900">{user?.address || "—"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-navy-900">
              <MdLock /> Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Current Password</label>
                <input
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={savingPw} className="btn-primary sm:col-span-2 sm:w-fit">
                {savingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
