const db = require("../db");
const expressError = require('../helpers/expressError');
const companySearch = require('../helpers/companySearch');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {

//   /** Return array of company data:
//    *
//    * => [ {handle, name, num_employees,...}, {handle, ...}...]
//    *
//    * */

//   static async getAll() {
//     const companyRes = await db.query(
//         `SELECT handle,
//                 name,
//                 num_employees,
//                 description,
//                 logo_url
//             FROM companies`);
          

//     if (companyRes.rows.length === 0) {
//       throw new expressError(`There are no companies`, 404);
//     }
//     // return empty****
//     return companyRes.rows;
//   }

//   /** Return array of filtered company data for search terms:
//    *
//    * => [ {handle, name, num_employees,...}, {handle, ...}...]
//    *
//    * */

//   static async getFiltered(searchTerms) {
//     const {query, values} = companySearch(searchTerms);
//     const companyRes = await db.query(query, values);

//     if (companyRes.rows.length === 0) {
//       throw new expressError(`There are no companies`, 404);
//     }
//     return companyRes.rows;
//   }

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

//   /** Return one company object for given handle:
//    *
//    * => {handle, name, num_employees,...}
//    *
//    * */

//   static async getOne(handle) {
//     const companyRes = await db.query(
//         `SELECT handle,
//                 name,
//                 num_employees,
//                 description,
//                 logo_url
//             FROM companies
//             WHERE handle=$1`,
//             [handle]);
  
//     if (companyRes.rows.length === 0) {
//       throw new expressError(`There is no record for ${handle}`, 404);
//     }
//     return companyRes.rows[0];
//   }

//   /** Return one company object for given handle after patching:
//    *
//    * => {handle, name, num_employees,...}
//    *
//    * */

//   static async patchCompany(data, handle) {

//     const {query, values} = sqlForPartialUpdate('companies', data, 'handle', handle);
//     const companyRes = await db.query(query, values);
  
//     if (companyRes.rows.length === 0) {
//       throw new expressError(`There is no record for ${handle}, cannot update`, 404);
//     }
//     return companyRes.rows[0];
//   }

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
