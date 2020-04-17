const db = require("../db");
const ExpressError = require('../helpers/expressError');
// const userSearch = require('../helpers/userSearch');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {

  /** Return array of job data:
   *
   * => [ {title, salary,...}, {title, salary...}...]
   *
   * */

  static async getAll() {
    const userRes = await db.query(
      `SELECT 
        username,
        first_name,
        last_name,
        email
       FROM users`);

    return userRes.rows;
  }

  // /** Return array of filtered job data for search terms:
  //  *
  //  * => [ {title, salary,...}, {title, salary...}...]
  //  *
  //  * */

  // static async getFiltered(searchTerms) {
  //   const { query, values } = jobSearch(searchTerms);
  //   const jobRes = await db.query(query, values);
  //   // try/catch just in case ********

  //   return jobRes.rows;
  // }

  static async create(data) {
    
    const { username, 
      password, 
      first_name, 
      last_name, 
      email, 
      photo_url, 
      is_admin } = data;

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    try {
      let userRes = await db.query(
        `INSERT INTO users (
          username, 
          password, 
          first_name, 
          last_name, 
          email, 
          photo_url, 
          is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING 
          username, 
          first_name, 
          last_name, 
          email, 
          photo_url, 
          is_admin`,
        [ username, 
          hashedPassword, 
          first_name, 
          last_name, 
          email, 
          photo_url, 
          is_admin
        ]
      );
      return userRes.rows[0];

    } catch (err) {
      throw new ExpressError(err.message, 400)
    }
  }

  /** Return one job object for given id:
   *
   * => {id, title, salary,...}
   *
   * */

  static async getOne(username) {
    const userRes = await db.query(
      `SELECT username,
              first_name,
              last_name, 
              email, 
              photo_url, 
              is_admin
            FROM users
            WHERE username=$1`,
      [username]);

    if (userRes.rows.length === 0) {
      throw new ExpressError(`There is no record for ${username}`, 404);
      // import expressError as ExpressError since class (capitalize)********
    }
    return userRes.rows[0];
  }

  /** Return one job object for given handle after patching:
   *
   * => {id, title, salary,...}
   *
   * */

  static async updateUser(data, user_name) {
    let userRes;
    try {
      const { query, values } = sqlForPartialUpdate('users', data, 'username', user_name);
      userRes = await db.query(query, values);
    } catch (err) {
      throw new ExpressError(err.message, 400)
    }

    if (userRes.rows.length === 0) {
      throw new ExpressError(`There is no record for ${user_name}, cannot update`, 404);
    }

    // Just grab information we want
    let {username, first_name, last_name, email, photo_url} = userRes.rows[0];
    // delete userRes.rows[0].password;

    return {username, first_name, last_name, email, photo_url};
  }

  /** Deletes user from DB with input username:
   *
   * */

  static async deleteUser(username) {

    const userRes = await db.query(
      `DELETE FROM users 
         WHERE username = $1 
         RETURNING username`,
      [username]);

    if (userRes.rows.length === 0) {
      throw new ExpressError(`There is no user with an username: ${username}`, 404);
    }
    return userRes.rows[0];
  }

  /** Authenticates user from DB:
   *
   * */

  static async authenticate(username, password) { 
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 400);
    }

    const login = await bcrypt.compare(password, user.password);
    return login && user;
  }

  static async adminAuthenticate(username) {
    const result = await db.query(
      `SELECT is_admin FROM users WHERE username = $1`,
      [username]);
    const user_admin = result.rows[0];

    if (!result.rows[0]) {
      throw new ExpressError(`No such user`, 400);
    }

    return user_admin;
  }

}


module.exports = User;
