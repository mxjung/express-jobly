const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

process.env.NODE_ENV = 'test';

// Global Variable Token for user1
let testUserToken1;
let testUserToken2;

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

    await db.query(
      `INSERT INTO jobs (
        id, 
        title,
        salary,
        equity,
        company_handle,
        date_posted
            )       
      VALUES (100002, 'Front end developer',120000, 0.05,'rithm',current_timestamp)`)

    // we'll need tokens for future requests
    const testUser1 = { username: 'user1', is_admin: true };
    testUserToken1 = jwt.sign(testUser1, SECRET_KEY);

    const testUser2 = { username: 'user2', is_admin: false };
    testUserToken2 = jwt.sign(testUser2, SECRET_KEY);
  })

  /** GET / => {companies: [company, ...]}  */

  describe("GET /companies/", function () {
    test("can see all companies", async function () {
      let response = await request(app)
        .get("/companies/")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.companies.length).toEqual(3);
    });

    test("cannot see companies if NOT logged in", async function () {
      let response = await request(app)
        .get("/companies/")

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  describe("POST /companies/", function () {
    test("Creates a new company", async function () {
      let response = await request(app)
        .post("/companies/")
        .send({
          handle: "Fish",
          name: "Fish tops",
          num_employees: 80000,
          description: "Fish shop",
          logo_url: "http://fishworld.com/media/logo.jpg",
          _token: testUserToken1
        }
        );
      expect(response.statusCode).toBe(201);
      expect(response.body.company).toHaveProperty("handle");
    });

    test("Fails on required fields", async function () {
      let response = await request(app)
        .post("/companies/")
        .send({
          handle: "Fishies",
          num_employees: 6000,
          description: "Tackle and bait store",
          logo_url: "http://fishiesworld.com/media/logo.jpg",
          _token: testUserToken1
        }
        );
      expect(response.status).toBe(400);
    });

    test("Fails to create new comapny when user NOT and admin", async function () {
      let response = await request(app)
        .post("/companies/")
        .send({
          handle: "Fish",
          name: "Fish tops",
          num_employees: 80000,
          description: "Fish shop",
          logo_url: "http://fishworld.com/media/logo.jpg",
          _token: testUserToken2
        }
        );
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  describe("GET /companies/:handle", function () {
    test("can get one company", async function () {
      let response = await request(app)
        .get("/companies/rithm")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.company.name).toEqual("rithm school");

      // Test how many jobs are associated with rithm school
      expect(response.body.company.jobs.length).toEqual(1);
    });

    test("Can't get company that doesn't exist", async function () {
      let response = await request(app)
        .get("/companies/jetWest")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(404);
    });

    test("Can't get company if NOT logged in", async function () {
      let response = await request(app)
        .get("/companies/rithm");

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  describe("PATCH /companies/:handle", function () {
    test("can patch company if user is an admin", async function () {
      let response = await request(app)
        .patch("/companies/appl")
        .send({ 'handle': 'grapes', 
                'description': 'best winery',
                _token: testUserToken1});

      expect(response.statusCode).toBe(201);
      expect(response.body.company).toEqual(
        {
          'handle': 'grapes', 'name': 'apple',
          'description': 'best winery', 'num_employees': 1000, 'logo_url': 'url1'
        }
      );
    });

    test("cannot patch company if no data", async function () {
      let response = await request(app)
        .patch("/companies/appl")
        .send({_token: testUserToken1})

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        message: 'Need data to patch',
        status: 400
      });
    });

    test("cannot patch company if non-existent handle", async function () {
      let response = await request(app)
        .patch("/companies/oranges")
        .send({ 'description': 'best winery',
                _token: testUserToken1 });

      expect(response.statusCode).toBe(404); // HTTP status
      expect(response.body).toEqual({
        message: 'There is no record for oranges',
        status: 404
      });
    });
    test("Cannot patch company if user is not an admin", async function () {
      let response = await request(app)
        .patch("/companies/appl")
        .send({ 'handle': 'grapes', 
                'description': 'best winery',
                _token: testUserToken2});

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual(
        {
          message: 'Unauthorized',
          status: 401
        });
    });

  });

  describe("DELETE /companies/:handle", function () {
    test("can delete company", async function () {
      let response = await request(app)
        .delete("/companies/appl")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: 'Company deleted'
      });

      // Check we only have 2 companies left now
      const companies = await request(app)
        .get("/companies")
        .send({_token: testUserToken1});

      expect(companies.body.companies.length).toEqual(2);
    });

    test("cannot delete company if non-existent handle", async function () {
      let response = await request(app)
        .delete("/companies/oranges")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({
        message: 'There is no company with an handle: oranges',
        status: 404
      });
    });

    test("cannot delete company if not an admin", async function () {
      let response = await request(app)
        .delete("/companies/appl")
        .send({_token: testUserToken2});

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual(
        {
          message: 'Unauthorized',
          status: 401
        });
    });
  });
})

afterAll(async function () {
  await db.end();
})


