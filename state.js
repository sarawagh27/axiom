const fs = require("fs");
const { log } = require("./logger");

const STATE_FILE = "state.json";

// Users who opted in
const optIn = new Set();

// ACTIVE pingbombs (guild:user -> timers)
const active = new Map();

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return;

  const data = JSON.parse(fs.readFileSync(STATE_FILE));
  if (Array.isArray(data.optIn)) {
    data.optIn.forEach(k => optIn.add(k));
  }

  log("State restored (opt-ins loaded)");
}

function saveState() {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ optIn: [...optIn] }, null, 2)
  );
}

module.exports = {
  optIn,
  active,
  loadState,
  saveState
};
