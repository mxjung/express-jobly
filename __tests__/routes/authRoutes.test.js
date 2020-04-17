const request = require("supertest");

const app = require("../../app");
const db = require("../../db");

process.env.NODE_ENV = 'test';


// let test_userToken;

describe("Auth Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM users");

    // encrypted password for string 'passwordTest'
    let passwordTest = '$2b$12$DM6.PBF6qWHMYAPKHB59HuVFhQMXOAuAIdpT5WsfbrCrSXz0AZlsW';
    // test_userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RfdXNlciIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1ODcxNDYwMjZ9.uU9LeILj04yJ1WZsu3l5Nks9c0CTjXVqHIGoc89oev8'

    
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
    VALUES ('test_user', '${passwordTest}', 'barry','james','email1', 'photo1', TRUE),
    ('user2', '${passwordTest}', 'jamie','chow','email2', 'photo2', TRUE),
    ('user3', '${passwordTest}', 'hector','achilles','email3', 'photo3', FALSE)`)

  });

  describe("POST /login/", function () {
    test("Posts username, password: returns token", async function () {
      let response = await request(app)
        .post("/login/")
        .send({
          username: 'test_user',
          password: 'passwordTest'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test("Posts invalid username, password: returns error msg", async function () {
      let response = await request(app)
        .post("/login/")
        .send({
          username: 'test_user',
          password: 'wrongPassword'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        "status": 400,
        "message": "Wrong Username or Password"
      });
    });
    
  });

  
});


afterAll(async function () {
  await db.end();
});
