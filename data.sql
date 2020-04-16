\c jobly

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
    company_handle text NOT NULL REFERENCES companies,
    date_posted timestamp with time zone
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
                  id,
                  title,
                  salary,
                  equity,
                  company_handle,
                  date_posted
                      )       
    VALUES ('appl','apple', '1000','apple computers','url1'),
            ('goog','google', '2000','google search','url2'),
            ('rithm','rithm school', '60','making developers','url3') ; 