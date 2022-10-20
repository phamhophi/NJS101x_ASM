// Khai báo biến
const User = require("../models/user");
const { validationResult } = require("express-validator");

// Tạo phương thức render trang đăng nhập
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("login", {
    pageTitle: "Đăng nhập",
    path: "/login",
    errorMessage: message,
    oldInput: {
      username: "",
      password: "",
    },
    validationErrors: [],
  });
};

// Tạo phương thức xử lý khi bấm đăng nhập
exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("login", {
      path: "/login",
      pageTitle: "Đăng nhập",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res.status(422).render("login", {
          path: "/login",
          pageTitle: "Đăng nhập",
          errorMessage: "Tên đăng nhập chưa đúng",
          oldInput: {
            username: username,
            password: password,
          },
          validationErrors: [{ param: "username" }],
        });
      }
      if (password === user.password) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      }
      return res.status(422).render("login", {
        path: "/login",
        pageTitle: "Đăng nhập",
        errorMessage: "Mật khẩu chưa đúng",
        oldInput: {
          username: username,
          password: password,
        },
        validationErrors: [{ param: "password" }],
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};
