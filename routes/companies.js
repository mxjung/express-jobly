const express = require("express");
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");

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

module.exports = router;
