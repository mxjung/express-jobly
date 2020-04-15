const db = require("../db");
const expressError = require('../helpers/expressError');
const companySearch = require('../helpers/companySearch');

class Company {

  static async getAll() {
    const companyRes = await db.query(
        `SELECT handle,
                name,
                num_employees,
                description,
                logo_url
            FROM companies`);
          

    if (companyRes.rows.length === 0) {
      throw new expressError(`There are no companies`, 404);
    }
    return companyRes.rows;
  }

  static async getFiltered(searchTerms) {
    const {query, values} = companySearch(searchTerms);
    const companyRes = await db.query(query, values);

    if (companyRes.rows.length === 0) {
      throw new expressError(`There are no companies`, 404);
    }
    return companyRes.rows;
  }

  static async create(data) {
    let companyRes;
    try{
    companyRes = await db.query(
      `INSERT INTO companies (
          handle,
          name,
          num_employees,
          description,
          logo_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING 
          handle,
          name,
          num_employees,
          description,
          logo_url`,
      [
        data.handle,
        data.name,
        data.num_employees,
        data.description,
        data.logo_url,
      ]
    );
    }catch(err){
      throw new expressError(err.message, 400)
    }
    // TO DO - separate handling for non unique handle or name and 
    // null non-nullable fields
    if (companyRes.rows.length === 0) {
      throw new expressError(`Unable to create record for ${name}`, 500);
    }
    return companyRes.rows[0];
  }

  static async getOne(handle) {
    const companyRes = await db.query(
        `SELECT handle,
                name,
                num_employees,
                description,
                logo_url
            FROM companies
            WHERE handle=$1`,
            [handle]);
  
    if (companyRes.rows.length === 0) {
      throw new expressError(`There is no record for ${handle}`, 404);
    }
    return companyRes.rows[0];
  }
}


module.exports = Company;
