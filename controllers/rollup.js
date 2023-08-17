// Tạo phương thức render trang điểm danh
exports.getRollup = (req, res, next) => {
  const user = req.user;
  // Giới hạn phân quyền
  if (!user.userPermission.includes("rollup")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: user,
    });
  }

  res.render("rollup", {
    user: user,
    pageTitle: "Điểm danh",
    path: "/rollup",
  });
};

// Tạo phương thức update thông tin điểm danh
exports.postRollup = (req, res, next) => {
  const type = req.query.type;
  const workplace = req.body.workplace;

  req.user
    .statusWork(type, workplace)
    .then((status) => {
      if (type === "start") {
        res.redirect("/");
      } else {
        res.redirect("/rollup-detail");
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức để render ra trang chi tiết điểm danh
exports.getRollupDetail = (req, res, next) => {
  // Giới hạn quyền truy cập
  if (!req.session.user.userPermission.includes("rollup")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }
  req.user.getRollupDetails().then((attend) => {
    if (!attend) {
      res.redirect("/");
    }
    res.render("rollup-detail", {
      pageTitle: "Chi tiết công việc",
      user: req.user,
      attends: attend,
      path: "/rollup-detail",
    });
  });
};
