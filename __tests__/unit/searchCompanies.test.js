const request = require("supertest");
process.env.NODE_ENV = 'test';

const sqlForCompanySearch = require('../../helpers/companySearch.js');

describe("sqlForCompanySearch()", () => {
  it("should generate a proper search query for companies with 1 fields",
    function () {
      const queryObj = sqlForCompanySearch(
        { 'search': 'appl'},
      );
      
      expect(queryObj.query).toBe('SELECT handle, name, num_employees, description, logo_url FROM companies WHERE (handle ILIKE $1 OR name ILIKE $1)');
      expect(queryObj.values).toEqual(['%appl%']);
    });

    it("should generate a proper search query for companies with multiple fields",
    function () {
      const queryObj = sqlForCompanySearch(
        { 'search': 'appl', 'min_employees': 40, 'max_employees': 50 },
      );

      expect(queryObj.query).toBe('SELECT handle, name, num_employees, description, logo_url FROM companies WHERE (handle ILIKE $1 OR name ILIKE $1) AND num_employees>$2 AND num_employees<$3');
      expect(queryObj.values).toEqual(['%appl%', 40, 50]);
    });

    // it("test fails when min_employees > max_employees",
    // function () {
    //   const queryObj = sqlForCompanySearch(
    //     { 'search': 'appl', 'min_employees': 50, 'max_employees': 40 },
    //   );

    //   expect(queryObj.statusCode).toBe(400);
    // });
});
