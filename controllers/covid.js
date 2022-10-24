// Khai báo biến
const Covid = require("../models/covid");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

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

// Tạo phương thức xử lý xuất file pdf
exports.getOutPDFCovid = (req, res, next) => {
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
