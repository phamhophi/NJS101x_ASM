// Tạo phương thức render ra trang 404 khi không sai đường dẫn
exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page not found",
    path: "/404",
  });
};
