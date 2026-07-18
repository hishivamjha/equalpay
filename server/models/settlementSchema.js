const mongoose = require("mongoose");

const settlementSchema = mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth_data",
            required: true,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth_data",
            required: true,
        },
        amount: { type: Number, required: true },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);