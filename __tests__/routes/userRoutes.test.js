const request = require("supertest");

const app = require("../../app");
const db = require("../../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

process.env.NODE_ENV = 'test';



// Global Variable Token for user1
let testUserToken1;

describe("User Routes Test", function () {
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
    ('user2','password2', 'jamie','chow','email2', 'photo2', TRUE),
    ('user3','password3', 'hector','achilles','email3', 'photo3', FALSE),
    ('user4','password4', 'penelope','ody','email4', 'photo4', FALSE),
    ('user5','password5', 'arthur','happy','email5', 'photo5', FALSE)`)

    // think about moving this to script and running each time**********

    // we'll need tokens for future requests
    const testUser1 = { username: 'user1', is_admin: true };
    testUserToken1 = jwt.sign(testUser1, SECRET_KEY);
  });

  describe("POST /users/", function () {
    test("Creates a new user", async function () {
      let response = await request(app)
        .post("/users/")
        .send({
          "username": "user6",
          "password": "akdjfhbkajbnva",
          "first_name": "Jamie",
          "last_name": "chow",
          "email": "email6@gmail.com",
          "photo_url": "http://www.somedomain.com/me.jpg",
          "is_admin": false
        });
      expect(response.statusCode).toBe(201);
      // expect(response.body.user).toEqual({
      //   "username": "user6",
      //   "first_name": "Jamie",
      //   "last_name": "chow",
      //   "email": "email6@gmail.com",
      //   "photo_url": "http://www.somedomain.com/me.jpg",
      //   "is_admin": false
      // });

      // with authentication, we just want to receive a token
      expect(response.body).toHaveProperty('token');

    });
    test("Fails when incorrect data supplied", async function () {
      let response = await request(app)
        .post("/users/")
        .send({
          "first_name": "Jamie",
          "last_name": "chow",
          "email": "email6@gmail.com",
          "photo_url": "http://www.somedomain.com/me.jpg",
          "is_admin": false
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        "status": 400,
        "message": [
          'instance requires property \"username\"',
          'instance requires property \"password\"'
        ]
      });
    });
    test("Fails when non-unique username supplied", async function () {
      let response = await request(app)
        .post("/users/")
        .send({
          "username": "user1",
          "password": "kjfvkjndvkanjdv",
          "first_name": "Jamie",
          "last_name": "chow",
          "email": "email1",
          "photo_url": "http://www.somedomain.com/me.jpg",
          "is_admin": false
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual(
        {
          "status": 400,
          "message": "duplicate key value violates unique constraint \"users_pkey\""
        }
      );
    });
  });

  describe("Get /users/", function () {
    test("Gets all users", async function () {
      let response = await request(app)
        .get("/users/");

      expect(response.statusCode).toBe(200);
      expect(response.body.users[0]).toEqual( {
        "username": "user1",
        "first_name": "barry",
        "last_name": "james",
        "email": "email1"
      });
      expect(response.body.users.length).toEqual(5);
    });
  });

  describe("Get /users/:username", function () {
    test("Gets user by username", async function () {
      let response = await request(app)
        .get("/users/user3");

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toEqual( {
        "username": "user3",
        "first_name": "hector",
        "last_name": "achilles",
        "email": "email3",
        "photo_url": "photo3",
        "is_admin": false
      });
    });
    test("Does not get user that doesn't exist", async function () {
      let response = await request(app)
        .get("/users/user454");

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toEqual("There is no record for user454");
    });
  });


  describe("Update /users/:username", function () {
    test("Updates user by username IF authenticated", async function () {
      let response = await request(app)
        .patch("/users/user1")
        .send( {		
          "first_name": "changed again",
          "last_name": "this too",
          "email": "emailchanged",
          _token : testUserToken1
          }

        );

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toEqual( {
        "username": "user1",
        "first_name": "changed again",
        "last_name": "this too",
        "email": "emailchanged",
        "photo_url": "photo1"
      });
    })

    test("Fails for user that doesn't exist", async function () {
      let response = await request(app)
        .patch("/users/user454")
        .send({		
          "first_name": "changed again",
          "last_name": "this too",
          "email": "emailchanged2",
          _token : testUserToken1
          });

      expect(response.statusCode).toBe(401);
      // expect(response.body.message).toEqual("There is no record for user454, cannot update");
      expect(response.body).toEqual({ status: 401, message: "Unauthorized" });
    });
    
    test("Fails for when email is non-unique", async function () {
      let response = await request(app)
        .patch("/users/user1")
        .send({		
          "first_name": "changed again",
          "last_name": "this too",
          "email": "email3",
          _token : testUserToken1
          });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toEqual('duplicate key value violates unique constraint \"users_email_key\"');
    });

    test("Cannot update user IF NOT authenticated", async function () {
      let response = await request(app)
        .patch("/users/user1")
        .send( {		
          "first_name": "changed again",
          "last_name": "this too",
          "email": "emailchanged",
          });
      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ status: 401, message: "Unauthorized" });
    });
  });


  describe("DELETE /users/:username", function () {
    test("can delete user", async function () {
      let response = await request(app)
        .delete("/users/user1")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "message": "User deleted"
      });

      // Check we only have 4 users left now
      const users = await request(app)
        .get("/users")
        .send({_token: testUserToken1});
    
      expect(users.body.users.length).toEqual(4);
    });

    test("cannot delete user if non-existent username", async function () {
      let response = await request(app)
        .delete("/users/user1000")
        .send({_token: testUserToken1});

      expect(response.statusCode).toBe(401);
      // expect(response.body).toEqual({
      //   "status": 404,
      //   "message": "There is no user with an username: user1000"
      // });
      expect(response.body).toEqual({ status: 401, message: "Unauthorized" });
    });

    test("cannot delete user if NOT Authenticated", async function () {
      let response = await request(app)
        .delete("/users/user1000");

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ status: 401, message: "Unauthorized" });
    });

  });
});


afterAll(async function () {
  await db.end();
});
