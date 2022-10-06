// Xử lý hiển thị thông tin cho màn hình check in
exports.getCheckIn = (req, res, next) => {
  res.render("checkin", {
    pageTitle: "Điểm danh bắt đầu làm việc",
    path: "/checkin",
    isCheckIn: false,
  });
};
// Xử lý khi bấm submit
exports.postCheckIn = (req, res, next) => {
  const workPlace = req.body.workplace;
  const today = new Date();
  const startTime = today.getHours() + ":" + today.getMinutes();

  res.render("checkin", {
    pageTitle: "Điểm danh bắt đầu làm việc",
    path: "/checkin",
    isCheckIn: true, // Biến để kiểm tra xem đã check in hay chưa
    workPlace: workPlace,
    startTime: startTime,
  });
};

exports.getEmployee = (req, res, next) => {
  res.render("employee", {
    pageTitle: "Thông tin nhân viên",
    path: "/employee",
  });
};
