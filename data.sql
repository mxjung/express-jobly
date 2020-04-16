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
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
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