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

function sqlForJobSearch(searchTerms) {
  // destructure searchTerms in parameter input*****
  let idx = 1;
  let columns = [];
  let values = [];

  for (let searchTerm in searchTerms) {
    if (searchTerm === 'min_salary') {
      columns.push(`salary>=$${idx}`);
      values.push(searchTerms.min_salary);
    } else if (searchTerm === 'min_equity') {
      columns.push(`equity>=$${idx}`);
      values.push(searchTerms.min_equity);
    } else {
      // This is search (ILIKE - considers upper/lowercase)
      columns.push(`(title ILIKE $${idx} OR company_handle ILIKE $${idx})`);
      values.push(`%${searchTerms.search}%`);
    }
    idx += 1;
  }

  // build query
  let cols = columns.join(" AND ");
  let query = `SELECT id, title, salary, equity, company_handle, date_posted FROM jobs WHERE ${cols}`;

  return { query, values };
}

module.exports = sqlForJobSearch;
