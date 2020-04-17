const db = require("../db");
const expressError = require('../helpers/expressError');
const jobSearch = require('../helpers/jobSearch');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {

  /** Return array of job data:
   *
   * => [ {title, salary,...}, {title, salary...}...]
   *
   * */

  static async getAll() {
    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle,
                date_posted
            FROM jobs`);

    return jobRes.rows;
  }

  /** Return array of filtered job data for search terms:
   *
   * => [ {title, salary,...}, {title, salary...}...]
   *
   * */

  static async getFiltered(searchTerms) {
    const { query, values } = jobSearch(searchTerms);
    const jobRes = await db.query(query, values);
    // try/catch just in case ********

    return jobRes.rows;
  }

  static async create(data) {
    let jobRes;
    try {
      jobRes = await db.query(
        `INSERT INTO jobs (
          title,
          salary,
          equity,
          company_handle) 
         VALUES ($1, $2, $3, $4) 
         RETURNING 
          id,
          title,
          salary,
          equity,
          company_handle`,
        [
          data.title,
          data.salary,
          data.equity,
          data.company_handle,
        ]
      );
      // destructure data******
    } catch (err) {
      throw new expressError(err.message, 400)
    }

    return jobRes.rows[0];
    // place inside try ********
  }

  /** Return one job object for given id:
   *
   * => {id, title, salary,...}
   *
   * */

  static async getOne(id) {
    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle,
                date_posted
            FROM jobs
            WHERE id=$1`,
      [id]);

    if (jobRes.rows.length === 0) {
      throw new expressError(`There is no record for job with id: ${id}`, 404);
      // import expressError as ExpressError since class (capitalize)********
    }
    return jobRes.rows[0];
  }

  /** Return one job object for given handle after patching:
   *
   * => {id, title, salary,...}
   *
   * */

  static async patchJob(data, job_id) {
    let jobRes;
    try {
      const { query, values } = sqlForPartialUpdate('jobs', data, 'id', job_id);
      jobRes = await db.query(query, values);
    } catch (err) {
      throw new expressError(err.message, 400)
    }

    if (jobRes.rows.length === 0) {
      throw new expressError(`There is no record for job with id: ${job_id}, cannot update`, 404);
    }

    // Return just the information from jobRes
    const {id, title, salary, equity, company_handle, date_posted} = jobRes.rows[0];
    return {id, title, salary, equity, company_handle, date_posted};
  }

  /** Deletes job from DB with input id:
   *
   * */

  static async deleteJob(id) {

    const jobRes = await db.query(
      `DELETE FROM jobs 
         WHERE id = $1 
         RETURNING id`,
      [id]);

    if (jobRes.rows.length === 0) {
      throw { message: `There is no job with an id: ${id}`, status: 404 };
      // throw express error********
    }

    return jobRes.rows[0];
  }
}


module.exports = Job;
