import { useEffect, useState } from "react";
import api from "../api";
import {
  FiFileText,
  FiUserPlus,
  FiCheckCircle,
  FiBell,
} from "react-icons/fi";

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [dismissingIds, setDismissingIds] = useState([]);

  const fetchNotifications = () => {
    setLoading(true);
    setErrors({});

    api
      .get(`/notifications`)
      .then((res) => {
        setNotifications(res.data.notifications);
      })
      .catch((error) => {
        setErrors({
          message: error.response?.data?.message || "Failed to load notifications",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "expense":
        return { icon: <FiFileText />, bg: "bg-indigo-50 text-indigo-500" };
      case "member":
        return { icon: <FiUserPlus />, bg: "bg-emerald-50 text-emerald-500" };
      case "settlement":
        return { icon: <FiCheckCircle />, bg: "bg-blue-50 text-blue-500" };
      default:
        return { icon: <FiBell />, bg: "bg-slate-50 text-slate-500" };
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleDelete = (id) => {
    setDismissingIds((prev) => [...prev, id]);
    setTimeout(() => {
      api.delete(`/notifications/${id}`).then(() => {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setDismissingIds((prev) => prev.filter((dismissId) => dismissId !== id));
      });
    }, 300);
  };

  const handleDeleteAll = () => {
    const allIds = notifications.map((n) => n._id);
    setDismissingIds(allIds);
    setTimeout(() => {
      api.delete(`/notifications/all`).then(() => {
        setNotifications([]);
        setDismissingIds([]);
      });
    }, 300);
  };

  if (loading) {
    return <p className="text-slate-500">Loading notifications...</p>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-2">
            Stay updated on recent activities in your groups.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-5 py-2 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
          >
            Clear all ({notifications.length})
          </button>
        )}
      </div>

      {errors.message && (
        <p className="text-red-500 text-sm mb-4">{errors.message}</p>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <FiBell className="text-5xl text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">No notifications yet</h2>
          <p className="text-slate-500 mt-2">
            Activity from your groups will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col max-w-4xl">
          {notifications.map((n) => {
            const { icon, bg } = getIcon(n.type);

            const isDismissing = dismissingIds.includes(n._id);
            return (
              <div
                key={n._id}
                onClick={() => handleDelete(n._id)}
                className={`bg-white rounded-3xl border border-indigo-200 flex items-center gap-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 ease-in-out transform overflow-hidden ${
                  isDismissing ? "translate-x-full opacity-0 max-h-0 !p-0 !mb-0 !border-0" : "translate-x-0 opacity-100 max-h-48 p-6 mb-4"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${bg}`}
                >
                  {icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{n.title}</h3>
                  <p className="text-slate-500 mt-1">{n.message}</p>
                  {n.groupId?.name && (
                    <p className="text-indigo-600 text-sm mt-1 font-medium">
                      {n.groupId.name}
                    </p>
                  )}
                </div>

                <div className="text-sm text-slate-400 font-medium whitespace-nowrap">
                  {timeAgo(n.createdAt)}
                </div>

                <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;