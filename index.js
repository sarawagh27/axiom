require("dotenv").config();
require("./server");

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== CONFIG =====
const ALLOWED_ROLE = "PingMaster";
const PING_INTERVAL_MS = 2000;   // 2 seconds (fastest safe)
const MAX_DURATION_MS = 60_000;  // 60 seconds

// ===== STATE =====
const optIn = new Set();   // key: guildId:userId
const active = new Map(); // key: guildId:userId -> { interval, timeout }

// ===== READY =====
// ===== READY =====
client.once("clientReady", () => {
  loadState();

  log(`Bot online as ${client.user.tag}`);

  // Clean Minimal Status
  client.user.setActivity("⚡ Axiom Engine", {
    type: 0, // Playing
  });
});

// ===== COMMAND HANDLER =====
client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;
  if (i.commandName !== "pingbomb") return;

  // 🔒 Role check
  const member = await i.guild.members.fetch(i.user.id);
  if (!member.roles.cache.some(r => r.name === ALLOWED_ROLE)) {
    return i.reply({
      content: "❌ You need the **PingMaster** role to use this command.",
      ephemeral: true
    });
  }

  const sub = i.options.getSubcommand();

  // 🚨 STOP ALL (EMERGENCY)
  if (sub === "stopall") {
    let count = 0;

    for (const { interval, timeout } of active.values()) {
      clearInterval(interval);
      clearTimeout(timeout);
      count++;
    }

    active.clear();

    return i.reply({
      content: `🚨 Emergency stop activated. Stopped ${count} pingbomb(s).`,
      ephemeral: true
    });
  }

  // All other subcommands need a user
  const user = i.options.getUser("user");
  const key = `${i.guild.id}:${user.id}`;

  // ✅ OPT-IN
  if (sub === "optin") {
    optIn.add(key);
    return i.reply({
      content: `✅ ${user.username} has opted in.`,
      ephemeral: true
    });
  }

  // ▶️ START
  if (sub === "start") {
    if (!optIn.has(key)) {
      return i.reply({
        content: "❌ Target user has not opted in.",
        ephemeral: true
      });
    }

    if (active.has(key)) {
      return i.reply({
        content: "⚠️ Pingbomb is already running for this user.",
        ephemeral: true
      });
    }

    const interval = setInterval(() => {
      i.channel.send(`${user}`);
    }, PING_INTERVAL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      active.delete(key);
    }, MAX_DURATION_MS);

    active.set(key, { interval, timeout });

    return i.reply({
      content: "🚨 Pingbomb started (auto-stops after 60 seconds).",
      ephemeral: true
    });
  }

  // ⏹️ STOP ONE
  if (sub === "stop") {
    const data = active.get(key);

    if (!data) {
      return i.reply({
        content: "ℹ️ No active pingbomb for this user.",
        ephemeral: true
      });
    }

    clearInterval(data.interval);
    clearTimeout(data.timeout);
    active.delete(key);

    return i.reply({
      content: "⏹️ Pingbomb stopped.",
      ephemeral: true
    });
  }
});

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
