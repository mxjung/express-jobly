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
}



module.exports = Company;
