const mongoose = require("mongoose");

const resultSchema = mongoose.Schema({
  roll: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, required: true },
  semester: { type: Number, required: true },
  grade: { type: String },
  failedSubject: { type: String },
  exam_type: { type: String },
  regulation: { type: String },
});

module.exports = Results = mongoose.model("Results", resultSchema);
