const { getAllReminders } = require("./reminderStore");

const scheduled = new Map();

function scheduleReminder(client, reminder) {

  const delay = reminder.time - Date.now();

  if (delay <= 0) return;

  const timeout = setTimeout(async () => {

    try {
      const user = await client.users.fetch(reminder.userId);

      await user.send(`⏰ Reminder:\n${reminder.text}`);

      scheduled.delete(reminder.id);

    } catch (err) {
      console.error("Failed to send reminder:", err);
    }

  }, delay);

  scheduled.set(reminder.id, timeout);
}

function loadAndSchedule(client) {

  const reminders = getAllReminders();

  reminders.forEach(reminder => {
    scheduleReminder(client, reminder);
  });
}

function cancelScheduled(reminderId) {
  const timeout = scheduled.get(reminderId);

  if (timeout) {
    clearTimeout(timeout);
    scheduled.delete(reminderId);
  }
}

module.exports = {
  scheduleReminder,
  loadAndSchedule,
  cancelScheduled
};
