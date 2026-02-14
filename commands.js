const { SlashCommandBuilder } = require("discord.js");

const commands = [

  // ===============================
  // PINGBOMB (KEEPING EXISTING STRUCTURE)
  // ===============================
  new SlashCommandBuilder()
    .setName("pingbomb")
    .setDescription("Controlled ping system")

    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start controlled ping session")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User to ping")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("text")
            .setDescription("Optional custom message")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("stop")
        .setDescription("Stop active ping session")
    )

    .addSubcommand(sub =>
      sub
        .setName("stopall")
        .setDescription("Stop all active ping sessions (Owner only)")
    )

    .addSubcommand(sub =>
      sub
        .setName("status")
        .setDescription("Check active ping sessions")
    )

    .toJSON(),

  // ===============================
  // REMINDER SYSTEM
  // ===============================
  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Reminder management system")

    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create a new reminder")
        .addStringOption(option =>
          option
            .setName("time")
            .setDescription("When to remind (e.g., tomorrow 9:30pm, next Monday 5pm)")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("text")
            .setDescription("What should be reminded?")
            .setRequired(true)
        )
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User to remind (optional)")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription("List your active reminders")
    )

    .addSubcommand(sub =>
      sub
        .setName("cancel")
        .setDescription("Cancel a reminder by ID")
        .addStringOption(option =>
          option
            .setName("id")
            .setDescription("Reminder ID from /remind list")
            .setRequired(true)
        )
    )

    .toJSON(),

  // ===============================
  // TIMEZONE SYSTEM
  // ===============================
  new SlashCommandBuilder()
    .setName("timezone")
    .setDescription("Set your timezone")
    .addStringOption(option =>
      option
        .setName("zone")
        .setDescription("Example: Asia/Kolkata, UTC, Europe/London")
        .setRequired(true)
    )
    .toJSON()

];

module.exports = commands;
