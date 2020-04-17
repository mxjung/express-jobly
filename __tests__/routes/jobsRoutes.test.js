const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

process.env.NODE_ENV = 'test';


// Global Variable Token for user1
let testUserToken1;
let testUserToken2;


describe("Job Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM users");
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

    await db.query(
      `INSERT INTO users (
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin
          )       
    VALUES ('user1','password1', 'barry','james','email1', 'photo1', TRUE),
    ('user2','password2', 'jamie','chow','email2', 'photo2', TRUE)`);

    // think about moving this to script and running each time**********

    // we'll need tokens for future requests
    const testUser1 = { username: 'user1', is_admin: true };
    testUserToken1 = jwt.sign(testUser1, SECRET_KEY);

    const testUser2 = { username: 'user2', is_admin: false };
    testUserToken2 = jwt.sign(testUser2, SECRET_KEY);

  });

  describe("POST /jobs/", function () {
    test("Creates a new job if admin", async function () {
      let response = await request(app)
        .post("/jobs/")
        .send({
          title: "Instructor",
          salary: 80000,
          equity: 0.05,
          company_handle: "goog",
          _token: testUserToken1
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.job).toHaveProperty("salary");
      // nibbling (use toEqual)********
    });

    test("Fails on required fields", async function () {
      let response = await request(app)
        .post("/jobs/")
        .send({
            title: "Instructor",
            equity: 0.05,
            company_handle: "goog",
            _token: testUserToken1
        });
      expect(response.status).toBe(400);
      // error msg*********
    });

    test("Cannot create a new job if not admin", async function () {
      let response = await request(app)
        .post("/jobs/")
        .send({
          title: "Instructor",
          salary: 80000,
          equity: 0.05,
          company_handle: "goog",
          _token: testUserToken2
        });
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  /** GET / => {jobs: [job, ...]}  */

  describe("GET /jobs/", function () {
    test("can see all jobs (if no query searchTerms)", async function () {
      let response = await request(app)
        .get("/jobs/")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(4);
    });

    test("can see filtered jobs (if provided query search)", async function () {
      let response = await request(app)
        .get("/jobs?search=app")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(3);
    });

    test("can see filtered jobs (if provided query equity/salary)", async function () {
      let response = await request(app)
        .get("/jobs?min_equity=0.01&min_salary=130000")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(1);
    });

    test("can see filtered jobs (if provided query non-existent equity)", async function () {
      let response = await request(app)
        .get("/jobs?min_equity=4")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(0);
    });

    test("can see filtered jobs (if provided query non-existent query)", async function () {
      let response = await request(app)
        .get("/jobs?ginger")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body.jobs.length).toEqual(0);
    });

    test("CANNOT see jobs if NOT logged in", async function () {
      let response = await request(app)
        .get("/jobs/");

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  /** GET / => {job: {job}}  */

  describe("GET /jobs/:id", function () {
    test("can get one job", async function () {
      // const res = await db.query('SELECT * from jobs');
      // console.log('JOBS DB IS: ', res.rows);

      let response = await request(app)
        .get("/jobs/100002")
        .send({_token: testUserToken1});
      
      expect(response.statusCode).toBe(200);
      expect(response.body.job.company_handle).toEqual("rithm");
    });

    test("Can't get job that doesn't exist", async function () {
      let response = await request(app)
        .get("/jobs/4000000")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('There is no record for job with id: 4000000');
    });

    test("Cannot get job if NOT logged in", async function () {
      let response = await request(app)
        .get("/jobs/100002")

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  /** PATCH / => {job: {job}}  */
  
  describe("PATCH /jobs/:handle", function () {
    test("can patch company if admin", async function () {
      let response = await request(app)
        .patch("/jobs/100002")
        .send({'salary': 200000,
              _token: testUserToken1});

      expect(response.statusCode).toBe(201);
      expect(response.body.job.salary).toEqual(200000);
    });

    test("cannot patch job if no body", async function () {
      let response = await request(app)
        .patch("/jobs/100002")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Need data to patch');
    });

    test("cannot patch company if non-existent id", async function () {

      // const resp = await db.query('SELECT * FROM jobs');
      // console.log(resp.rows);
      let response = await request(app)
        .patch("/jobs/10")
        .send({'salary': 200000,
                _token: testUserToken1});

        expect(response.statusCode).toBe(404); // HTTP status
        expect(response.body.status).toBe(404); // body of response status
        expect(response.body.message).toBe(`There is no record for job with id: 10, cannot update`);
        // console.log('ERROR MESSAGE: ', response.body.message);
    });

    test("cannot patch company if not admin", async function () {
      let response = await request(app)
        .patch("/jobs/100002")
        .send({'salary': 200000,
              _token: testUserToken2});

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });

  describe("DELETE /jobs/:id", function () {
    test("can delete job if admin", async function () {
      let response = await request(app)
        .delete("/jobs/100002")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);

      // Check we only have 3 jobs left now
      const jobs = await request(app)
        .get("/jobs")
        .send({_token: testUserToken1});

      expect(jobs.body.jobs.length).toEqual(3);
    });

    test("cannot delete job if non-existent id", async function () {
      let response = await request(app)
        .delete("/jobs/10")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('There is no job with an id: 10');
    });

    test("cannot delete job if not admin", async function () {
      let response = await request(app)
        .delete("/jobs/100002")
        .send({_token: testUserToken2});

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        status: 401
      });
    });
  });
});


afterAll(async function () {
  await db.end();
});
