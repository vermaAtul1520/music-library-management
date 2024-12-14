const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
