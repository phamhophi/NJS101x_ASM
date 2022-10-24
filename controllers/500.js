// Tạo phương thức render ra trang 500 khi có lỗi
exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    user: req.session.user,
    isAuthenticated: req.session.isLoggedIn,
  });
};
