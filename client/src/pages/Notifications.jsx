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
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchNotifications = () => {
    setLoading(true);
    setErrors({});

    api
      .get(`/notifications`)
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
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

  const handleMarkRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllRead = () => {
    api
      .patch(`/notifications/read-all`)
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      });
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

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Mark all as read ({unreadCount})
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
        <div className="flex flex-col gap-4 max-w-4xl">
          {notifications.map((n) => {
            const { icon, bg } = getIcon(n.type);

            return (
              <div
                key={n._id}
                onClick={() => !n.read && handleMarkRead(n._id)}
                className={`bg-white rounded-3xl border p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${n.read ? "border-slate-200 opacity-70" : "border-indigo-200"
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

                {!n.read && (
                  <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;