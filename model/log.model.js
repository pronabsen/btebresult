const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  size: { type: Number, required: true },
});

module.exports = Log = mongoose.model("Log", logSchema);
