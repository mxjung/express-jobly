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
        id, 
        title,
        salary,
        equity,
        company_handle,
        date_posted
            )       
      VALUES (100000, 'Senior Software developer',160000, 0.1,'appl',current_timestamp),
      (100001, 'Junior Software developer',110000, 0,'appl',current_timestamp),
      (100002, 'Front end developer',120000, 0.05,'rithm',current_timestamp),
      (100003, 'Marketing Application manager',120000, 0.05, 'goog',current_timestamp);`
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

  /** GET / => {jobs: [job, ...]}  */

  describe("GET /jobs/", function () {
    test("can see all jobs (if no query searchTerms)", async function () {
      let response = await request(app)
        .get("/jobs/");

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(4);
    });

    test("can see filtered jobs (if provided query search)", async function () {
      let response = await request(app)
        .get("/jobs?search=app");

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(3);
    });

    test("can see filtered jobs (if provided query equity/salary)", async function () {
      let response = await request(app)
        .get("/jobs?min_equity=0.01&min_salary=130000");

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(1);
    });

    test("can see filtered jobs (if provided query non-existent equity)", async function () {
      let response = await request(app)
        .get("/jobs?min_equity=4");

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(0);
    });

    test("can see filtered jobs (if provided query non-existent query)", async function () {
      let response = await request(app)
        .get("/jobs?ginger");

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(0);
    });
  });

  /** GET / => {job: {job}}  */

  describe("GET /jobs/:id", function () {
    test("can get one job", async function () {
      // const res = await db.query('SELECT * from jobs');
      // console.log('JOBS DB IS: ', res.rows);

      let response = await request(app)
        .get("/jobs/100002");
      
      expect(response.statusCode).toBe(200);
      expect(response.body.job.company_handle).toEqual("rithm");
    });

    test("Can't get job that doesn't exist", async function () {
      let response = await request(app)
        .get("/jobs/4000000");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('There is no record for job with id: 4000000');
    });
  });

  /** PATCH / => {job: {job}}  */
  
  describe("PATCH /jobs/:handle", function () {
    test("can patch company", async function () {
      let response = await request(app)
        .patch("/jobs/100002")
        .send({'salary': 200000});

      expect(response.statusCode).toBe(201);
      expect(response.body.job.salary).toEqual(200000);
    });

    test("cannot patch job if no body", async function () {
      let response = await request(app)
        .patch("/jobs/100002")

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Need data to patch');
    });

    test("cannot patch company if non-existent id", async function () {
      let response = await request(app)
        .patch("/jobs/10000200000")
        .send({'salary': 200000});

        expect(response.statusCode).toBe(400); // HTTP status
        expect(response.body.status).toBe(400); // body of response status
        // expect(response.body.message).toBe(`There is no record for job with id: 10000200000, cannot update`);
        console.log('ERROR MESSAGE: ', response.body.message);
    });

  });

});


afterAll(async function () {
  await db.end();
});
