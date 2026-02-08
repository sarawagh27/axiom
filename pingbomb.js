const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { active } = require("./state");
const { log } = require("./logger");

async function handlePingbomb(i, client) {
  const sub = i.options.getSubcommand();

  /* ================= START ================= */
  if (sub === "start") {
    const targets = ["user", "user2", "user3"]
      .map(n => i.options.getUser(n))
      .filter(Boolean);

    if (!targets.length) {
      return i.reply({ content: "No users provided.", ephemeral: true });
    }

    const channelId = i.channel.id;
    let started = 0;

    const buttons = new ActionRowBuilder().addComponents(
      ...targets.map(u =>
        new ButtonBuilder()
          .setCustomId(`pingbomb_stop:${u.id}`)
          .setLabel(`Stop ${u.username}`)
          .setStyle(ButtonStyle.Danger)
      ),
      new ButtonBuilder()
        .setCustomId("pingbomb_stopall")
        .setLabel("Stop All")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await i.reply({
      content: `Pingbomb started for ${targets.length} user(s).`,
      components: [buttons],
      fetchReply: true,
    });

    for (const u of targets) {
      const key = `${i.guildId}:${u.id}`;

      const interval = setInterval(() => {
        i.channel.send(`<@${u.id}>`);
      }, 1500);

      const timeout = setTimeout(async () => {
        clearInterval(interval);
        active.delete(key);
        await disableButtons(client, channelId, msg.id);
        log(`Pingbomb auto-stopped for ${u.tag}`);
      }, 60_000);

      active.set(key, {
        interval,
        timeout,
        channelId,
        messageId: msg.id,
      });

      started++;
      log(`${i.user.tag} started pingbomb on ${u.tag}`);
    }

    return;
  }

  /* ================= STOP ONE ================= */
  if (sub === "stop") {
    const u = i.options.getUser("user");
    const key = `${i.guildId}:${u.id}`;
    const data = active.get(key);

    if (!data) {
      return i.reply({ content: "No active pingbomb for this user.", ephemeral: true });
    }

    clearInterval(data.interval);
    clearTimeout(data.timeout);
    active.delete(key);

    await disableButtons(client, data.channelId, data.messageId);
    log(`${i.user.tag} stopped pingbomb on ${u.tag}`);

    return i.reply({ content: "Pingbomb stopped.", ephemeral: true });
  }

  /* ================= STATUS ================= */
  if (sub === "status") {
    const count = active.size;
    return i.reply({
      content: count
        ? `Active pingbombs: ${count}`
        : "No active pingbombs.",
      ephemeral: true,
    });
  }
}

/* ================= BUTTON HANDLERS ================= */

async function handleButtons(i, client, OWNER_ID) {
  /* Stop one */
  if (i.customId.startsWith("pingbomb_stop:")) {
    const targetId = i.customId.split(":")[1];
    const key = `${i.guildId}:${targetId}`;
    const data = active.get(key);

    if (!data) {
      return i.reply({ content: "This pingbomb is already inactive.", ephemeral: true });
    }

    clearInterval(data.interval);
    clearTimeout(data.timeout);
    active.delete(key);

    await disableButtons(client, data.channelId, data.messageId);
    log(`${i.user.tag} stopped pingbomb on ${targetId}`);

    return i.reply({ content: "Pingbomb stopped.", ephemeral: true });
  }

  /* Stop all (owner only) */
  if (i.customId === "pingbomb_stopall") {
    if (i.user.id !== OWNER_ID) {
      return i.reply({
        content: "Only the bot owner can use this button.",
        ephemeral: true,
      });
    }

    for (const data of active.values()) {
      clearInterval(data.interval);
      clearTimeout(data.timeout);
      await disableButtons(client, data.channelId, data.messageId);
    }

    active.clear();
    log(`${i.user.tag} used STOP ALL`);

    return i.reply({ content: "All pingbombs stopped.", ephemeral: true });
  }
}

/* ================= DISABLE BUTTONS ================= */

async function disableButtons(client, channelId, messageId) {
  try {
    const channel = await client.channels.fetch(channelId);
    const message = await channel.messages.fetch(messageId);

    const disabled = message.components.map(row => {
      row.components.forEach(btn => btn.setDisabled(true));
      return row;
    });

    await message.edit({ components: disabled });
  } catch {
    // message deleted or missing — safe to ignore
  }
}

module.exports = {
  handlePingbomb,
  handleButtons,
};
