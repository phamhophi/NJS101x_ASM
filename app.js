// Khai báo biến khởi tạo
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");

// Import controller từ thư mục Controller
const userController = require("./controllers/user");
const rollupController = require("./controllers/rollup");
const covidController = require("./controllers/covid");
const errorController = require("./controllers/404");
const absentController = require("./controllers/absent");

// Lấy dữ liệu nhập vào thông qua req.body
app.use(bodyParser.urlencoded({ extended: false }));

// Khai báo static folder để có thể sử dụng css cho trang web
app.use(express.static(path.join(__dirname, "public")));

// Khởi tạo 1 middleware nhằm để sử dụng
// các thuộc tính và phương thức với user thông qua req.user
app.use((req, res, next) => {
  User.findById("63453c9dae3557123f30515e")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Khai báo để sử dụng template engine ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Kết nối với controller
app.use(userController.getStatus);
app.get("/", userController.getHomepage);
app.get("/user", userController.getUser);
app.get("/edit-user/:userId", userController.getEditUser);
app.post("/edit-user", userController.postEditUser);
app.get("/rollup", rollupController.getRollup);
app.post("/rollup", rollupController.postRollup);
app.get("/rollup-detail", rollupController.getRollupDetail);
app.get("/covid", covidController.getCovid);
app.post("/covid", covidController.postCovid);
app.get("/covid-detail", covidController.getCovidDetail);
app.get("/absent", absentController.getAbsent);
app.post("/absent", absentController.postAbsent);
app.get("/absent-detail", absentController.getAbsentDetail);
app.get("/search", userController.getSearch);
app.get("/statistic-search", userController.getStatisticSearch);
app.use(errorController.get404);

// Khởi tạo kết nối với mongoDB qua mongoose
mongoose
  .connect(
    "mongodb+srv://phamhophi05:Phi1206Aki@nodejscluster0.yppfjp3.mongodb.net/asm1?retryWrites=true&w=majority"
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Phạm Hồ Phi",
          doB: new Date("1994-12-06"),
          salaryScale: 2,
          startDate: new Date("2022-10-10"),
          department: "Phòng sách",
          annualLeave: 10,
          image:
            "https://i.pinimg.com/564x/8c/87/2e/8c872e6cc9d6c17541bb1b867c62ea61.jpg",
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
