require("dotenv").config();

module.exports = {
  TOKEN: process.env.TOKEN,
  OWNER_ID: process.env.OWNER_ID,
  ALLOWED_ROLE: "PingMaster",

  PING_INTERVAL_MS: 2000,
  MAX_DURATION_MS: 60_000,
  COOLDOWN_MS: 5 * 60 * 1000,
};
