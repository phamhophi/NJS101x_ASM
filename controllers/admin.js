const User = require("../models/user");

// // Xử lý đăng nhập
// exports.getLogin = (req, res, next) => {
//   res.render("index", {
//     pageTitle: "Đăng nhập",
//     path: "/",
//   });
// };
// Xử lý cho đăng xuất
// exports.postLogout = (req, res, next) => {
//   res.render("index", {
//     pageTitle: "Đăng nhập",
//     path: "/",
//   });
// };

// // Xử lý get thông tin nghỉ phép
// exports.getLeave = (req, res, next) => {
//   res.render("leave", {
//     pageTitle: "Nghỉ phép",
//     path: "/leave",
//   });
// };

// Xử lý get thông tin nhân viên
exports.getUser = (req, res, next) => {
  User.find()
    .then((user) => {
      res.render("employee", {
        user: user,
        pageTitle: "Thông tin nhân viên",
        path: "/employee",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Xử lý khi thay đổi hình ảnh
exports.postEditUser = (req, res, next) => {
  // Lưu thông tin id nhận viên tại màn hình
  const userId = req.body.userId;
  const updatedImage = req.body.image; // Lưu giá trị thay đổi của hình ảnh

  User.findById(userId)
    .then((employee) => {
      employee.image = updatedImage;
      return employee.save();
    })
    .then((result) => {
      console.log("Cập nhật hình ảnh thành công!");
      res.redirect("/employee");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEmployee = (req, res, next) => {
  // const name = req.body.name;
  // const doB = req.body.dob;
  // const salaryScale = req.body.salaryscale;
  // const startDate = req.body.startdate;
  // const department = req.body.department;
  // const annualLeave = req.body.annualleave;
  // const image = req.body.image;
  // const employee = new Employee({
  //   name: name,
  //   doB: doB,
  //   salaryScale: salaryScale,
  //   startDate: startDate,
  //   department: department,
  //   annualLeave: annualLeave,
  //   image: image,
  // });
  // employee
  //   .save()
  //   .then((result) => {
  //     console.log("Lưu thông tin thành công!!");
  //     res.redirect("/employee");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getIndex = (req, res, next) => {
  res.render("index", {
    pageTitle: "Trang chủ",
    path: "/",
  });
};

exports.getLeave = (req, res, next) => {
  res.render("leave", {
    pageTitle: "Nghỉ phép",
    path: "/leave",
  });
};
