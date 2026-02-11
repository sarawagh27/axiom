// 🔴 STEP 1.5 — ADD THIS LINE (VERY TOP)
require("./server");

// ================== EXISTING CODE ==================

const { Client, GatewayIntentBits } = require("discord.js");
const { loadState } = require("./state");
const { log } = require("./logger");
const { handlePingbomb } = require("./pingbomb");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// When bot becomes ready
client.once("clientReady", () => {
  loadState();
  log(`Bot online as ${client.user.tag}`);
});

// Slash command handler
client.on("interactionCreate", async (i) => {
  try {
    if (i.isChatInputCommand()) {
      if (i.commandName === "pingbomb") {
        await handlePingbomb(i, client);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// Login (IMPORTANT: env variable)
client.login(process.env.DISCORD_TOKEN);
