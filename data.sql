\c jobly

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary REAL NOT NULL,
    equity REAL NOT NULL CHECK (equity<=1) CHECK (equity>=0),
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted timestamp with time zone DEFAULT current_timestamp
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

INSERT INTO companies (
                      handle,
                      name,
                      num_employees,
                      description, 
                      logo_url
                      )       
    VALUES ('appl','apple', '1000','apple computers','url1'),
            ('goog','google', '2000','google search','url2'),
            ('rithm','rithm school', '60','making developers','url3') ; 


INSERT INTO jobs (
                  title,
                  salary,
                  equity,
                  company_handle,
                  date_posted
                      )       
    VALUES ('Senior Software developer',160000, 0.1,'appl',current_timestamp),
            ('Junior Software developer',110000, 0,'appl',current_timestamp),
            ('Front end developer',120000, 0.05,'rithm',current_timestamp),
            ('Marketing manager',120000, 0.05, 'goog',current_timestamp);


INSERT INTO users (
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
            ('user5','password5', 'arthur','happy','email5', 'photo5', FALSE);