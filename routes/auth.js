const express = require("express");
const ExpressError = require("../helpers/expressError");
const jwt = require("jsonwebtoken");
const router = new express.Router();

const User = require('../models/user');

const { SECRET_KEY } = require("../config");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;

    const authenticate = await User.authenticate(username, password);

    if (authenticate) {
      const {is_admin} = await User.adminAuthenticate(username);

      // console.log("IS_ADMIN IS: ", is_admin);
      // console.log("TYPE OF IS_ADMIN IS: ", typeof is_admin);

      let token = jwt.sign({ username, is_admin }, SECRET_KEY);

      return res.json({ token });
    } else {
      // catch wrong password
      throw new ExpressError('Wrong Password', 400);
    }

  } catch (err) {
    // caught if wrong username
    if (err.message === `No such user` ||
      err.message === 'Wrong Password') {
      err.message = 'Wrong Username or Password';
    }
    return next(err);
  }
})









module.exports = router;