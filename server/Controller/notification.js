const Notification = require("../models/notificationSchema");
const User = require("../models/authSchema");
const Group = require("../models/groupSchema");


const notifyUser = async ({ userId, type, title, message, groupId }) => {
  await Notification.create({
    userId,
    type,
    title,
    message,
    groupId,
    read: false,
  });
};


const notifyGroupMembers = async ({
  groupId,
  excludeUserId,
  type,
  title,
  message,
}) => {
  const group = await Group.findById(groupId);
  if (!group) return;

  for (const member of group.members) {
    const memberId = member.user.toString();
    if (memberId === excludeUserId?.toString()) continue;

    await notifyUser({
      userId: member.user,
      type,
      title,
      message,
      groupId,
    });
  }
};


const getMyNotifications = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const notifications = await Notification.find({ userId: user._id })
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


const markAllAsRead = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await Notification.updateMany(
      { userId: user._id, read: false },
      { read: true }
    );

    return res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  notifyUser,
  notifyGroupMembers,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};