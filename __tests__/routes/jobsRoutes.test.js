const request = require("supertest");

const app = require("../../app");
const db = require("../../db");

process.env.NODE_ENV = 'test';

describe("Message Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM jobs");
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
    
    await db.query(
      `INSERT INTO jobs (
        title,
        salary,
        equity,
        company_handle,
        date_posted
            )       
      VALUES ('Senior Software developer',160000, 0.1,'appl',current_timestamp),
      ('Junior Software developer',110000, 0,'appl',current_timestamp),
      ('Front end developer',120000, 0.05,'rithm',current_timestamp),
      ('Marketing manager',120000, 0.05, 'goog',current_timestamp);`
    );
  });

  describe("POST /jobs/", function () {
    test("Creates a new job", async function () {
      let response = await request(app)
        .post("/jobs/")
        .send({
          title: "Instructor",
          salary: 80000,
          equity: 0.05,
          company_handle: "goog",
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.job).toHaveProperty("salary");
    });

    test("Fails on required fields", async function () {
      let response = await request(app)
        .post("/jobs/")
        .send({
            title: "Instructor",
            equity: 0.05,
            company_handle: "goog",
        });
      expect(response.status).toBe(400);
    });
  });


  

});


afterAll(async function () {
  await db.end();
});
