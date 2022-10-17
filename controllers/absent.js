const Absent = require("../models/absent");
const User = require("../models/user");

// Phương thức render trang đăng ký nghĩ phép
exports.getAbsent = (req, res, next) => {
  res.render("absent", {
    pageTitle: "Đăng ký nghỉ phép",
    user: req.user,
    path: "/absent",
  });
};

// Tạo phương thức update thông tin nghỉ phép
exports.postAbsent = (req, res, next) => {
  User.findById("634d021ca0deb030939a0fc8")
    .then((user) => {
      if (user.annualLeave > 0) {
        const absent = new Absent({
          userId: req.user._id,
          date: req.body.dateLeave,
          reason: req.body.reasonLeave,
          hours: req.body.leaveHours,
          days: req.body.days,
        });

        absent
          .save()
          .then((absent) => {
            // Update lại ngày phép năm sau khi đăng ký nghỉ
            const updatedLeave = (user.annualLeave - req.body.days).toFixed(1);
            user.annualLeave = updatedLeave;
            user.save();
          })
          .then(() => {
            console.log("Đăng ký nghỉ phép thành công!");
            res.redirect("/absent");
          });
      }
    })
    .catch((err) => console.log(err));
};

// Tạo phương thức render chi tiết thông tin đã đăng ký nghỉ phép năm
exports.getAbsentDetail = (req, res, next) => {
  Absent.find()
    .then((absent) => {
      res.render("absent-detail", {
        pageTitle: "Chi tiết thông tin nghỉ phép",
        user: req.user,
        absents: absent,
        path: "/absent-detail",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
