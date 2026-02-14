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
  // BUTTON HANDLER
  // ==========================
  if (interaction.isButton()) {

    const parts = interaction.customId.split(":");

    // NAVIGATION BUTTONS
    if (parts[0] === "next" || parts[0] === "prev") {

      const action = parts[0];
      const userId = parts[1];
      let page = parseInt(parts[2]);

      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "You cannot control someone else's reminder view.",
          ephemeral: true
        });
      }

      if (action === "next") page++;
      if (action === "prev") page--;

      return updateReminderPage(interaction, page);
    }

    // CANCEL BUTTON
    if (parts[0] === "cancel") {

      const userId = parts[1];
      const reminderId = parts[2];
      const page = parseInt(parts[3]);

      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "You cannot cancel someone else's reminder.",
          ephemeral: true
        });
      }

      removeReminder(reminderId);
      cancelScheduled(reminderId);

      return updateReminderPage(interaction, page);
    }
  }

  if (!interaction.isChatInputCommand()) return;

  // ==========================
  // REMIND COMMAND
  // ==========================
  if (interaction.commandName === "remind") {

    const sub = interaction.options.getSubcommand();

    if (sub === "create") {

      const timeInput = interaction.options.getString("time");
      const text = interaction.options.getString("text");

      const parsedDate = chrono.parseDate(timeInput);

      if (!parsedDate) {
        return interaction.reply({
          content: "Invalid time format.",
          ephemeral: true
        });
      }

      const targetTime = DateTime.fromJSDate(parsedDate);

      if (targetTime.toMillis() <= Date.now()) {
        return interaction.reply({
          content: "That time is in the past.",
          ephemeral: true
        });
      }

      const reminder = {
        id: uuidv4(),
        userId: interaction.user.id,
        text,
        time: targetTime.toMillis()
      };

      addReminder(reminder);
      scheduleReminder(client, reminder);

      return interaction.reply({
        content: "Reminder created successfully.",
        ephemeral: true
      });
    }

    if (sub === "list") {
      return updateReminderPage(interaction, 0);
    }
  }
});


// ==============================
// PAGINATED VIEW WITH CANCEL
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
    .setTitle(`Your Reminders (Page ${page + 1}/${totalPages})`)
    .setColor(0x5865F2)
    .setTimestamp();

  const rows = [];

  currentReminders.forEach((r, index) => {

    const reminderTime = DateTime.fromMillis(r.time);
    const diff = reminderTime.diff(DateTime.now(), ["days", "hours", "minutes"]).toObject();
    const countdown = formatCountdown(diff);

    embed.addFields({
      name: `Reminder ${start + index + 1}`,
      value: `In: ${countdown}\nText: ${r.text}`
    });

    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`cancel:${interaction.user.id}:${r.id}:${page}`)
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      )
    );
  });

  const navRow = new ActionRowBuilder().addComponents(
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

  rows.push(navRow);

  if (interaction.isButton()) {
    return interaction.update({ embeds: [embed], components: rows });
  } else {
    return interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true
    });
  }
}


// ==============================
// COUNTDOWN
// ==============================

function formatCountdown(diff) {
  const parts = [];

  if (diff.days) parts.push(`${Math.floor(diff.days)}d`);
  if (diff.hours) parts.push(`${Math.floor(diff.hours)}h`);
  if (diff.minutes) parts.push(`${Math.floor(diff.minutes)}m`);

  if (!parts.length) return "Less than a minute";
  return parts.join(" ");
}

client.login(process.env.DISCORD_TOKEN);
