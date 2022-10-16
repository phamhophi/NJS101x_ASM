// Khai báo biến
const Status = require("./status");
const Rollup = require("./rollup");
const Absent = require("./absent");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  doB: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Xử lý trang thái khi điểm danh hoặc kết thúc phiên làm việc
userSchema.methods.statusWork = function (type, workplace) {
  const user = this;
  let attendedId;

  return Status.findOne({ userId: user._id })
    .then((status) => {
      attendedId = status.attendId;
      // Kiểm tra trạng thái
      if (type === "start") {
        return Status.findOne({ userId: user._id })
          .then((status) => {
            attendedId = status.attendId;
            return this.addAttended(
              attendedId,
              new Date().toLocaleDateString(),
              new Date(),
              workplace
            );
          })
          .then((result) => {
            attendedId = result._id;
            return Status.findOne({ userId: user._id });
          })
          .then((status) => {
            status.attendId = attendedId;
            status.workplace = workplace;
            status.isWorking = true;
            return status.save();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return this.finishAttended(attendedId, new Date())
          .then((result) => {
            return Status.findOne({ userId: user._id });
          })
          .then((status) => {
            status.isWorking = false;
            status.workplace = "Chưa có";
            return status.save();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// Phương thức xử lý update thông tin khi nhấn điểm danh
userSchema.methods.addAttended = function (
  attendId,
  date,
  startTime,
  workplace
) {
  if (attendId) {
    return Rollup.findById(attendId).then((attend) => {
      //kiểm tra có đúng ngày hiện tại đang làm việc hay không
      if (date === attend.date) {
        attend.details.unshift({
          startTime: startTime,
          endTime: null,
          workplace: workplace,
        });
        return attend.save();
      } else {
        const newAttend = new Rollup({
          userId: this._id,
          date: date,
          details: [
            {
              startTime: startTime,
              endTime: null,
              workplace: workplace,
            },
          ],
        });
        return newAttend.save();
      }
    });
  } else {
    const newAttend = new Rollup({
      userId: this._id,
      date: date,
      details: [
        {
          startTime: startTime,
          endTime: null,
          workplace: workplace,
        },
      ],
    });
    return newAttend.save();
  }
};

// Stop Working
userSchema.methods.finishAttended = function (attendId, endTime) {
  return Rollup.findById(attendId).then((attend) => {
    attend.details[0].endTime = endTime;
    return attend.save();
  });
};

//
userSchema.methods.getRollupDetails = function () {
  return Status.findOne({ userId: this._id }).then((status) => {
    return Rollup.findById(status.attendId)
      .then((attend) => {
        return attend;
      })
      .catch((err) => console.log(err));
  });
};

// Xử lý tìm kiếm thông tin
userSchema.methods.getSearchInform = function () {
  const searchInform = [];
  return Rollup.find({ userId: this._id })
    .then((attends) => {
      attends.forEach((attend) => {
        searchInform.push({
          date: attend.date,
          details: attend.details,
          attend: true,
        });
      });

      return Absent.find({ userId: this._id }).then((absents) => {
        absents.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        absents.forEach((absent) => {
          searchInform.push({
            date: absent.date.toLocaleDateString(),
            reason: absent.reason,
            days: absent.days,
            attend: false,
          });
        });
        searchInform.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        return searchInform;
      });
    })
    .catch((err) => console.log(err));
};

module.exports = mongoose.model("User", userSchema);
