const express = require("express");
const User = require("../models/user");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = new express.Router();

/** 
 * POST {username, password, first_name, last_name, email, photoURL, is_admin}
 * => {user: user}
 */
router.post("/", async function (req, res, next) {

  try {
    let data = jsonschema.validate(req.body, userSchema);
    if (!data.valid) {
      return next({
        status: 400,
        message: data.errors.map(e => e.stack)
      }); 
    }

    let user = await User.create(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET /users => {users: [user, ...]}  */

router.get("/", async function (req, res, next) {

  try {
    let users = await User.getAll();

    // If no users, just return empty object
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET 
 * This should return a single user found by username.
 * This should return JSON of {user: userData}
 */
router.get("/:username", async function (req, res, next) {

  try {
    const username = req.params.username;
    const user = await User.getOne(username);

    return res.json({ user });
  } catch (err) {
    return next(err)
  }
});

/** PATCH
 * This should update an existing user and return the updated user.
 * This should return JSON of {user: userData}
 */
router.patch("/:username", async function (req, res, next) {

  try {

    if (Object.keys(req.body).length === 0) {
      throw new ExpressError('Need data to patch', 400);
    }

    let data = jsonschema.validate(req.body, userUpdateSchema);

    if (!data.valid) {
      return next({
        status: 400,
        message: data.errors.map(e => e.stack)
      });
    }

    let user = await User.updateUser(req.body, req.params.username);

    return res.json({ user });

  } catch (err) {
    return next(err)
  }
});

/** DELETE
 * This should remove an existing user and return a message.
 * This should return JSON of {message: "User deleted"}
 */
router.delete("/:username", async function (req, res, next) {
  try {
    await User.deleteUser(req.params.username);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;