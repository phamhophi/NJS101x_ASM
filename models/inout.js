// khởi tạo mongoose
const mongoose = require("mongoose");
// Khởi tạo một schema
const Schema = mongoose.Schema;

// Tạo đối tượng schema của điểm danh
const inoutSchema = new Schema({
  workDate: {
    type: Date,
    required: true,
  },
  detail: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    workPlace: {
      type: String,
      required: true,
    },
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Inout", inoutSchema);
