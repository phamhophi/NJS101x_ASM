// Khai báo biến
const User = require("../models/user");
const Rollup = require("../models/rollup");
const Absent = require("../models/absent");

// Tạo phương thức render trang xác nhận giờ làm
exports.getAcceptTime = (req, res, next) => {
  // Giới hạn quyền truy cập
  if (!req.session.user.userPermission.includes("accept")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  User.find({ department: req.session.user.department, rank: "employee" })
    .then((user) => {
      res.render("accept", {
        path: "/accept",
        pageTitle: "Thông tin nhân viên quản lý",
        user: req.session.user,
        userEmployee: user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức để render ra trang chi tiết thông tin nhân viên cần xác nhận giờ làm
exports.getAcceptDetail = (req, res, next) => {
  // Giới hạn quyền truy cập
  if (!req.session.user.userPermission.includes("accept")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  // Lấy thông nhân viên
  User.findById(req.params.userId).then((user) => {
    user
      .getSearchInform()
      .then((statistics) => {
        res.render("accept-detail", {
          pageTitle: "Chi tiết giờ làm của nhân viên",
          user: req.user,
          userEmployee: user,
          statistics: statistics,
          accept: req.session.accept,
          type: "details",
          path: "/accept-detail",
          month: "",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

// Tạo phương thức xác nhận giờ làm
exports.postAccept = (req, res, next) => {
  const userId = req.body.userId;
  const month = req.body.month;

  // Kiểm tra tháng cần xác nhận
  if (!month || month > 12 || month < 1) {
    return res.redirect(`/accept-detail/${userId}`);
  }
  // Khỏi tạo giá trị sau khi xác nhận
  if (!req.session.accept) {
    req.session.accept = [{ acceptId: userId, month: month }];
  } else {
    req.session.accept.push({ acceptId: userId, month: month });
  }
  res.redirect(`/accept-detail/${userId}`);
  console.log("Xác nhận thành công!");
};

// Phương thức xóa dữ liệu thời gian
exports.postDeleteTime = (req, res, next) => {
  const userId = req.body.userId;
  const date = req.body.date;
  const attend = req.body.attend;

  if (attend === "false") {
    Absent.find({ userId: userId })
      .then((absent) => {
        const indexAbsent = absent.findIndex(
          (a) => date === a.date.toLocaleDateString()
        );
        // Lưu thông tin ngày cần xóa
        const dt = absent[indexAbsent].date;

        // Thực thi xóa dữ liệu đã get được
        Absent.deleteOne({ date: dt })
          .then(() => {
            console.log("Xóa dữ liệu thành công!");
            res.redirect(`/accept-detail/${userId}`);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    // Xử lý xóa dữ liệu đã chọn
    Rollup.deleteOne({ userId: userId, date: date })
      .then((rollup) => {
        console.log("Xóa dữ liệu thành công!");
        res.redirect(`/accept-detail/${userId}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// Tạo phương thức để render
// nội dung trang sau khi ấn nút tìm thông tin
exports.getStatisticMonth = function (req, res, next) {
  const { type, search, userId } = req.query;

  // Kiểm tra giá trị của tháng cần tìm
  if (!search || search > 12 || search < 1) {
    return res.redirect(`/accept-detail/${userId}`);
  }

  User.findById(userId).then((user) => {
    user
      .getSearchInform()
      .then((statistics) => {
        let attendStatistic = [];

        if (type == "month") {
          attendStatistic = statistics.filter(
            (item) => search == new Date(item.date).getMonth() + 1
          );
        }

        res.render("accept-detail", {
          pageTitle: "Chi tiết giờ làm của nhân viên",
          user: req.user,
          statistics: attendStatistic,
          path: "/accept-detail",
          userEmployee: user,
          accept: req.session.accept,
          type: "salary",
          month: search,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};
