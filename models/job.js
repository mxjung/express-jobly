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
          
    // if (jobRes.rows.length === 0) {
    //   throw new expressError(`There are no jobs posted`, 404);
    // }
    // return empty****
    return jobRes.rows;
  }

  /** Return array of filtered job data for search terms:
   *
   * => [ {title, salary,...}, {title, salary...}...]
   *
   * */

  static async getFiltered(searchTerms) {
    const {query, values} = jobSearch(searchTerms);
    const jobRes = await db.query(query, values);

    return jobRes.rows;
  }

  static async create(data) {
    let jobRes;
    try{
    jobRes = await db.query(
      `INSERT INTO jobs (
          title,
          salary,
          equity,
          company_handle,
          date_posted) 
         VALUES ($1, $2, $3, $4, current_timestamp) 
         RETURNING 
          id,
          title,
          salary,
          equity,
          company_handle,
          date_posted`,
      [
        data.title,
        data.salary,
        data.equity,
        data.company_handle,
      ]
    );
    }catch(err){
      throw new expressError(err.message, 400)
    }
    
    if (jobRes.rows.length === 0) {
      throw new expressError(`Unable to create record for this job`, 500);
    }
    // do not need above if statement*****

    return jobRes.rows[0];
  }

  /** Return one job object for given id:
   *
   * => {id, title, salary,...}
   *
   * */

  static async getOne(id) {
    // console.log('INSIDE GETONE, ID: ', id);
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
      
    // console.log('jobRes id: ', jobRes);
     
    
    if (jobRes.rows.length === 0) {
      throw new expressError(`There is no record for job with id: ${id}`, 404);
    }
    return jobRes.rows[0];
  }

  /** Return one job object for given handle after patching:
   *
   * => {id, title, salary,...}
   *
   * */

  static async patchJob(data, id) {
    let jobRes;
    try{
      const {query, values} = sqlForPartialUpdate('jobs', data, 'id', id);
      // console.log('PARTIAL UPDATE: ', query, values);
      jobRes = await db.query(query, values);
      // console.log('JOBRES: ', jobRes);
    } catch (err) {
      throw new expressError(err.message, 400)
    }
    
    // if (jobRes.rows.length === 0) {
    //   throw new expressError(`There is no record for job with id: ${id}, cannot update`, 404);
    // }
    return jobRes.rows[0];
  }

//   /** Return one company object {handle} for given handle after deleting:
//    *
//    * => {handle}
//    *
//    * */

//   static async deleteCompany(handle) {
    
//     const companyRes = await db.query(
//       `DELETE FROM companies 
//          WHERE handle = $1 
//          RETURNING handle`,
//         [handle]);

//     if (companyRes.rows.length === 0) {
//       throw { message: `There is no company with an handle: ${handle}`, status: 404 };
//     }

//     return companyRes.rows[0];
//   }
}


module.exports = Job;
