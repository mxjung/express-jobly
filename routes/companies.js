const express = require("express");
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companyschema.json")

const router = new express.Router();

/** GET /companies => {companies: [companyData, ...]}  */

router.get("/", async function (req, res, next) {
  const searchTerms = req.query;
  let companies;
  // console.log('our req.params is: ', searchTerms);
  // console.log('our req.params legnth is: ', Object.keys(searchTerms).length);
  
  try {
    if (Object.keys(searchTerms).length === 0) {
      companies = await Company.getAll();
    } else {
      companies = await Company.getFiltered(searchTerms);       
    }
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/**
 * Creates a new company and returns JSON of {company: companyData}
 */
router.post("/", async function (req, res, next) {
  let data;
  try {
    data = jsonschema.validate(req.body, companySchema);
    if (!data.valid) {
      return next({
        status: 400,
        error: data.errors.map(e => e.stack)
      });
    }

    let company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/**
 * Creates a new company and returns JSON of {company: companyData}
 */
router.get("/:handle", async function (req, res, next) {
  try{
    const handle = req.params.handle;
    const company = await Company.getOne(handle);
    
    return res.json({ company });
  }catch(err){
    return next(err)
  }
});

module.exports = router;
