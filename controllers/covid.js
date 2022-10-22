// Khai báo biến
const Covid = require("../models/covid");

// Tạo phương thức render trang thông tin covid
exports.getCovid = (req, res, next) => {
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      if (!covid) {
        const covid = new Covid({
          userId: req.user._id,
          bodyTemperatures: [],
          vaccine: [],
          positive: [],
        });
        return covid.save();
      }
      return covid;
    })
    .then((covid) => {
      res.render("covid", {
        user: req.user,
        pageTitle: "Thông tin covid",
        vaccine: covid.vaccine,
        path: "/covid",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức update thông tin sau khi đăng ký
exports.postCovid = (req, res, next) => {
  const type = req.query.type;

  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      // Kiểm tra thông tin covid khi bấm đăng ký
      if (type === "temperature") {
        covid.bodyTemperatures.push({
          date: new Date(),
          temperature: req.body.temperature,
        });
      } else if (type === "vaccine") {
        covid.vaccine.push({
          date: req.body.vaccineDate,
          vaccineName: req.body.vaccineName,
        });
      } else {
        covid.positive.push({
          date: req.body.positive,
        });
      }
      return covid.save();
    })
    .then((result) => {
      console.log("Đăng ký thành công!");
      res.redirect("/covid");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Phương thức render trang chi tiết đăng ký thông tin covid
exports.getCovidDetail = (req, res, next) => {
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      if (!covid) {
        const covid = new Covid({
          userId: userId,
          bodyTemperatures: [],
          vaccine: [],
          positive: [],
        });
        return covid.save();
      } else {
        return covid;
      }
    })
    .then((covid) => {
      res.render("covid-detail", {
        pageTitle: "Chi tiết thông tin covid",
        user: req.user,
        covid: covid,
        path: "/covid-detail",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
