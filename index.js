require("dotenv").config();
require("./server");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

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


// ==============================
// TIMEZONE SYSTEM
// ==============================

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


// ==============================
// READY
// ==============================

client.once("clientReady", () => {
  console.log(`Bot online as ${client.user.tag}`);
  client.user.setActivity("Axiom Reminder Engine", { type: 0 });
  loadAndSchedule(client);
});


// ==============================
// INTERACTION HANDLER
// ==============================

client.on("interactionCreate", async interaction => {

  // ==========================
  // BUTTON INTERACTIONS
  // ==========================
  if (interaction.isButton()) {

    const [action, userId, pageStr] = interaction.customId.split(":");

    if (interaction.user.id !== userId) {
      return interaction.reply({
        content: "You cannot control someone else's reminder view.",
        ephemeral: true
      });
    }

    let page = parseInt(pageStr);

    if (action === "next") page++;
    if (action === "prev") page--;

    return updateReminderPage(interaction, page);
  }

  if (!interaction.isChatInputCommand()) return;

  // ==========================
  // REMIND COMMAND
  // ==========================
  if (interaction.commandName === "remind") {

    const sub = interaction.options.getSubcommand();

    // ---------- CREATE ----------
    if (sub === "create") {

      const timeInput = interaction.options.getString("time");
      const text = interaction.options.getString("text");
      const user = interaction.options.getUser("user") || interaction.user;

      const timezone = getUserTimezone(interaction.user.id);
      const parsedDate = chrono.parseDate(timeInput);

      if (!parsedDate) {
        return interaction.reply({
          content: "Invalid time format.",
          ephemeral: true
        });
      }

      const targetTime = DateTime.fromJSDate(parsedDate).setZone(timezone);

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
        content: `Reminder set for ${user.username}.`,
        ephemeral: true
      });
    }

    // ---------- LIST ----------
    if (sub === "list") {
      return updateReminderPage(interaction, 0);
    }

    // ---------- CANCEL ----------
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

  // ==========================
  // TIMEZONE
  // ==========================
  if (interaction.commandName === "timezone") {

    const zone = interaction.options.getString("zone");

    if (!DateTime.now().setZone(zone).isValid) {
      return interaction.reply({
        content: "Invalid timezone.",
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


// ==============================
// PAGINATED LIST SYSTEM
// ==============================

async function updateReminderPage(interaction, page) {

  let reminders = getUserReminders(interaction.user.id);

  if (!reminders.length) {
    return interaction.reply({
      content: "You have no active reminders.",
      ephemeral: true
    });
  }

  reminders.sort((a, b) => a.time - b.time);

  const perPage = 5;
  const totalPages = Math.ceil(reminders.length / perPage);

  if (page < 0) page = 0;
  if (page >= totalPages) page = totalPages - 1;

  const start = page * perPage;
  const end = start + perPage;
  const currentReminders = reminders.slice(start, end);

  const embed = new EmbedBuilder()
    .setTitle(`Your Active Reminders (Page ${page + 1}/${totalPages})`)
    .setColor(0x5865F2)
    .setTimestamp();

  currentReminders.forEach((r, index) => {
    const reminderTime = DateTime.fromMillis(r.time);
    const diff = reminderTime.diff(DateTime.now(), ["days", "hours", "minutes", "seconds"]).toObject();
    const countdown = formatCountdown(diff);

    embed.addFields({
      name: `Reminder ${start + index + 1}`,
      value: `ID: \`${r.id}\`\nIn: ${countdown}\nText: ${r.text}`
    });
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`prev:${interaction.user.id}:${page}`)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId(`next:${interaction.user.id}:${page}`)
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1)
  );

  if (interaction.isButton()) {
    return interaction.update({ embeds: [embed], components: [row] });
  } else {
    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
}


// ==============================
// COUNTDOWN FORMATTER
// ==============================

function formatCountdown(diff) {
  const parts = [];

  if (diff.days) parts.push(`${Math.floor(diff.days)}d`);
  if (diff.hours) parts.push(`${Math.floor(diff.hours)}h`);
  if (diff.minutes) parts.push(`${Math.floor(diff.minutes)}m`);
  if (diff.seconds) parts.push(`${Math.floor(diff.seconds)}s`);

  if (!parts.length) return "Less than a minute";
  return parts.join(" ");
}

client.login(process.env.DISCORD_TOKEN);
