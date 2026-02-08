require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("pingbomb")
    .setDescription("High-speed pingbomb controls (auto-stops after 60 seconds)")

    .addSubcommand(sub =>
      sub
        .setName("optin")
        .setDescription("Allow a user to receive pingbombs")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User opting in")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start a 60-second high-speed pingbomb")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("Primary target")
            .setRequired(true)
        )
        .addUserOption(option =>
          option
            .setName("user2")
            .setDescription("Optional second target")
        )
        .addUserOption(option =>
          option
            .setName("user3")
            .setDescription("Optional third target")
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("stop")
        .setDescription("Stop an active pingbomb for a user")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User whose pingbomb should stop")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("status")
        .setDescription("Show currently active pingbombs")
    )

    .addSubcommand(sub =>
      sub
        .setName("stopall")
        .setDescription("Emergency: stop all active pingbombs (owner only)")
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Pingbomb slash commands registered");
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
})();
