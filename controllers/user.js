const User = require("../models/user");
const Status = require("../models/status");
const Rollup = require("../models/rollup");

// Tạo phương thức để render trang chủ
exports.getHomepage = (req, res, next) => {
  const user = req.user;

  res.render("homepage", {
    pageTitle: "Trang chủ",
    user: user,
    path: "/",
  });
};

// Tạo phương thức để render ra xem/sửa thông tin cá nhân
exports.getUser = (req, res, next) => {
  const user = req.user;
  res.render("user", {
    pageTitle: "Thông tin cá nhân",
    user: user,
    path: "/user",
  });
};

// Tạo phương thức để render ra trang sửa thông tin cá nhân
exports.getEditUser = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const userId = req.params.userId;
  User.findById(userId)
    .then((user) => {
      res.render("edit-user", {
        user: user,
        pageTitle: "Thay đổi thông tin cá nhân",
        editing: editMode,
        path: "/edit-user",
      });
    })
    .catch((err) => console.log(err));
};

// Tạo phương thức để update sau khi sửa thông tin cá nhân
exports.postEditUser = (req, res, next) => {
  const userId = req.body.userId;
  const updatedImage = req.body.image;

  User.findById(userId)
    .then((user) => {
      user.image = updatedImage;
      return user.save();
    })
    .then((result) => {
      console.log("Updated success!!");
      res.redirect("/user");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Tạo phương thức để hiển thị ra trạng thái nhân viên có đang làm việc không
exports.getStatus = (req, res, next) => {
  User.findById("63453c9dae3557123f30515e")
    .then((user) => {
      req.user = user;
      return Status.findOne({ userId: user._id });
    })
    .then((result) => {
      if (!result) {
        const status = new Status({
          userId: req.user._id,
          workplace: "Chưa có",
          isWorking: false,
          attendId: null,
        });
        return status.save();
      } else {
        return result;
      }
    })
    .then((result) => {
      req.user.workplace = result.workplace;
      req.user.isWorking = result.isWorking;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

// Tạo phương thức để render ra trang tra cứu thông tin
exports.getSearch = (req, res, next) => {
  req.user.getSearchInform().then((statistics) => {
    res.render("search", {
      pageTitle: "Tra cứu thông tin",
      user: req.user,
      statistics: statistics,
      type: "details",
      path: "/search",
    });
  });
};

// Tạo phương thức để render
// nội dung trang sau khi ấn nút tra cứu thông tin
exports.getStatisticSearch = function (req, res, next) {
  const { type, search } = req.query;
  req.user
    .getSearchInform()
    .then((statistics) => {
      let currStatistic = [],
        attendStatistic = [],
        absentStatistic = [];
      if (type == "date") {
        attendStatistic = statistics.filter((item) => {
          Rollup.checkSearch(search, item.date.toString()) && item.attend;
        });
        absentStatistic = statistics.filter(
          (item) =>
            Rollup.checkSearch(search, item.date.toString()) && !item.attend
        );
        if (attendStatistic.length > 0) {
          attendStatistic.forEach((item) => {
            if (!item.details[0].endTime) {
              item.totalTime = "Chưa kết thúc";
            } else {
              item.totalTime = item.details.reduce(
                (sum, detail) =>
                  sum + (detail.endTime - detail.startTime) / 3600000,
                0
              );
              item.overTime = item.totalTime > 8 ? item.totalTime - 8 : 0;
              item.underTime = item.totalTime < 8 ? 8 - item.totalTime : 0;
            }
          });
          const totalTime = attendStatistic.reduce(
            (sum, item) => sum + item.totalTime,
            0
          );
          const overTime = attendStatistic.reduce(
            (sum, item) => sum + item.overTime,
            0
          );
          const underTime = attendStatistic.reduce(
            (sum, item) => sum + item.underTime,
            0
          );
          if (typeof totalTime === "string") {
            currStatistic.salary = "Chưa kết thúc";
          } else {
            currStatistic.salary = (
              req.user.salaryScale * 3000000 +
              (overTime - underTime) * 200000
            ).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
          }
        }
      }
      res.render("search", {
        pageTitle: "Tra cứu thông tin",
        user: req.user,
        statistics: currStatistic,
        type: "salary",
        path: "/search",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
