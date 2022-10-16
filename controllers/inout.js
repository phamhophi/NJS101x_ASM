// Xử lý hiển thị thông tin cho màn hình check in
exports.getCheckIn = (req, res, next) => {
  res.render("check-in", {
    pageTitle: "Bắt đầu phiên làm việc",
    path: "/check-in",
    isCheckIn: false,
  });
};
// Xử lý khi bấm submit tại màn hình check in
exports.postCheckIn = (req, res, next) => {
  const workPlace = req.body.workplace;
  const today = new Date();
  // Lấy thông tin giờ từ hệ thống
  const startTime = today.getHours() + ":" + today.getMinutes();

  res.render("check-in", {
    pageTitle: "Bắt đầu phiên làm việc",
    path: "/check-in",
    isCheckIn: true, // Biến để kiểm tra xem đã check in hay chưa
    workPlace: workPlace,
    startTime: startTime,
  });
};
// Xử lý check out
exports.getCheckOut = (req, res, next) => {
  res.render("check-out", {
    pageTitle: "Kết thúc phiên làm việc",
    path: "/check-out",
  });
};
