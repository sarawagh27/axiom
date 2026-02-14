require("dotenv").config();
require("./server");

const { Client, GatewayIntentBits } = require("discord.js");
const chrono = require("chrono-node");
const { DateTime } = require("luxon");
const { v4: uuidv4 } = require("uuid");

const {
  addReminder,
  getUserReminders,
  removeReminder
} = require("./reminders/reminderStore");

const {
  scheduleReminder,
  loadAndSchedule,
  cancelScheduled
} = require("./reminders/reminderScheduler");

const fs = require("fs");
const path = require("path");

const timezoneFile = path.join(__dirname, "timezones.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

// ===== TIMEZONE STORAGE =====

function loadTimezones() {
  if (!fs.existsSync(timezoneFile)) return {};
  return JSON.parse(fs.readFileSync(timezoneFile));
}

function saveTimezones(data) {
  fs.writeFileSync(timezoneFile, JSON.stringify(data, null, 2));
}

function getUserTimezone(userId) {
  const zones = loadTimezones();
  return zones[userId] || "UTC";
}

function setUserTimezone(userId, zone) {
  const zones = loadTimezones();
  zones[userId] = zone;
  saveTimezones(zones);
}

// ===== READY =====

client.once("clientReady", () => {
  console.log(`Bot online as ${client.user.tag}`);
  client.user.setActivity("Axiom Reminder Engine", { type: 0 });

  loadAndSchedule(client);
});

// ===== INTERACTION HANDLER =====

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ===============================
  // REMIND COMMAND
  // ===============================

  if (interaction.commandName === "remind") {

    const sub = interaction.options.getSubcommand();

    // ---- CREATE ----
    if (sub === "create") {

      const timeInput = interaction.options.getString("time");
      const text = interaction.options.getString("text");
      const user = interaction.options.getUser("user") || interaction.user;

      const timezone = getUserTimezone(interaction.user.id);

      const parsedDate = chrono.parseDate(timeInput, {
        timezone: timezone
      });

      if (!parsedDate) {
        return interaction.reply({
          content: "Invalid time format. Example: tomorrow 9:30pm, next Monday 5pm",
          ephemeral: true
        });
      }

      const targetTime = DateTime.fromJSDate(parsedDate, { zone: timezone });

      if (targetTime.toMillis() <= Date.now()) {
        return interaction.reply({
          content: "That time is in the past.",
          ephemeral: true
        });
      }

      const reminder = {
        id: uuidv4(),
        userId: user.id,
        text,
        time: targetTime.toMillis()
      };

      addReminder(reminder);
      scheduleReminder(client, reminder);

      await interaction.reply({
        content: `Reminder set for ${user.username} at ${targetTime.toFormat("ff")} (${timezone}).`,
        ephemeral: true
      });
    }

    // ---- LIST ----
    if (sub === "list") {

      const reminders = getUserReminders(interaction.user.id);

      if (!reminders.length) {
        return interaction.reply({
          content: "You have no active reminders.",
          ephemeral: true
        });
      }

      let message = "Your reminders:\n\n";

      reminders.forEach(r => {
        const time = DateTime.fromMillis(r.time).toFormat("ff");
        message += `ID: ${r.id}\nTime: ${time}\nText: ${r.text}\n\n`;
      });

      await interaction.reply({
        content: message,
        ephemeral: true
      });
    }

    // ---- CANCEL ----
    if (sub === "cancel") {

      const id = interaction.options.getString("id");

      const reminders = getUserReminders(interaction.user.id);

      const exists = reminders.find(r => r.id === id);

      if (!exists) {
        return interaction.reply({
          content: "Invalid reminder ID.",
          ephemeral: true
        });
      }

      removeReminder(id);
      cancelScheduled(id);

      await interaction.reply({
        content: "Reminder cancelled.",
        ephemeral: true
      });
    }
  }

  // ===============================
  // TIMEZONE COMMAND
  // ===============================

  if (interaction.commandName === "timezone") {

    const zone = interaction.options.getString("zone");

    if (!DateTime.now().setZone(zone).isValid) {
      return interaction.reply({
        content: "Invalid timezone. Example: Asia/Kolkata",
        ephemeral: true
      });
    }

    setUserTimezone(interaction.user.id, zone);

    await interaction.reply({
      content: `Timezone set to ${zone}.`,
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
