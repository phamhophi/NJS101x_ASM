exports.getCheckIn = (req, res, next) => {
  res.render("index", {
    pageTitle: "Thông tin điểm danh",
    path: "/",
  });
};
