var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var authRouter = require("./api/auth");



var app = express();
var mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/aurora")
  .then(() => console.log("Connected to MongoDB. Server Started on port 3000"))

  .catch((error) => handleError(error));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors())

app.use("/api", authRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("error");
});
module.exports = app;
