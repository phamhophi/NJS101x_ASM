const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const adminRoutes = require("./routes/admin");

// app.set("view engine", "ejs");
// app.set("views", "views");
app.use(adminRoutes);

app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found</h1>");
});

app.listen(3000);
