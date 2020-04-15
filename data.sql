\c jobly

DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
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