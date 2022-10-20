// Khai báo biến khởi tạo
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const { check, body } = require("express-validator");

// Import middleware từ thư mục middleware
const isAuth = require("./middleware/is-auth");

// Khỏi tạo biến kết nói với mongodb
const MONGODB_URI =
  "mongodb+srv://phamhophi05:Phi1206Aki@nodejscluster0.yppfjp3.mongodb.net/asm1";

// Khởi tạo một store lưu trữ mới
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// Import controller từ thư mục Controller
const userController = require("./controllers/user");
const rollupController = require("./controllers/rollup");
const covidController = require("./controllers/covid");
const errorController = require("./controllers/404");
const absentController = require("./controllers/absent");
const authController = require("./controllers/auth");

// Lấy dữ liệu nhập vào thông qua req.body
app.use(bodyParser.urlencoded({ extended: false }));

// Khai báo static folder để có thể sử dụng css cho trang web
app.use(express.static(path.join(__dirname, "public")));

// khai báo session
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// khỏi tạo giá trị cho biến isAuthenticated
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});
app.use(flash());

// Khởi tạo 1 middleware nhằm để sử dụng
// các thuộc tính và phương thức với user thông qua req.user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Khai báo để sử dụng template engine ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Kết nối với controller
app.get("/login", authController.getLogin);
app.post(
  "/login",
  [
    body("username")
      .isEmail()
      .withMessage("Vui lòng nhập địa chỉ email của bạn.")
      .normalizeEmail(),
    body("password", "Mật khẩu không hợp lệ.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
app.post("/logout", authController.postLogout);

app.use(userController.getStatus);
app.get("/", isAuth, userController.getHomepage);
app.get("/user", isAuth, userController.getUser);
app.get("/edit-user/:userId", isAuth, userController.getEditUser);
app.post("/edit-user", isAuth, userController.postEditUser);
app.get("/rollup", isAuth, rollupController.getRollup);
app.post("/rollup", isAuth, rollupController.postRollup);
app.get("/rollup-detail", isAuth, rollupController.getRollupDetail);
app.get("/covid", isAuth, covidController.getCovid);
app.post("/covid", isAuth, covidController.postCovid);
app.get("/covid-detail", isAuth, covidController.getCovidDetail);
app.get("/absent", isAuth, absentController.getAbsent);
app.post("/absent", absentController.postAbsent);
app.get("/absent-detail", isAuth, absentController.getAbsentDetail);
app.get("/search", isAuth, userController.getSearch);
app.get("/statistic-search", isAuth, userController.getStatisticSearch);
app.use(errorController.get404);

// Khởi tạo kết nối với mongoDB qua mongoose
mongoose
  .connect(MONGODB_URI)
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
          username: "phipham@test.com",
          password: "123456",
          rank: "Nhân viên",
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
