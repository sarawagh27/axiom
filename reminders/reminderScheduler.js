const { loadReminders, removeReminder } = require("./reminderStore");

let scheduled = new Map();

function scheduleReminder(client, reminder) {
  const delay = reminder.time - Date.now();

  if (delay <= 0) {
    executeReminder(client, reminder);
    return;
  }

  const timeout = setTimeout(() => {
    executeReminder(client, reminder);
  }, delay);

  scheduled.set(reminder.id, timeout);
}

async function executeReminder(client, reminder) {
  try {
    const user = await client.users.fetch(reminder.userId);

    if (!user) return;

    await user.send(`⏰ Reminder: ${reminder.text}`);

    removeReminder(reminder.id);
    scheduled.delete(reminder.id);

  } catch (err) {
    console.error("Reminder execution failed:", err);
  }
}

function loadAndSchedule(client) {
  const reminders = loadReminders();

  reminders.forEach(reminder => {
    scheduleReminder(client, reminder);
  });
}

function cancelScheduled(id) {
  if (scheduled.has(id)) {
    clearTimeout(scheduled.get(id));
    scheduled.delete(id);
  }
}

module.exports = {
  scheduleReminder,
  loadAndSchedule,
  cancelScheduled
};
