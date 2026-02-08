const { Client, GatewayIntentBits } = require("discord.js");
const { TOKEN, OWNER_ID } = require("./config");
const { handlePingbomb, handleButtons } = require("./pingbomb");
const { loadState } = require("./state");
const { log } = require("./logger");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  loadState();
  log(`Bot online as ${client.user.tag}`);
});

client.on("interactionCreate", async i => {
  try {
    if (i.isChatInputCommand()) {
      if (i.commandName === "pingbomb") {
        await handlePingbomb(i, client);
      }
      return;
    }

    if (i.isButton()) {
      await handleButtons(i, client, OWNER_ID);
    }
  } catch (err) {
    console.error(err);
    if (!i.replied) {
      i.reply({ content: "An error occurred.", ephemeral: true });
    }
  }
});

client.login(TOKEN);
  