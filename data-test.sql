\c jobly-test

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
    date_posted timestamp with time zone
);