const expressError = require('./expressError');

/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: an object with keys of columns you want to update and values with
 *          updated values
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForCompanySearch(searchTerms) {
  // keep track of item indexes
  // store all the columns we want to update and associate with vals

  if (searchTerms.min_employees && 
      searchTerms.max_employees &&
      searchTerms.min_employees > searchTerms.max_employees) {
    throw new expressError('Max Employees cannot be less than Min Employees', 400);
  }

  let idx = 1;
  let columns = [];
  // let values = Object.values(searchTerms);
  let values = [];


  for (let searchTerm in searchTerms) {
    if (searchTerm === 'min_employees') {
      columns.push(`num_employees>$${idx}`);
      values.push(searchTerms.min_employees);
    } else if (searchTerm === 'max_employees') {
      columns.push(`num_employees<$${idx}`);
      values.push(searchTerms.max_employees);
    } else {
      // This is search
      columns.push(`(handle LIKE $${idx} OR name LIKE $${idx})`);
      values.push(`%${searchTerms.search}%`);
    }
    idx += 1;
  }

  // build query
  let cols = columns.join(" AND ");
  let query = `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE ${cols}`;

  return { query, values };
}


module.exports = sqlForCompanySearch;
