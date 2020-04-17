/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const app = express();
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const { authenticateJWT } = require("./middleware/authenticate");

app.use(express.json());

// add logging system
app.use(morgan("tiny"));

// Authentication middleware
app.use(authenticateJWT);

// Routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
