const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../reminders.json");

// Ensure file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

// Read reminders
function getAllReminders() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

// Save reminders
function saveAllReminders(reminders) {
    fs.writeFileSync(filePath, JSON.stringify(reminders, null, 2));
}

// Add reminder
function addReminder(reminder) {
    const reminders = getAllReminders();
    reminders.push(reminder);
    saveAllReminders(reminders);
}

// Remove reminder by ID
function removeReminder(id) {
    let reminders = getAllReminders();
    reminders = reminders.filter(r => r.id !== id);
    saveAllReminders(reminders);
}

// Get reminders for user
function getUserReminders(userId) {
    const reminders = getAllReminders();
    return reminders.filter(r => r.userId === userId);
}

module.exports = {
    getAllReminders,
    saveAllReminders,
    addReminder,
    removeReminder,
    getUserReminders
};
