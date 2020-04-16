const request = require("supertest");
process.env.NODE_ENV = 'test';

const mergeCompanyData = require('../../helpers/companyMerge');

describe("mergeCompanyData()", () => {
  it("should generate a object with merged values (given that key exists in second param)",
    function () {
      let companyData = {'handle': 'appl', 'name': 'apple', 'description': 'computers', 'num_employees': 500, 'logo_url': 'image.com'};

      let newCompanyData = {'handle':'oranges', 'description':'best winery'};


      const mergedObj = mergeCompanyData(companyData, newCompanyData);


      expect(mergedObj).toEqual(
        {'handle': 'oranges', 'name': 'apple', 'description': 'best winery', 'num_employees': 500, 'logo_url': 'image.com'}
      );
    });
});
