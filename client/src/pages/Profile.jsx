import { useEffect, useState } from "react";
import api from "../api";
import { FiUser, FiEdit2, FiUsers, FiFileText, FiMail } from "react-icons/fi";

function Profile() {
  const email = localStorage.getItem("email");

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [stats, setStats] = useState({ groups: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setErrors({});

    try {
      const profileRes = await api.get(`/profile`);
      setProfile(profileRes.data.user);

      const groupsRes = await api.get(`/groups`);
      const groups = groupsRes.data.groups || [];

      let totalExpenses = 0;
      await Promise.all(
        groups.map(async (group) => {
          try {
            const balRes = await api.get(
              `/groups/${group._id}/balance`
            );
            totalExpenses += balRes.data.expenseCount || 0;
          } catch {
            
          }
        })
      );

      setStats({ groups: groups.length, expenses: totalExpenses });
    } catch (error) {
      setErrors({
        message: error.response?.data?.message || "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    setFormData({
      name: profile.name,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .put(`/profile`, {
        name: formData.name,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
        confirmPassword: formData.confirmPassword || undefined,
      })
      .then((res) => {
        setProfile(res.data.user);
        localStorage.setItem("username", res.data.user.name);
        setShowModal(false);
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to update profile",
        });
      });
  };

  if (loading) {
    return <p className="text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      {errors.message && !showModal && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      <div className="max-w-4xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-indigo-600 text-white flex items-center justify-center text-5xl font-bold flex-shrink-0 shadow-inner">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900">{profile.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 mt-2">
                <FiMail />
                <span>{profile.email}</span>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
            >
              <FiEdit2 />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl flex-shrink-0">
              <FiUsers />
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm mb-1">
                Total Groups
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.groups}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl flex-shrink-0">
              <FiFileText />
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wide text-sm mb-1">
                Total Expenses
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.expenses}</h3>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full h-12 border border-slate-200 rounded-xl px-4 bg-slate-100 text-slate-500"
                />
                <p className="text-slate-400 text-xs mt-1">Email cannot be changed</p>
              </div>

              <hr className="border-slate-200" />
              <p className="text-sm font-medium text-slate-600">
                Change password (leave blank to keep current)
              </p>

              <div>
                <label className="block mb-2 font-medium">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;