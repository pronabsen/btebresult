const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  size: { type: Number, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  regulation: { type: Number, required: true },
  exam_type: { type: String, required: true }
});

module.exports = Log = mongoose.model("Log", logSchema);
