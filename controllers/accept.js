// Tạo phương thức render trang xác nhận giờ làm
exports.getAcceptTime = (req, res, next) => {
  if (!req.session.user.userPermission.includes("accept")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  req.user.getSearchInform().then((statistics) => {
    res.render("accept-time", {
      pageTitle: "Tra cứu thông tin",
      user: req.user,
      statistics: statistics,
      type: "details",
      path: "/accept-time",
    });
  });
};
