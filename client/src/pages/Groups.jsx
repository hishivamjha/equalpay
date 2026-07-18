import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";

function Groups() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  const fetchGroups = async () => {
    setLoading(true);
    setErrors({});

    try {
      const res = await api.get(`/groups`);
      const groupsList = res.data.groups || [];

      const groupsWithBalance = await Promise.all(
        groupsList.map(async (group) => {
          try {
            const balRes = await api.get(
              `/groups/${group._id}/balance`
            );
            return {
              ...group,
              balance: balRes.data.balance,
              expenseCount: balRes.data.expenseCount,
            };
          } catch {
            return {
              ...group,
              balance: 0,
              expenseCount: 0,
            };
          }
        })
      );

      setGroups(groupsWithBalance);
    } catch (error) {
      setErrors({
        message: error.response?.data?.message || "Failed to load groups",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    api
      .post(`/groups`, {
        name: formData.name,
        type: formData.type,
      })
      .then((res) => {
        setGroups((prev) => [
          { ...res.data.group, balance: 0, expenseCount: 0 },
          ...prev,
        ]);
        setFormData({ name: "", type: "" });
        setShowModal(false);
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to create group",
        });
      });
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Groups</h1>
          <p className="text-slate-500 mt-2">Manage your shared expense groups.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <FiPlus />
          Create Group
        </button>
      </div>

      <div className="relative mb-8">
        <FiSearch
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search Groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-14 pr-5 outline-none focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {errors.message && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading groups...</p>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-20 text-center">
          <h2 className="text-3xl font-bold text-slate-800">No Groups Yet</h2>
          <p className="text-slate-500 mt-4">
            Click "Create Group" to add your first group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/panel/groups/${group._id}`)}
              className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all flex flex-col cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="text-5xl text-indigo-500">
                  <FiUsers />
                </div>
                <span
                  className={`text-xl font-bold ${
                    group.balance > 0
                      ? "text-emerald-600"
                      : group.balance < 0
                      ? "text-red-500"
                      : "text-slate-600"
                  }`}
                >
                  {group.balance > 0
                    ? `+₹${group.balance}`
                    : group.balance < 0
                    ? `-₹${Math.abs(group.balance)}`
                    : "₹0"}
                </span>
              </div>

              <h2 className="text-2xl font-bold mt-5">{group.name}</h2>
              <p className="text-slate-500 mt-1">{group.type}</p>

              <div className="flex items-center gap-2 mt-6 text-slate-600">
                <FiUsers />
                {group.members?.length || 0} Members
              </div>

              <p className="mt-3 text-slate-600">
                {group.expenseCount || 0} Expenses
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Create Group</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Group Name</label>
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
                <label className="block mb-2 font-medium">Group Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">Select Type</option>
                  <option value="Trip">Trip</option>
                  <option value="Home">Home</option>
                  <option value="Friends">Friends</option>
                  <option value="Office">Office</option>
                  <option value="Family">Family</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message}</p>
              )}

              <div className="flex justify-end gap-4 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: "", type: "" });
                    setErrors({});
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;