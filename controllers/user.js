const User = require("../models/user");
const Status = require("../models/status");
const Rollup = require("../models/rollup");

// Tổng hiển thị của 1 page
let perPage = 20;

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
  if (!user.userPermission.includes("view_profile")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: user,
    });
  }
  res.render("user", {
    pageTitle: "Thông tin cá nhân",
    user: user,
    path: "/user",
  });
};

// Tạo phương thức để render ra trang sửa thông tin cá nhân
exports.getEditUser = (req, res, next) => {
  const userId = req.params.userId;
  // // Giới hạn quyền truy cập
  if (!req.session.user.userPermission.includes("edit_profile")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  User.findById(userId)
    .then((user) => {
      res.render("edit-user", {
        user: user,
        pageTitle: "Thay đổi thông tin cá nhân",
        path: "/edit-user",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      console.log("Cập nhật thành công hình ảnh!!");
      res.redirect("/user");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức để hiển thị ra trạng thái nhân viên có đang làm việc không
exports.getStatus = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      return Status.findOne({ userId: user._id });
    })
    .then((result) => {
      if (!result) {
        const status = new Status({
          userId: req.user._id,
          workplace: "Chưa xác định",
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức để render ra trang tra cứu thông tin
exports.getSearch = (req, res, next) => {
  const page = +req.query.page || 1;
  let adminId, adminName;

  // Giới hạn quyền truy cập
  if (!req.session.user.userPermission.includes("search")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  // Lấy thông quản lý
  User.findOne({ department: req.session.user.department, rank: "admin" }).then(
    (admin) => {
      adminId = admin._id;
      adminName = admin.name;
    }
  );

  req.user.getSearchInform().then((statistics) => {
    const totalItems = statistics.length;
    res.render("search", {
      pageTitle: "Tra cứu thông tin",
      user: req.user,
      statistics: statistics.slice(perPage * page - perPage, perPage * page),
      type: "details",
      path: "/search",
      adminId: adminId,
      adminName: adminName,
      currentPage: page,
      hasNextPage: perPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / perPage),
    });
  });
};

// Tạo phương thức để render
// nội dung trang sau khi ấn nút tra cứu thông tin
exports.getStatisticSearch = function (req, res, next) {
  const { type, search } = req.query;
  const page = +req.query.page || 1;
  let adminId, adminName;

  // Lấy thông quản lý
  User.findOne({ department: req.session.user.department, rank: "admin" }).then(
    (admin) => {
      adminId = admin._id;
      adminName = admin.name;
    }
  );
  req.user
    .getSearchInform()
    .then((statistics) => {
      let currStatistic = [],
        attendStatistic = [],
        absentStatistic = [];

      if (type == "date") {
        attendStatistic = statistics.filter(
          (item) =>
            Rollup.checkSearch(search, item.date.toString()) && item.attend
        );
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
          currStatistic = [...attendStatistic, ...absentStatistic];
          currStatistic.overTime = overTime;
          currStatistic.underTime = underTime;
          if (typeof totalTime === "string") {
            currStatistic.salary = ["Chưa kết thúc"];
          } else {
            currStatistic.salary = (
              req.user.salaryScale * 3000000 +
              (overTime - underTime) * 200000
            ).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
          }
        }
      }

      // Biến lấy số lương phần tử mảng
      const totalItems = currStatistic.length;
      res.render("search", {
        pageTitle: "Tra cứu thông tin",
        user: req.user,
        statistics: currStatistic.slice(
          perPage * page - perPage,
          perPage * page
        ),
        type: "salary",
        path: "/search",
        adminId: adminId,
        adminName: adminName,
        currentPage: page,
        hasNextPage: perPage * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / perPage),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
