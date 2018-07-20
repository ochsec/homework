const parse = require('csv-parse');
const stringify = require('csv-stringify');
const fs = require('fs');

const csvReadOpts = {
  cast: true,
  from: 2,
};

var slcspData = [];
var zipData = [];
var planData = [];

class Slcsp {
  constructor(zip) {
    this.zip = zip;
    this.rate = null;
  }
}

class Zip {
  constructor(zip, state, countyCode, name, rateArea) {
    this.zip = zip;
    this.state = state;
    this.countyCode = countyCode;
    this.name = name;
    this.rateArea = rateArea;
  }
}

class Plan {
	constructor(planId, state, metalLevel, rate, rateArea) {
		this.planId = planId;
		this.state = state;
		this.metalLevel = metalLevel;
		this.rate = rate;
		this.rateArea = rateArea;
	}
}

function readCsv(fileName, options, callback) {
  return new Promise(resolve => {
    fs.createReadStream(fileName)
    .pipe(parse(options))
    .on('data', callback)
    .on('end', function() { resolve(); });
  });
}

var p1 = readCsv('./slcsp.csv', csvReadOpts, function(data) {
  slcspData.push(new Slcsp(...data));
});

var p2 = readCsv('./zips.csv', csvReadOpts, function(data) {
  zipData.push(new Zip(...data));
});

var p3 = readCsv('./plans.csv', csvReadOpts, function(data) {
  planData.push(new Plan(...data));
});

function getPlans(zipGroups) {
  const silverPlans = planData.filter(p => p.metalLevel == 'Silver');
  let rates = [];

  zipGroups.forEach(grp => {
    const zipcode = grp[0].zip;
    let plans = [];
    let rateAreas = [...new Set(grp.map(ra => ra.rateArea))];

    grp.forEach(area => {
      let matches = silverPlans.filter(p => p.state == area.state && p.rateArea == area.rateArea);
      plans = plans.concat(matches);
    });

    if (plans.length < 2 || rateAreas.length > 1) {
      rates.push([zipcode, null]);
    } else {
      const prices = plans.map(p => p.rate);
      const rate = prices.sort((a, b) => a - b)[1];
      rates.push([zipcode, rate]);
    }
  });

  writeCsv(['zipcode', 'rate'], rates);
}

function writeCsv(columns, rates) {
  stringify(rates, { header: true, columns: columns }, (err, output) => {
    fs.writeFile('./slcsp.csv', output, (err) => {
      if (err) throw err;
      console.log('slcsp.csv updated.');
    });
  });
}

Promise.all([p1, p2, p3]).then(() => {
  getPlans(slcspData.map(slcsp => {
    return zipData.filter(x => x.zip == slcsp.zip);
  }));
});
