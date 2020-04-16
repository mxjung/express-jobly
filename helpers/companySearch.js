const expressError = require('./expressError');

/**
 * Generate a selective update query based on a request body:
 *
 * - searchTerms: an object with keys of columns you want to search and values 
 * that signifies WHERE and LIKE constraints
 *
 * Returns object containing a DB query as a string, and array of string values to be inserted
 *
 */

function sqlForCompanySearch(searchTerms) {
  
  // Error out if min > max employees
  if (searchTerms.min_employees && 
      searchTerms.max_employees &&
      Number(searchTerms.min_employees) > Number(searchTerms.max_employees)) {
    throw new expressError('Max Employees cannot be less than Min Employees', 400);
  }

  let idx = 1;
  let columns = [];
  let values = [];

  for (let searchTerm in searchTerms) {
    if (searchTerm === 'min_employees') {
      columns.push(`num_employees>$${idx}`);
      values.push(searchTerms.min_employees);
    } else if (searchTerm === 'max_employees') {
      columns.push(`num_employees<$${idx}`);
      values.push(searchTerms.max_employees);
    } else {
      // This is search (ILIKE - considers upper/lowercase)
      columns.push(`(handle ILIKE $${idx} OR name ILIKE $${idx})`);
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
