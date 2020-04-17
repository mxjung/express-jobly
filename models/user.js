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

  static async updateUser(data, username) {
    let userRes;
    try {
      const { query, values } = sqlForPartialUpdate('users', data, 'username', username);
      userRes = await db.query(query, values);
    } catch (err) {
      throw new ExpressError(err.message, 400)
    }

    if (userRes.rows.length === 0) {
      throw new ExpressError(`There is no record for ${username}, cannot update`, 404);
    }
    delete userRes.rows[0].password;
    return userRes.rows[0];
  }

//   /** Deletes job from DB with input id:
//    *
//    * */

//   static async deleteJob(id) {

//     const jobRes = await db.query(
//       `DELETE FROM jobs 
//          WHERE id = $1 
//          RETURNING id`,
//       [id]);

//     if (jobRes.rows.length === 0) {
//       throw { message: `There is no job with an id: ${id}`, status: 404 };
//       // throw express error********
//     }

//     return jobRes.rows[0];
//   }
}


module.exports = User;
