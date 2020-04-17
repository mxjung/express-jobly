/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Auth JWT token, add auth'd user (if any) to req. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    // console.log("THIS IS req.user: ", req.user);
    return next();
  } catch (err) {
    // error in this middleware isn't error -- continue on
    return next();
  }
}
// end

/** Require user or raise 401 */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}
// end

/** Require admin user or raise 401 */

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.is_admin) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}
// end

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser
};
