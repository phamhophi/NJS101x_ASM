// Khai báo biến
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Covid = require("../models/covid");
const PDFDocument = require("pdfkit");

// Tạo phương thức render thông tin nhân viên được quản lý
exports.getEmployee = (req, res, next) => {
  if (!req.session.user.userPermission.includes("view_employee")) {
    return res.status(404).render("404", {
      path: "/404",
      pageTitle: "Page not found",
      user: req.session.user,
    });
  }

  User.find({ department: req.session.user.department, rank: "employee" })
    .then((user) => {
      console.log(user);
      res.render("employee", {
        path: "/employee",
        pageTitle: "Thông tin nhân viên quản lý",
        user: req.session.user,
        userEmployee: user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Tạo phương thức render khi xem thông tin nhân viên đang quản lý
exports.getEmployeeDetail = (req, res, next) => {
  const userId = req.params.userId;

  Covid.findOne({ userId: req.params.userId })
    .then((covid) => {
      if (!covid) {
        return res.redirect("/employee");
      }
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

// Tạo phương thức xử lý xuất file pdf
exports.getOutCovid = (req, res, next) => {
  const userId = req.params.userId;
  const name = req.query.name;

  Covid.findOne({ userId: userId })
    .then((covid) => {
      if (!covid) {
        return next(
          new Error("Thông tin covid của nhân viên chưa được đăng ký.")
        );
      }
      // Khai báo biến tên file pdf và đường dẫn file
      const covidName = "covid-" + userId + ".pdf";
      const covidPath = path.join("data", "covid", covidName);

      // Khỏi tạo file pdf
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline: filename='" + covidName + "'"
      );

      // Ghi file pdf theo đường dẫn
      pdfDoc.pipe(fs.createWriteStream(covidPath));
      pdfDoc.pipe(res);

      // Khỏi tạo nội dung cho file pdf
      pdfDoc
        .font("src/fonts/OpenSans-Bold.ttf")
        .fontSize(24)
        .text("Thông tin covid của nhân viên", {
          align: "center",
        });
      pdfDoc.fontSize(16).text("-------*-------", {
        align: "center",
      });
      pdfDoc.fontSize(16).text("ID: " + userId);
      pdfDoc.fontSize(16).text("Họ Tên: " + name);
      pdfDoc.font("src/fonts/OpenSans-Light.ttf").text("------***------");
      if (!covid.bodyTemperatures.length) {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Chưa có đăng ký thân nhiệt!");
      } else {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Chi tiết đăng kí thân nhiệt");
        covid.bodyTemperatures.forEach((tempers) => {
          pdfDoc
            .font("src/fonts/OpenSans-Light.ttf")
            .fontSize(14)
            .text(
              "Ngày: " +
                tempers.date.toLocaleDateString() +
                " - " +
                tempers.temperature +
                " độ C"
            );
        });
      }
      pdfDoc.text("------***------");
      if (!covid.vaccine.length) {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Chưa có thông tin tiêm vaccine covid!");
      } else {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Chi tiết tiêm vaccine covid");
        covid.vaccine.forEach((vaccine, index) => {
          pdfDoc
            .font("src/fonts/OpenSans-Light.ttf")
            .fontSize(14)
            .text(
              "Ngày: " +
                vaccine.date.toLocaleDateString() +
                " - " +
                "Mũi tiêm: " +
                ++index +
                " - " +
                vaccine.vaccineName
            );
        });
      }
      pdfDoc.text("------***------");
      if (!covid.positive.length) {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Chưa có thông tin nhiễm covid");
      } else {
        pdfDoc
          .font("src/fonts/OpenSans-Regular.ttf")
          .fontSize(16)
          .text("Thông tin dương tính covid");
        covid.positive.forEach((positive) => {
          pdfDoc
            .font("src/fonts/OpenSans-Light.ttf")
            .fontSize(14)
            .text("Ngày: " + positive.date.toLocaleDateString());
        });
      }
      pdfDoc.end();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
