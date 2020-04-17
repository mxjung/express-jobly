const express = require("express");
const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobschema.json");
const jobPatchSchema = require("../schemas/jobPatch.json");
const { ensureLoggedIn,
        ensureAdmin } = require('../middleware/authenticate');

const router = new express.Router();

/** POST
 * Creates a new job and returns JSON of {job: jobData}
 */
router.post("/", 
  ensureAdmin, 
  async function (req, res, next) {

    try {
      let data = jsonschema.validate(req.body, jobSchema);
      if (!data.valid) {
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

/** GET /jobs => {jobs: [job, ...]}  */

router.get("/", 
  ensureLoggedIn,
  async function (req, res, next) {
  const searchTerms = req.query;
  let jobs;

  try {
    if (Object.keys(searchTerms).length === 0) {
      jobs = await Job.getAll();
    } else {
      jobs = await Job.getFiltered(searchTerms);
    }

    // If no jobs, just return empty object
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET 
 * This should return a single job found by its id.
 * This should return JSON of {job: jobData}
 */
router.get("/:id", 
  ensureLoggedIn,
  async function (req, res, next) {

  try {
    const id = Number(req.params.id);
    const job = await Job.getOne(id);

    return res.json({ job });
  } catch (err) {
    return next(err)
  }
});

/** PATCH
 * This should update an existing job and return the updated job.
 * This should return JSON of {job: jobData}
 */
router.patch("/:id", 
  ensureAdmin,
  async function (req, res, next) {

    try {

      if (Object.keys(req.body).length === 1) {
        throw new ExpressError('Need data to patch', 400);
      }

      let data = jsonschema.validate(req.body, jobPatchSchema);

      if (!data.valid) {
        return next({
          status: 400,
          message: data.errors.map(e => e.stack)
        });
      }

      let job = await Job.patchJob(req.body, req.params.id);
      // updateJob (patch not good name)********
      return res.status(201).json({ job });
      // 200 ok*********** (201 for created)
    } catch (err) {
      return next(err)
    }
  });

/** DELETE
 * This should remove an existing job and return a message.
 * This should return JSON of {message: "Job deleted"}
 */
router.delete("/:id", 
  ensureAdmin,
  async function (req, res, next) {
    try {
      await Job.deleteJob(req.params.id);
      return res.json({ message: "Job deleted" });
    } catch (err) {
      return next(err)
    }
  });

module.exports = router;
