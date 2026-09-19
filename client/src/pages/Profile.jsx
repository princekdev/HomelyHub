import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";

const Profile = () => {
  const { user, updateUserInPlace } = useAuth();
  const [name, setName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar?.url || "");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await updateProfile(formData);
      updateUserInPlace(res.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
        <div className="flex items-center gap-4">
          <img
            src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f6402a&color=fff`}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <label className="btn-outline text-sm cursor-pointer">
              Change photo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input value={user.email} disabled className="input-field bg-ink-50 text-ink-400" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Role</label>
          <input value={user.role} disabled className="input-field bg-ink-50 text-ink-400 capitalize" />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
