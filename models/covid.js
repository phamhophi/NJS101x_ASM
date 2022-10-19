const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const covidSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bodyTemperatures: [
    {
      date: {
        type: Date,
      },
      temperature: {
        type: Number,
      },
    },
  ],
  vaccine: [
    {
      date: {
        type: Date,
      },
      vaccineName: {
        type: String,
      },
    },
  ],
  positive: [
    {
      date: { type: Date },
    },
  ],
});

module.exports = mongoose.model("Covid", covidSchema);
