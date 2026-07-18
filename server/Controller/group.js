const Group = require("../models/groupSchema");
const User = require("../models/authSchema");
const { notifyUser } = require("./notification.js");

const createGroup = async (req, res) => {
  try {
    const { name, type } = req.body;
    const email = req.user.email;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const group = await Group.create({
      name,
      type,
      createdBy: user._id,
      members: [{ user: user._id, role: "admin" }],
    });
    await notifyUser({
      userId: user._id,
      type: "group",
      title: "New Group",
      message: `${user.name} has created a new group: ${group.name}`,
    });

    return res.status(201).json({ success: true, group });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const groups = await Group.find({ "members.user": user._id })
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, groups });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    return res.status(200).json({ success: true, group });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const newUser = await User.findOne({ email });
    if (!newUser) {
      return res.status(404).json({ success: false, message: "User not registered" });
    }

    const alreadyAdded = group.members.some(
      (m) => m.user.toString() === newUser._id.toString()
    );

    if (alreadyAdded) {
      return res.status(409).json({ success: false, message: "User already in group" });
    }

    group.members.push({ user: newUser._id, role: "member" });
    await group.save();

    const updatedGroup = await Group.findById(group._id).populate(
      "members.user",
      "name email"
    );

    return res.status(200).json({ success: true, group: updatedGroup });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    return res.status(200).json({ success: true, message: "Group deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  deleteGroup,
};
