const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

process.env.NODE_ENV = 'test';

describe("Message Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM companies");

    await db.query(`
      INSERT INTO companies (
        handle,
        name,
        num_employees,
        description, 
        logo_url
        )       
      VALUES ('appl','apple', '1000','apple computers','url1'),
      ('goog','google', '2000','google search','url2'),
      ('rithm','rithm school', '60','making developers','url3');`
    );
  })

  /** GET / => {companies: [company, ...]}  */

  describe("GET /companies/", function () {
    test("can see all companies", async function () {
      let response = await request(app)
        .get("/companies/");

      expect(response.statusCode).toBe(200);
      expect(response.body.companies.length).toEqual(3);
    });
  });
})

afterAll(async function () {
  await db.end();
})


