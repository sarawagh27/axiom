const fs = require("fs");

function log(message) {
  const time = new Date()
    .toISOString()
    .replace("T", " ")
    .split(".")[0];

  fs.appendFileSync(
    "pingbomb.log",
    `[${time}] ${message}\n`
  );
}

module.exports = { log };
