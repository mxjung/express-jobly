const express = require("express");
const Company = require("../models/company");
const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobschema.json");


const router = new express.Router();

/** POST
 * Creates a new job and returns JSON of {job: jobData}
 */
router.post("/", async function (req, res, next) {
  
  try {
    let data = jsonschema.validate(req.body, jobSchema);
    if (!data.valid) {
      console.log(data.errors)
      return next({
        status: 400,
        message: data.errors.map(e => e.stack)
      });
    }

    let job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
