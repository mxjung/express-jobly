const expressError = require('./expressError');

function mergeCompanyData(existingData, newData) {
  let mergeData = {};
  for (let key in existingData) {
    if (key in newData) {
      mergeData[key] = newData[key];
    } else {
      mergeData[key] = existingData[key];
    }
  }
  return mergeData;
}


module.exports = mergeCompanyData;