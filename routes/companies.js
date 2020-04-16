const express = require("express");
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companyschema.json");
const mergedCompanyData = require("../helpers/companyMerge");

const router = new express.Router();

/** GET /companies => {companies: [companyData, ...]}  */

router.get("/", async function (req, res, next) {
  const searchTerms = req.query;
  let companies;
  
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

/** POST
 * Creates a new company and returns JSON of {company: companyData}
 */
router.post("/", async function (req, res, next) {
  
  try {
    let data = jsonschema.validate(req.body, companySchema);
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

/** GET 
 * OLD REQUIREMENT
 * This should return a single company found by its id.
 * This should return JSON of {company: companyData}
 * 
 * NEW REQUIREMENT
 * This should return a single company found by its id. It should also return a key of jobs which is an array of jobs that belong to that company: {company: {...companyData, jobs: [job, ...]}}
 */
router.get("/:handle", async function (req, res, next) {
  try{
    const handle = req.params.handle;
    const company = await Company.getOne(handle);
    const jobs = await Company.getJobs(handle);
    company.jobs = jobs;
    return res.json({ company });
  }catch(err){
    return next(err)
  }
});

/** PATCH
 * This should update an existing company and return the updated company.
 * This should return JSON of {company: companyData}
 */
router.patch("/:handle", async function (req, res, next) {
  let data;

  try{

    if (Object.keys(req.body).length === 0) {
      throw new ExpressError('Need data to patch', 400);
    }
    // User may patch any values, however, we require handle and name in 
    // order to validate the patch. Therefore, we have created a helper function
    // that will merge the existing company data with the new patched company 
    // data, and we call jsonscheme validate on that merged data. 

    // USE companyPatch.json for PATCH (required handle, not required name)*******
    const handleCompany = await Company.getOne(req.params.handle);
    const validationData = mergedCompanyData(handleCompany, req.body);

    data = jsonschema.validate(validationData, companySchema);

    if (!data.valid) {
      return next({
        status: 400,
        error: data.errors.map(e => e.stack)
      });
    }

    let company = await Company.patchCompany(req.body, req.params.handle);
    return res.status(201).json({ company });
  }catch(err){
    return next(err)
  }
});

/** DELETE
 * This should remove an existing company and return a message.
 * This should return JSON of {message: "Company deleted"}
 */
router.delete("/:handle", async function (req, res, next) {
  let data;

  try {
    let deletedHandle = await Company.deleteCompany(req.params.handle);
    return res.status(200).json({message: "Company deleted"});
  }catch(err){
    return next(err)
  }
});

module.exports = router;
