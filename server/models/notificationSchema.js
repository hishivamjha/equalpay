const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth_data",
      required: true,
    },
    type: {
      type: String,
      enum: ["expense", "member", "settlement", "group"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);