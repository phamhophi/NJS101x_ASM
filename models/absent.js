const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Absent", absentSchema);
