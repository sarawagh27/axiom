const chrono = require("chrono-node");

// Parse natural language time
function parseTime(input, timezone = "UTC") {
    const parsed = chrono.parseDate(input, new Date(), {
        forwardDate: true
    });

    if (!parsed) return null;

    return parsed;
}

module.exports = {
    parseTime
};
